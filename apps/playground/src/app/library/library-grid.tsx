"use client";

import { buildReferenceUrl, type DragReference } from "dragref";
import { Draggable, useDragSource } from "dragref/react";
import { type DragEvent, useState } from "react";
import { SAMPLE_JSON } from "@/lib/sample-data";

const BASE = "https://app.example.com/market-maps/7f3c9a";

function acme(variantId: string): DragReference {
  return {
    label: "Acme Corp",
    url: buildReferenceUrl(BASE, {
      context: "market_map:7f3c9a:company:acme",
      params: { v: variantId },
    }),
  };
}

type LastDrag = { id: string; types: string[]; data: Record<string, string> };

function useDragLogger(onLogged: (drag: LastDrag) => void) {
  return (variantId: string) => (event: DragEvent<HTMLElement>) => {
    const dt = event.dataTransfer;
    const types = Array.from(dt.types);
    const data = Object.fromEntries(types.map((type) => [type, dt.getData(type)]));
    const body = JSON.stringify({
      event: "dragstart",
      variantId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      effectAllowed: dt.effectAllowed,
      types,
      data,
      fileCount: dt.files.length,
    });
    if (!navigator.sendBeacon?.("/api/drag-log", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/drag-log", { method: "POST", body, keepalive: true });
    }
    onLogged({ id: variantId, types, data });
  };
}

function HookRow({ log }: { log: (id: string) => (event: DragEvent<HTMLElement>) => void }) {
  const source = useDragSource(() => acme("L-hook"));
  return (
    <tr
      {...source}
      onDragStart={(event) => {
        source.onDragStart(event);
        log("L-hook")(event);
      }}
    >
      <td>Acme Corp</td>
      <td>Series A</td>
      <td>
        <code>L-hook</code> (table row via <code>useDragSource</code>)
      </td>
    </tr>
  );
}

export function LibraryGrid() {
  const [last, setLast] = useState<LastDrag | null>(null);
  const log = useDragLogger(setLast);

  return (
    <>
      <h2>Defaults</h2>
      <div className="grid">
        <Draggable className="variant" reference={acme("L-default")} onDragStart={log("L-default")}>
          <strong>Acme Corp</strong>
          <code>L-default</code>
        </Draggable>
        <Draggable
          as="a"
          className="variant"
          href={acme("L-anchor").url}
          reference={acme("L-anchor")}
          onDragStart={log("L-anchor")}
        >
          <strong>Acme Corp</strong> <span>Series A · Fintech</span>
          <code>L-anchor</code>
        </Draggable>
      </div>

      <h2>plainText formats</h2>
      <div className="grid">
        {(["label-url", "markdown", "url"] as const).map((format) => {
          const id = `L-plain-${format}`;
          return (
            <Draggable
              key={id}
              className="variant"
              reference={acme(id)}
              plainText={format}
              onDragStart={log(id)}
            >
              <strong>Acme Corp</strong>
              <code>{id}</code>
            </Draggable>
          );
        })}
      </div>

      <h2>Optional channels</h2>
      <div className="grid">
        <Draggable
          className="variant"
          reference={{ ...acme("L-data"), data: SAMPLE_JSON }}
          onDragStart={log("L-data")}
        >
          <strong>Acme Corp</strong>
          <code>L-data</code>
        </Draggable>
        <Draggable
          className="variant"
          reference={() => ({
            ...acme("L-file"),
            file: {
              name: "acme.json",
              url: `${window.location.origin}/api/export/acme.json`,
              mimeType: "application/json",
            },
          })}
          onDragStart={log("L-file")}
        >
          <strong>Acme Corp</strong>
          <code>L-file</code>
        </Draggable>
      </div>

      <h2>Composition</h2>
      <Draggable
        className="variant"
        reference={{ label: "Fintech market map", url: `${BASE}?v=L-outer` }}
        onDragStart={log("L-outer")}
      >
        <strong>Fintech market map</strong> <code>L-outer</code>
        <Draggable className="variant" reference={acme("L-inner")} onDragStart={log("L-inner")}>
          <strong>Acme Corp</strong>
          <code>L-inner</code>
        </Draggable>
      </Draggable>
      <table>
        <tbody>
          <HookRow log={log} />
        </tbody>
      </table>

      {last && (
        <pre className="record">
          {last.id}
          {"\n"}
          {JSON.stringify(last.data, null, 2)}
        </pre>
      )}
    </>
  );
}
