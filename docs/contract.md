# Drag payload contract (v0)

Status: **draft, 2026-09-25.** Evidence so far covers Chrome 154 on macOS dropping into Claude desktop
2.9939.2, plus a pasteboard-level run of 38 drags in Chrome. Each rule cites its evidence:
`R:<variant>` is a row in `research/results.json`, and `E:<variant>` is a record in
`research/egress-summary.md` (details in `research/desk-findings.md`). The research directory is
local-only and gitignored. Anything marked **open** is a library option until more clients are
tested.

## The payload

On `dragstart`, for a reference with a `label` and an https `url`:

```ts
event.stopPropagation();
dt.clearData();
dt.effectAllowed = "copyLink";
dt.setData("text/uri-list", url);
dt.setData("text/html", `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`);
dt.setData("text/plain", plainText); // default: label (open, see rule 4)
// optional
dt.setData("application/vnd.dragref+json", JSON.stringify(data));
dt.setData("DownloadURL", `${mimeType}:${fileName}:${fileUrl}`);
```

## Rules

1. **Always write `text/html` as a single `<a href>` whose text is the label.** Claude converts HTML
   into a Markdown link, `[label](url)`, and prefers it over every other flavor
   (R:A-uri+html+plain, R:C-anchor-clear-all).
2. **Always call `clearData()` first, even on `<a>` sources.** A native anchor's browser-generated
   HTML contains the anchor's full content: each block child becomes its own link, and badge text is
   glued on (R:C-anchor-native). Overriding only `text/plain` does not help (R:C-anchor-override-plain).
   `clearData()` does discard the native link title (`public.url-name`, E:C-anchor-override-plain-uri),
   but no tested client reads it.
3. **`text/uri-list` must be an http(s) URL.** Without HTML, Claude inserts it as a bare link (R:A-uri).
   A `data:` URL is dropped silently (R:F-url-data-json). The prototype saw an invalid scheme reject
   the whole drop. The library throws on anything other than http(s).
4. **Always write `text/plain`.** Chrome synthesizes no plain-text fallback for HTML-only drags
   (E:A-html), and plain-text-only receivers (terminals, and Cursor according to the prototype) would
   get nothing. **Open:** whether it should be the label alone, `label (url)`, or `[label](url)`.
   Claude ignores it when HTML is present, so this only affects plain-text receivers. The library
   exposes `plainText: "label" | "label-url" | "markdown" | "url"`, defaulting to `"label"` until
   Cursor and terminals are tested.
5. **The URL should be fetchable, or its `context` parameter resolvable by an MCP server.** Claude
   fetches dropped links on its own (R:A-uri, R:C-anchor-clear-all). When the fetch fails, the model
   falls back to reading the query parameters.
6. **Never put raw content in the payload** unless the caller explicitly passes `data`. Carried over
   from the prototype (report §2, rule 5).
7. **Call `stopPropagation()`.** Nested draggables otherwise overwrite each other (prototype report,
   gotcha 9).

## Optional channels

- **Structured data (`data`)**: written as JSON under a custom MIME type, default
  `application/vnd.dragref+json`. Chrome carries it intact inside Chromium custom data
  (E:E-custom-json). It is visible to Chromium/Electron receivers' JavaScript, but ignored by Claude
  today (R:G-combined). It is for cooperating receivers only.
- **File (`file`)**: written as Chrome's `DownloadURL`, which becomes a macOS file promise. Chrome
  materializes the real file when a receiver asks, as Finder and native Cocoa apps do
  (E:G-downloadurl-json). Claude desktop ignores promises and never requests the file, but the rest of
  the payload still works (R:G-downloadurl-json, R:G-combined). The file URL must be http(s), and the
  file name must not contain `:`. Chrome only.
- A web page cannot hand Claude a real on-disk file. Only file URLs (for example from Finder) attach
  directly. See `desk-findings.md` §3 for the candidate two-step routes.

## Not significant (tested)

- `effectAllowed` value: the pasteboard is identical across values, and the operation mask follows
  the value (E:D-effect-*).
- `setData` order (E:B-plain-first) and `setDragImage` (E:H-drag-image).
- Synthetic `File` objects: Chrome exports only the filename as text (E:G-file-json). Not used.

## Open questions

- Default for `text/plain` (rule 4). Test `A-uri+html+plain` in Cursor and in a terminal.
- Priority between `text/plain` and `text/uri-list` when no HTML is present (`A-plain+uri`).
- ChatGPT desktop, the most likely native receiver of file promises.
- Safari, Firefox, and Dia egress.
