export type ArgType = "string" | "number" | "boolean";

export type ArgDefinition = {
  type: ArgType;
  description?: string | undefined;
  required?: boolean | undefined;
  default?: string | number | boolean | undefined;
};

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type TemplateValue =
  | string
  | number
  | boolean
  | null
  | TemplateValue[]
  | { [key: string]: TemplateValue };

export type RequestDefinition = {
  method: HttpMethod;
  url: string;
  headers?: Record<string, TemplateValue> | undefined;
  query?: Record<string, TemplateValue> | undefined;
  body?: TemplateValue | undefined;
};

export type ToolFunction = {
  description?: string | undefined;
  args?: Record<string, ArgDefinition> | undefined;
  request: RequestDefinition;
};

export type ToolDefinition = {
  provider: string;
  name?: string | undefined;
  description?: string | undefined;
  functions: Record<string, ToolFunction>;
  sourcePath: string;
};

export type ResolvedArgs = Record<string, string | number | boolean>;

export type HttpResult = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  rawBody: string;
};
