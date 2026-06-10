import type { HttpResult } from "../types.js";

export function formatResult(result: HttpResult): string {
  if (result.ok) {
    return result.rawBody;
  }

  const status = `HTTP ${String(result.status)}${result.statusText ? ` ${result.statusText}` : ""}`;
  return result.rawBody ? `${status}\n${result.rawBody}` : status;
}
