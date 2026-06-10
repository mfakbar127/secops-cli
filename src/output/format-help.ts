import pc from "picocolors";
import type { ToolDefinition } from "../types.js";
import { formatArgs } from "./format-list.js";

export function formatToolHelp(tool: ToolDefinition): string {
  const lines = [
    `${pc.bold(tool.provider)}${tool.name ? ` - ${tool.name}` : ""}`,
  ];
  if (tool.description) {
    lines.push("", tool.description);
  }
  lines.push("", pc.bold("Functions:"));

  for (const [functionName, toolFunction] of Object.entries(tool.functions)) {
    lines.push(
      `  ${pc.green(functionName)}${toolFunction.description ? ` - ${toolFunction.description}` : ""}`,
    );
  }

  lines.push("", "Usage:");
  lines.push(`  secops-cli ${tool.provider} <function> [args]`);
  lines.push(`  secops-cli ${tool.provider} <function> --help`);

  return lines.join("\n");
}

export function formatFunctionHelp(
  tool: ToolDefinition,
  functionName: string,
): string {
  const toolFunction = tool.functions[functionName];
  if (!toolFunction) {
    return `Unknown function "${functionName}" for tool "${tool.provider}".`;
  }

  const lines = [pc.bold(`${tool.provider} ${functionName}`)];
  if (toolFunction.description) {
    lines.push("", toolFunction.description);
  }
  lines.push("", pc.bold("Arguments:"));
  lines.push(...formatArgs(toolFunction.args));
  lines.push("", "Usage:");
  lines.push(
    `  secops-cli ${tool.provider} ${functionName}${usageArgs(toolFunction.args)}`,
  );

  return lines.join("\n");
}

function usageArgs(args: ToolDefinition["functions"][string]["args"]): string {
  const entries = Object.entries(args ?? {});
  if (entries.length === 0) {
    return "";
  }

  return ` ${entries.map(([name]) => `--${name} <value>`).join(" ")}`;
}
