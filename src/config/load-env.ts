import path from "node:path";
import dotenv from "dotenv";
import { pathExists } from "../utils/filesystem.js";

export async function loadEnv(configPath: string): Promise<void> {
  const envPath = path.join(path.resolve(configPath), ".env");

  if (await pathExists(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}
