import { describe, expect, it, vi } from "vitest";
import {
  applyDragReference,
  DEFAULT_DATA_MIME_TYPE,
  type DragReference,
  escapeHtml,
  formatPlainText,
  handleDragStart,
} from "./index";
import { createMockDataTransfer } from "./testing";

const ref: DragReference = {
  label: "Acme Corp",
  url: "https://app.example.com/market-maps/7f3c9a?context=market_map:7f3c9a:company:acme",
};

describe("applyDragReference", () => {
  it("writes exactly uri-list, html, and plain text", () => {
    const dt = createMockDataTransfer();
    applyDragReference(dt, ref);
    expect(Object.fromEntries(dt.data)).toEqual({
      "text/uri-list": ref.url,
      "text/html": `<a href="${escapeHtml(ref.url)}">Acme Corp</a>`,
      "text/plain": "Acme Corp",
    });
    expect(dt.effectAllowed).toBe("copyLink");
  });

  it("clears browser-generated flavors first", () => {
    const dt = createMockDataTransfer({
      "text/uri-list": "https://browser.example/native",
      "text/x-moz-url": "native",
    });
    applyDragReference(dt, ref);
    expect(dt.data.has("text/x-moz-url")).toBe(false);
    expect(dt.getData("text/uri-list")).toBe(ref.url);
    expect(dt.data.size).toBe(3);
  });

  it("escapes the label and URL inside the HTML", () => {
    const dt = createMockDataTransfer();
    applyDragReference(dt, { label: `<b>"Tom & Jerry's"</b>`, url: "https://x.example/?a=1&b=2" });
    expect(dt.getData("text/html")).toBe(
      '<a href="https://x.example/?a=1&amp;b=2">&lt;b&gt;&quot;Tom &amp; Jerry&#39;s&quot;&lt;/b&gt;</a>',
    );
  });

  it("trims the label", () => {
    const dt = createMockDataTransfer();
    applyDragReference(dt, { ...ref, label: "  Acme Corp \n" });
    expect(dt.getData("text/plain")).toBe("Acme Corp");
  });

  it("writes data as JSON under the default or a custom MIME type", () => {
    const data = { id: "acme", version: 3 };
    const dt = createMockDataTransfer();
    applyDragReference(dt, { ...ref, data });
    expect(JSON.parse(dt.getData(DEFAULT_DATA_MIME_TYPE))).toEqual(data);

    const dt2 = createMockDataTransfer();
    applyDragReference(dt2, { ...ref, data }, { dataMimeType: "application/json" });
    expect(JSON.parse(dt2.getData("application/json"))).toEqual(data);
    expect(dt2.data.has(DEFAULT_DATA_MIME_TYPE)).toBe(false);
  });

  it("writes a file as a Chrome DownloadURL", () => {
    const dt = createMockDataTransfer();
    applyDragReference(dt, {
      ...ref,
      file: {
        name: "acme.json",
        mimeType: "application/json",
        url: "https://app.example.com/export/acme.json",
      },
    });
    expect(dt.getData("DownloadURL")).toBe(
      "application/json:acme.json:https://app.example.com/export/acme.json",
    );
  });

  it("never writes anything beyond label, URL, and explicit data", () => {
    const secret = "raw selected paragraph text";
    const dt = createMockDataTransfer();
    applyDragReference(dt, { label: "Section 2", url: "https://app.example.com/doc#s2" });
    for (const value of dt.data.values()) expect(value).not.toContain(secret);
    expect([...dt.data.keys()].sort()).toEqual(["text/html", "text/plain", "text/uri-list"]);
  });

  it.each([
    ["an empty label", { ...ref, label: "  " }, /label/],
    ["a non-http URL", { ...ref, url: "market_map:7f3c9a" }, /url must be/],
    ["a data: URL", { ...ref, url: "data:application/json,{}" }, /url must be/],
    ["a relative URL", { ...ref, url: "/market-maps/7f3c9a" }, /url must be/],
    [
      "a file name with a colon",
      {
        ...ref,
        file: { name: "a:b.json", mimeType: "application/json", url: "https://x.example/f" },
      },
      /file.name/,
    ],
    [
      "a data: file URL",
      {
        ...ref,
        file: { name: "a.json", mimeType: "application/json", url: "data:application/json,{}" },
      },
      /file.url/,
    ],
    [
      "a malformed file MIME type",
      { ...ref, file: { name: "a.json", mimeType: "json", url: "https://x.example/f" } },
      /mimeType/,
    ],
  ])("throws on %s without touching the data transfer", (_, bad, message) => {
    const dt = createMockDataTransfer({ "text/plain": "untouched" });
    expect(() => applyDragReference(dt, bad as DragReference)).toThrow(message);
    expect(Object.fromEntries(dt.data)).toEqual({ "text/plain": "untouched" });
  });
});

describe("formatPlainText", () => {
  it.each([
    ["label", "Acme [beta]"],
    ["label-url", "Acme [beta] (https://x.example/a)"],
    ["markdown", "[Acme \\[beta\\]](https://x.example/a)"],
    ["url", "https://x.example/a"],
  ] as const)("%s", (format, expected) => {
    expect(formatPlainText({ label: "Acme [beta]", url: "https://x.example/a" }, format)).toBe(
      expected,
    );
  });
});

describe("handleDragStart", () => {
  const event = (dataTransfer: DataTransfer | null) => ({
    dataTransfer,
    stopPropagation: vi.fn(),
    preventDefault: vi.fn(),
  });

  it("stops propagation and applies the payload", () => {
    const e = event(createMockDataTransfer());
    handleDragStart(e, ref, { plainText: "markdown" });
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(e.dataTransfer?.getData("text/plain")).toBe(`[Acme Corp](${ref.url})`);
  });

  it("cancels the drag when there is no reference", () => {
    const e = event(createMockDataTransfer());
    handleDragStart(e, null);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(e.dataTransfer?.types).toEqual([]);
  });

  it("keeps the innermost payload when a parent handler would run next", () => {
    const dt = createMockDataTransfer();
    let propagationStopped = false;
    const child = {
      dataTransfer: dt,
      stopPropagation: () => {
        propagationStopped = true;
      },
      preventDefault: vi.fn(),
    };
    handleDragStart(child, { label: "Child", url: "https://x.example/child" });
    if (!propagationStopped)
      handleDragStart(child, { label: "Parent", url: "https://x.example/parent" });
    expect(dt.getData("text/plain")).toBe("Child");
  });
});
