import { z } from "zod";
import type { HttpMethod, ToolDefinition } from "../types.js";
import { CliError } from "../utils/errors.js";

const templateValueSchema: z.ZodType = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(templateValueSchema),
    z.record(templateValueSchema),
  ]),
);

const argDefinitionSchema = z
  .object({
    type: z.enum(["string", "number", "boolean"]),
    description: z.string().optional(),
    required: z.boolean().optional(),
    default: z.union([z.string(), z.number(), z.boolean()]).optional(),
  })
  .strict();

const requestDefinitionSchema = z
  .object({
    method: z
      .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
      .transform((method) => method.toUpperCase()),
    url: z.string().min(1),
    headers: z.record(templateValueSchema).optional(),
    query: z.record(templateValueSchema).optional(),
    body: templateValueSchema.optional(),
  })
  .strict();

const functionSchema = z
  .object({
    description: z.string().optional(),
    args: z.record(argDefinitionSchema).optional(),
    request: requestDefinitionSchema,
  })
  .strict();

const toolSchema = z
  .object({
    provider: z
      .string()
      .min(1)
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "provider may only contain letters, numbers, underscores, and dashes",
      ),
    name: z.string().optional(),
    description: z.string().optional(),
    functions: z
      .record(functionSchema)
      .refine((functions) => Object.keys(functions).length > 0, {
        message: "at least one function is required",
      }),
  })
  .strict();

export function validateToolSchema(
  value: unknown,
  sourcePath: string,
): ToolDefinition {
  const result = toolSchema.safeParse(value);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
      .join("\n");
    throw new CliError(`Invalid tool YAML in ${sourcePath}:\n${details}`);
  }

  const tool: ToolDefinition = {
    provider: result.data.provider,
    functions: Object.fromEntries(
      Object.entries(result.data.functions).map(([name, toolFunction]) => [
        name,
        {
          ...toolFunction,
          request: {
            ...toolFunction.request,
            method: toolFunction.request.method as HttpMethod,
          },
        },
      ]),
    ),
    sourcePath,
  };

  if (result.data.name !== undefined) {
    tool.name = result.data.name;
  }

  if (result.data.description !== undefined) {
    tool.description = result.data.description;
  }

  return tool;
}
