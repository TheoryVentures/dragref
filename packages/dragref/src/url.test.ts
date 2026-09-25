import { describe, expect, it } from "vitest";
import { buildReferenceUrl, isHttpUrl } from "./url";

describe("buildReferenceUrl", () => {
  it("adds context, params, and hash", () => {
    const url = buildReferenceUrl("https://app.example.com/market-maps/7f3c9a", {
      context: "market_map:7f3c9a:sections:market_description:sentences:s0001-s0005",
      params: { version: 3, draft: undefined },
      hash: "market_description",
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("context")).toBe(
      "market_map:7f3c9a:sections:market_description:sentences:s0001-s0005",
    );
    expect(parsed.searchParams.get("version")).toBe("3");
    expect(parsed.searchParams.has("draft")).toBe(false);
    expect(parsed.hash).toBe("#market_description");
  });

  it("supports a custom context parameter and preserves existing params", () => {
    const url = buildReferenceUrl("https://app.example.com/t/1?tab=summary", {
      context: "transcript:1:lines:148-165",
      contextParam: "ref",
    });
    expect(new URL(url).searchParams.get("tab")).toBe("summary");
    expect(new URL(url).searchParams.get("ref")).toBe("transcript:1:lines:148-165");
  });

  it("rejects non-http bases", () => {
    expect(() => buildReferenceUrl("ftp://example.com/x")).toThrow(/http\(s\)/);
  });
});

describe("isHttpUrl", () => {
  it.each([
    ["https://a.example/x", true],
    ["http://localhost:3100/x", true],
    ["market_map:7f3c9a", false],
    ["data:text/plain,hi", false],
    ["/relative", false],
    ["", false],
  ])("%s -> %s", (value, expected) => {
    expect(isHttpUrl(value)).toBe(expected);
  });
});
