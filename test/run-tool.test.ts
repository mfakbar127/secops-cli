import { describe, expect, it } from "vitest";
import { interpolateValues } from "../src/engine/interpolate-values.js";
import { parseNamedArgs, resolveInputs } from "../src/engine/resolve-inputs.js";

describe("resolveInputs", () => {
  it("parses named args and applies defaults", () => {
    const raw = parseNamedArgs(["--ip", "1.2.3.4"]);
    const resolved = resolveInputs(
      {
        ip: { type: "string", required: true },
        maxAgeInDays: { type: "number", default: 90 },
      },
      raw,
    );

    expect(resolved).toEqual({ ip: "1.2.3.4", maxAgeInDays: 90 });
  });

  it("rejects unknown args", () => {
    expect(() => resolveInputs({}, { nope: "x" })).toThrow(/Unknown argument/);
  });

  it("rejects missing required args", () => {
    expect(() =>
      resolveInputs({ ip: { type: "string", required: true } }, {}),
    ).toThrow(/Missing required/);
  });

  it("validates boolean args", () => {
    expect(
      resolveInputs({ verbose: { type: "boolean" } }, { verbose: "true" }),
    ).toEqual({ verbose: true });
  });
});

describe("interpolateValues", () => {
  it("interpolates args and env values", () => {
    process.env.SECOPS_TEST_TOKEN = "secret";
    expect(
      interpolateValues("${args.ip}:${env.SECOPS_TEST_TOKEN}", {
        ip: "1.2.3.4",
      }),
    ).toBe("1.2.3.4:secret");
    Reflect.deleteProperty(process.env, "SECOPS_TEST_TOKEN");
  });

  it("rejects missing env values", () => {
    Reflect.deleteProperty(process.env, "SECOPS_MISSING_TOKEN");
    expect(() => interpolateValues("${env.SECOPS_MISSING_TOKEN}", {})).toThrow(
      /Missing environment value/,
    );
  });
});
