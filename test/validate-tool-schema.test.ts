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

  it("applies root http_header values over request headers", () => {
    const tool = validateToolSchema(
      {
        provider: "demo",
        http_header: {
          Authorization: "Bearer ${env.DEMO_TOKEN}",
          Accept: "application/json",
        },
        functions: {
          ping: {
            request: {
              method: "GET",
              url: "https://example.com",
              headers: {
                Authorization: "Bearer per-function",
                "X-Function": "ping",
              },
            },
          },
        },
      },
      "demo.yml",
    );

    expect(tool.functions.ping?.request.headers).toEqual({
      Authorization: "Bearer ${env.DEMO_TOKEN}",
      Accept: "application/json",
      "X-Function": "ping",
    });
  });
});
