import { access, readdir, stat } from "node:fs/promises";
import path from "node:path";

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    return (await stat(filePath)).isDirectory();
  } catch {
    return false;
  }
}

export async function listYamlFiles(configPath: string): Promise<string[]> {
  const resolved = path.resolve(configPath);
  const toolsDir = path.join(resolved, "tools");
  const searchDir = (await isDirectory(toolsDir)) ? toolsDir : resolved;
  const entries = await readdir(searchDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && /\.ya?ml$/i.test(entry.name))
    .map((entry) => path.join(searchDir, entry.name))
    .sort((a, b) => a.localeCompare(b));
}
