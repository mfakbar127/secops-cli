import pc from "picocolors";
import type { ArgDefinition, ToolDefinition } from "../types.js";

export function formatList(tools: ToolDefinition[]): string {
  if (tools.length === 0) {
    return "No tools found. Add .yml files to ./tools or pass --config-path <path>.";
  }

  const lines = [pc.bold("Available SecOps tools"), ""];

  for (const tool of tools) {
    lines.push(
      `${pc.cyan(tool.provider)}${tool.name ? ` - ${tool.name}` : ""}`,
    );
    if (tool.description) {
      lines.push(`  ${tool.description}`);
    }

    for (const [functionName, toolFunction] of Object.entries(tool.functions)) {
      lines.push(
        `  ${pc.green(functionName)}${toolFunction.description ? ` - ${toolFunction.description}` : ""}`,
      );
      const requiredArgs = Object.entries(toolFunction.args ?? {})
        .filter(([, definition]) => definition.required)
        .map(([name]) => `--${name}`);
      if (requiredArgs.length > 0) {
        lines.push(`    required: ${requiredArgs.join(", ")}`);
      }
    }

    lines.push("");
  }

  lines.push("Examples:");
  lines.push("  secops-cli <tool> --help");
  lines.push("  secops-cli <tool> <function> --help");
  lines.push("  secops-cli <tool> <function> --arg value");

  return lines.join("\n");
}

export function formatArgs(
  args: Record<string, ArgDefinition> | undefined,
): string[] {
  const entries = Object.entries(args ?? {});
  if (entries.length === 0) {
    return ["  No arguments."];
  }

  return entries.map(([name, definition]) => {
    const markers: string[] = [definition.type];
    if (definition.required) {
      markers.push("required");
    }
    if (definition.default !== undefined) {
      markers.push(`default: ${String(definition.default)}`);
    }
    return `  --${name} (${markers.join(", ")})${definition.description ? ` - ${definition.description}` : ""}`;
  });
}
