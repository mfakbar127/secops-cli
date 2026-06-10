import type { ResolvedArgs, TemplateValue } from "../types.js";
import { CliError } from "../utils/errors.js";

export function interpolateValues(
  value: TemplateValue | undefined,
  args: ResolvedArgs,
): TemplateValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    return interpolateString(value, args);
  }

  if (Array.isArray(value)) {
    return value.map((item) => interpolateValues(item, args) ?? null);
  }

  if (value && typeof value === "object") {
    const result: Record<string, TemplateValue> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      result[key] = interpolateValues(nestedValue, args) ?? null;
    }
    return result;
  }

  return value;
}

function interpolateString(value: string, args: ResolvedArgs): string {
  return value.replace(
    /\$\{(args|env)\.([A-Za-z_][A-Za-z0-9_]*)\}/g,
    (_match, scope: string, name: string) => {
      if (scope === "args") {
        const argValue = args[name];
        if (argValue === undefined) {
          throw new CliError(`Missing interpolation argument "${name}".`);
        }
        return String(argValue);
      }

      const envValue = process.env[name];
      if (envValue === undefined || envValue === "") {
        throw new CliError(
          `Missing environment value "${name}". Set it in .env or system environment.`,
        );
      }

      return envValue;
    },
  );
}
