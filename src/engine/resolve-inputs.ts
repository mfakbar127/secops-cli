import type { ArgDefinition, ResolvedArgs } from "../types.js";
import { UsageError } from "../utils/errors.js";

export function parseNamedArgs(
  tokens: string[],
): Record<string, string | boolean> {
  const parsed: Record<string, string | boolean> = {};

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (!token?.startsWith("--")) {
      throw new UsageError(
        `Unexpected argument "${token ?? ""}". Arguments must use --name value format.`,
      );
    }

    const rawName = token.slice(2);
    if (!rawName) {
      throw new UsageError("Empty argument name is not supported.");
    }

    const equalsIndex = rawName.indexOf("=");
    if (equalsIndex >= 0) {
      const name = rawName.slice(0, equalsIndex);
      const value = rawName.slice(equalsIndex + 1);
      parsed[name] = value;
      continue;
    }

    const next = tokens[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[rawName] = true;
      continue;
    }

    parsed[rawName] = next;
    index += 1;
  }

  return parsed;
}

export function resolveInputs(
  argDefinitions: Record<string, ArgDefinition> | undefined,
  rawArgs: Record<string, string | boolean>,
): ResolvedArgs {
  const definitions = argDefinitions ?? {};
  const allowedNames = new Set(Object.keys(definitions));
  const resolved: ResolvedArgs = {};

  for (const name of Object.keys(rawArgs)) {
    if (!allowedNames.has(name)) {
      throw new UsageError(`Unknown argument "--${name}".`);
    }
  }

  for (const [name, definition] of Object.entries(definitions)) {
    const rawValue = rawArgs[name] ?? definition.default;

    if (rawValue === undefined) {
      if (definition.required) {
        throw new UsageError(`Missing required argument "--${name}".`);
      }
      continue;
    }

    resolved[name] = coerceValue(name, rawValue, definition.type);
  }

  return resolved;
}

function coerceValue(
  name: string,
  value: string | number | boolean,
  type: ArgDefinition["type"],
): string | number | boolean {
  if (type === "string") {
    if (typeof value === "boolean") {
      throw new UsageError(`Argument "--${name}" requires a string value.`);
    }
    return String(value);
  }

  if (type === "number") {
    if (typeof value === "boolean") {
      throw new UsageError(`Argument "--${name}" requires a number value.`);
    }

    const numberValue = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numberValue)) {
      throw new UsageError(`Argument "--${name}" must be a valid number.`);
    }

    return numberValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    throw new UsageError(`Argument "--${name}" must be true or false.`);
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new UsageError(`Argument "--${name}" must be true or false.`);
}
