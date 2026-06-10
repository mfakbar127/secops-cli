import { findFunction, findTool } from "../config/load-tools.js";
import { executeHttp } from "../engine/execute-http.js";
import { parseNamedArgs, resolveInputs } from "../engine/resolve-inputs.js";
import type { ToolDefinition } from "../types.js";

export async function runTool(
  tools: ToolDefinition[],
  provider: string,
  functionName: string,
  tokens: string[],
) {
  const tool = findTool(tools, provider);
  const toolFunction = findFunction(tool, functionName);
  const rawArgs = parseNamedArgs(tokens);
  const args = resolveInputs(toolFunction.args, rawArgs);

  return executeHttp(toolFunction.request, args);
}
