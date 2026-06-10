import pc from "picocolors";
import { getErrorMessage } from "../utils/errors.js";

export function formatError(error: unknown): string {
  return `${pc.red("Error:")} ${getErrorMessage(error)}`;
}
