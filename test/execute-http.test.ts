import { describe, expect, it, vi } from "vitest";
import { buildRequest, executeHttp } from "../src/engine/execute-http.js";

describe("buildRequest", () => {
  it("builds URL, headers, query, and form body", () => {
    const request = buildRequest(
      {
        method: "POST",
        url: "https://example.com/search",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer ${args.token}",
        },
        query: { q: "${args.query}" },
        body: { url: "${args.url}" },
      },
      { token: "abc", query: "ioc", url: "https://bad.test" },
    );

    expect(request.method).toBe("POST");
    expect(request.url).toBe("https://example.com/search?q=ioc");
    expect(request.headers.Authorization).toBe("Bearer abc");
    expect(request.body).toBeInstanceOf(URLSearchParams);
    expect((request.body as URLSearchParams).toString()).toBe(
      "url=https%3A%2F%2Fbad.test",
    );
  });
});

describe("executeHttp", () => {
  it("returns response body and status", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await executeHttp(
      { method: "GET", url: "https://example.com" },
      {},
    );

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.body).toEqual({ ok: true });
    expect(result.rawBody).toBe('{"ok":true}');
  });
});
