import { readFile } from "node:fs/promises";
import YAML from "yaml";
import type { ToolDefinition } from "../types.js";
import { CliError } from "../utils/errors.js";
import { listYamlFiles } from "../utils/filesystem.js";
import { validateToolSchema } from "./validate-tool-schema.js";

export async function loadTools(configPath: string): Promise<ToolDefinition[]> {
  const files = await listYamlFiles(configPath);
  const tools: ToolDefinition[] = [];
  const providers = new Set<string>();

  for (const file of files) {
    const raw = await readFile(file, "utf8");
    let parsed: unknown;

    try {
      parsed = YAML.parse(raw);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new CliError(`Invalid YAML syntax in ${file}: ${message}`);
    }

    const tool = validateToolSchema(parsed, file);

    if (providers.has(tool.provider)) {
      throw new CliError(
        `Duplicate tool provider "${tool.provider}" found in ${file}`,
      );
    }

    providers.add(tool.provider);
    tools.push(tool);
  }

  return tools;
}

export function findTool(
  tools: ToolDefinition[],
  provider: string,
): ToolDefinition {
  const tool = tools.find((candidate) => candidate.provider === provider);

  if (!tool) {
    throw new CliError(
      `Unknown tool "${provider}". Run secops-cli to list available tools.`,
      2,
    );
  }

  return tool;
}

export function findFunction(tool: ToolDefinition, functionName: string) {
  const toolFunction = tool.functions[functionName];

  if (!toolFunction) {
    throw new CliError(
      `Unknown function "${functionName}" for tool "${tool.provider}". Run secops-cli ${tool.provider} --help.`,
      2,
    );
  }

  return toolFunction;
}
