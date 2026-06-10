import type {
  HttpResult,
  RequestDefinition,
  ResolvedArgs,
  TemplateValue,
} from "../types.js";
import { CliError } from "../utils/errors.js";
import { interpolateValues } from "./interpolate-values.js";

type ExecutableRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: BodyInit;
};

export async function executeHttp(
  request: RequestDefinition,
  args: ResolvedArgs,
): Promise<HttpResult> {
  const executableRequest = buildRequest(request, args);

  let response: Response;
  try {
    response = await fetch(executableRequest.url, {
      method: executableRequest.method,
      headers: executableRequest.headers,
      ...(executableRequest.body === undefined
        ? {}
        : { body: executableRequest.body }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new CliError(`HTTP request failed: ${message}`);
  }

  const rawBody = await response.text();
  const body = parseBody(rawBody);
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers,
    body,
    rawBody,
  };
}

export function buildRequest(
  request: RequestDefinition,
  args: ResolvedArgs,
): ExecutableRequest {
  const urlValue = interpolateValues(request.url, args);
  if (typeof urlValue !== "string") {
    throw new CliError("Interpolated request URL must be a string.");
  }

  const url = new URL(urlValue);
  const query = interpolateValues(request.query, args);
  if (query && isRecord(query)) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, scalarToString(value));
    }
  }

  const headersValue = interpolateValues(request.headers, args);
  const headers: Record<string, string> = {};
  if (headersValue && isRecord(headersValue)) {
    for (const [key, value] of Object.entries(headersValue)) {
      headers[key] = scalarToString(value);
    }
  }

  const bodyValue = interpolateValues(request.body, args);
  const body = serializeBody(bodyValue, headers);

  return {
    method: request.method,
    url: url.toString(),
    headers,
    ...(body === undefined ? {} : { body }),
  };
}

function serializeBody(
  value: TemplateValue | undefined,
  headers: Record<string, string>,
): BodyInit | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  const contentTypeKey = Object.keys(headers).find(
    (key) => key.toLowerCase() === "content-type",
  );
  const contentType = contentTypeKey
    ? headers[contentTypeKey]?.toLowerCase()
    : undefined;

  if (contentType?.includes("application/x-www-form-urlencoded")) {
    if (!isRecord(value)) {
      throw new CliError("Form-encoded request body must be an object.");
    }

    const params = new URLSearchParams();
    for (const [key, nestedValue] of Object.entries(value)) {
      params.set(key, scalarToString(nestedValue));
    }
    return params;
  }

  if (!contentTypeKey) {
    headers["Content-Type"] = "application/json";
  }

  return JSON.stringify(value);
}

function scalarToString(value: TemplateValue): string {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  throw new CliError(
    "Interpolated headers, query params, and form fields must resolve to scalar values.",
  );
}

function parseBody(rawBody: string): unknown {
  if (!rawBody) {
    return "";
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

function isRecord(
  value: TemplateValue,
): value is Record<string, TemplateValue> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
