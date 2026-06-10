import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadTools } from "../src/config/load-tools.js";

describe("loadTools", () => {
  it("loads YAML files from a tools directory", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "secops-cli-"));
    const toolsDir = path.join(dir, "tools");
    await mkdir(toolsDir);
    await writeFile(
      path.join(toolsDir, "demo.yml"),
      "provider: demo\nfunctions:\n  ping:\n    request:\n      method: GET\n      url: https://example.com\n",
    );

    const tools = await loadTools(dir);

    expect(tools).toHaveLength(1);
    expect(tools[0]?.provider).toBe("demo");
    expect(Object.keys(tools[0]?.functions ?? {})).toEqual(["ping"]);
  });
});
