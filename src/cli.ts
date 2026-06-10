#!/usr/bin/env node
import { runTool } from "./commands/run-tool.js";
import { loadEnv } from "./config/load-env.js";
import { findFunction, findTool, loadTools } from "./config/load-tools.js";
import { formatError } from "./output/format-error.js";
import { formatFunctionHelp, formatToolHelp } from "./output/format-help.js";
import { formatList } from "./output/format-list.js";
import { formatResult } from "./output/format-result.js";
import { CliError, UsageError } from "./utils/errors.js";

async function main(rawArgs: string[]): Promise<void> {
  try {
    const { configPath, tokens } = parseCliArgs(rawArgs);

    if (tokens.length === 1 && (tokens[0] === "--help" || tokens[0] === "-h")) {
      console.log(formatTopLevelHelp(configPath));
      return;
    }

    await loadEnv(configPath);
    const tools = await loadTools(configPath);

    if (tokens.length === 0) {
      console.log(formatList(tools));
      return;
    }

    const [provider, functionName, ...rest] = tokens;
    if (!provider) {
      console.log(formatList(tools));
      return;
    }

    if (
      functionName === "--help" ||
      functionName === "-h" ||
      functionName === undefined
    ) {
      const tool = findTool(tools, provider);
      console.log(formatToolHelp(tool));
      return;
    }

    if (rest.includes("--help") || rest.includes("-h")) {
      const tool = findTool(tools, provider);
      findFunction(tool, functionName);
      console.log(formatFunctionHelp(tool, functionName));
      return;
    }

    const result = await runTool(tools, provider, functionName, rest);
    const output = formatResult(result);
    if (output) {
      console.log(output);
    }
    if (!result.ok) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(formatError(error));
    process.exitCode = error instanceof CliError ? error.exitCode : 1;
  }
}

function parseCliArgs(rawArgs: string[]): {
  configPath: string;
  tokens: string[];
} {
  let configPath = process.cwd();
  const tokens: string[] = [];

  for (let index = 0; index < rawArgs.length; index += 1) {
    const token = rawArgs[index];
    if (!token) {
      continue;
    }

    if (token === "--config-path") {
      const value = rawArgs[index + 1];
      if (!value || value.startsWith("--")) {
        throw new UsageError("--config-path requires a directory value.");
      }
      configPath = value;
      index += 1;
      continue;
    }

    if (token.startsWith("--config-path=")) {
      const value = token.slice("--config-path=".length);
      if (!value) {
        throw new UsageError("--config-path requires a directory value.");
      }
      configPath = value;
      continue;
    }

    tokens.push(token);
  }

  return { configPath, tokens };
}

function formatTopLevelHelp(configPath: string): string {
  return [
    "secops-cli v0.1.0",
    "Run configurable SecOps HTTP tool actions from YAML files.",
    "",
    "Usage:",
    "  secops-cli [--config-path <path>]",
    "  secops-cli <tool> --help [--config-path <path>]",
    "  secops-cli <tool> <function> --help [--config-path <path>]",
    "  secops-cli <tool> <function> [--arg value ...] [--config-path <path>]",
    "",
    "Options:",
    `  --config-path <path>  Directory containing tools/ or YAML files. Default: ${configPath}`,
  ].join("\n");
}

process.on("SIGINT", () => {
  process.exit(130);
});

void main(process.argv.slice(2));
