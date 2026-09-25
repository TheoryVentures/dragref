# dragref

Make anything in your web app draggable into AI clients. Drop a company card into Claude desktop and
it arrives as a clean `[Acme Corp](https://app.example.com/...)` link the model can read and fetch.

```sh
npm install dragref
```

## Quick start (React / Next.js)

```tsx
import { Draggable } from "dragref/react";

export function CompanyCard({ company }) {
  return (
    <Draggable reference={{ label: company.name, url: company.url }}>
      <h3>{company.name}</h3>
    </Draggable>
  );
}
```

`dragref/react` ships with a `"use client"` directive, so App Router server components can render
`Draggable` directly.

## What a drag carries

On `dragstart`, dragref replaces whatever the browser put on the `DataTransfer` with:

| Type            | Value                                  | Who reads it                          |
| --------------- | -------------------------------------- | ------------------------------------- |
| `text/uri-list` | `url`                                  | Browsers, link-aware apps             |
| `text/html`     | `<a href="url">label</a>`              | Claude desktop (becomes a Markdown link) |
| `text/plain`    | `label` by default (see `plainText`)   | Terminals, plain-text editors         |
| custom JSON     | `JSON.stringify(data)`, when `data` is set | Your own drop targets              |
| `DownloadURL`   | a file, when `file` is set             | Native apps that accept file promises (Chrome only) |

It also stops propagation, so the innermost of nested draggables wins, and sets
`effectAllowed = "copyLink"`.

## Client support

Verified on macOS with Chrome 154:

| Receiver       | Result                                                        |
| -------------- | ------------------------------------------------------------- |
| Claude desktop | Link chip `[label](url)`; Claude fetches the URL              |
| Native macOS drop targets that accept file promises | `file` downloads as a real file |

Claude desktop, Cursor, and other Electron apps ignore `file`: Chromium does not accept file promises
from a web page. Other clients and browsers are untested so far.

## API

### `dragref/react`

**`<Draggable reference as? plainText? dataMimeType? disabled? {...htmlProps}>`**

Renders `as` (default `"div"`) with `draggable`, a grab cursor, and a `data-dragref` attribute. Your
own `onDragStart` runs after the payload is written. Use `as="a"` with `href` for a real link.

**`useDragSource(reference, options?)`** returns `{ draggable, onDragStart }` to spread onto any
element:

```tsx
const source = useDragSource(() => ({ label: row.name, url: row.url }));
return <tr {...source}>...</tr>;
```

`reference` may be a `DragReference`, `null`/`undefined` (drag is cancelled), or a function returning
either, which is called at drag time.

### `dragref`

```ts
type DragReference = {
  label: string; // link text
  url: string; // absolute http(s) URL
  data?: unknown; // written as JSON under dataMimeType
  file?: { name: string; url: string; mimeType: string };
};

type ApplyOptions = {
  plainText?: "label" | "label-url" | "markdown" | "url"; // default "label"
  dataMimeType?: string; // default "application/vnd.dragref+json"
};
```

- **`handleDragStart(event, reference, options?)`**: a complete `dragstart` handler for any
  framework or plain DOM.
- **`applyDragReference(dataTransfer, reference, options?)`**: writes the payload onto a
  `DataTransfer`.
- **`buildReferenceUrl(base, { context?, contextParam?, params?, hash? })`**: builds a URL that
  carries a context identifier, e.g. `?context=market_map:7f3c9a:company:acme`.
- **`validateDragReference(reference)`**: throws a `TypeError` for an empty label, a non-http(s) URL,
  or a malformed `file`. `applyDragReference` validates before touching the `DataTransfer`.

Plain DOM:

```ts
import { handleDragStart } from "dragref";

el.draggable = true;
el.addEventListener("dragstart", (event) =>
  handleDragStart(event, { label: "Acme Corp", url: "https://app.example.com/companies/acme" }),
);
```

### `dragref/testing`

**`createMockDataTransfer(seed?)`** returns a `Map`-backed `DataTransfer` for jsdom and Node tests:

```ts
const dataTransfer = createMockDataTransfer();
fireEvent.dragStart(element, { dataTransfer });
expect(dataTransfer.getData("text/uri-list")).toBe("https://app.example.com/companies/acme");
```

## License

MIT
