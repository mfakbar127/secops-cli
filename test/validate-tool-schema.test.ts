import { describe, expect, it } from "vitest";
import { validateToolSchema } from "../src/config/validate-tool-schema.js";

const validTool = {
  provider: "demo",
  functions: {
    ping: {
      args: {
        target: { type: "string", required: true },
      },
      request: {
        method: "GET",
        url: "https://example.com/${args.target}",
      },
    },
  },
};

describe("validateToolSchema", () => {
  it("validates a minimal tool", () => {
    expect(validateToolSchema(validTool, "demo.yml")).toMatchObject({
      provider: "demo",
      sourcePath: "demo.yml",
    });
  });

  it("rejects missing function request", () => {
    expect(() =>
      validateToolSchema(
        {
          provider: "demo",
          functions: { ping: {} },
        },
        "bad.yml",
      ),
    ).toThrow(/Invalid tool YAML/);
  });
});
