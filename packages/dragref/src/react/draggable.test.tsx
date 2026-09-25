// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createMockDataTransfer } from "dragref/testing";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Draggable, useDragSource } from "./index";

afterEach(cleanup);

const acme = { label: "Acme Corp", url: "https://app.example.com/companies/acme" };

describe("Draggable", () => {
  it("renders a draggable element that writes the reference payload", () => {
    render(<Draggable reference={acme}>Acme</Draggable>);
    const el = screen.getByText("Acme");
    expect(el.getAttribute("draggable")).toBe("true");
    expect(el.hasAttribute("data-dragref")).toBe(true);

    const dt = createMockDataTransfer();
    fireEvent.dragStart(el, { dataTransfer: dt });
    expect(dt.getData("text/uri-list")).toBe(acme.url);
    expect(dt.getData("text/plain")).toBe("Acme Corp");
    expect(dt.data.size).toBe(3);
  });

  it("replaces a native anchor's browser-generated data and label text", () => {
    render(
      <Draggable as="a" href={acme.url} reference={acme}>
        Acme Corp <span>Startup</span>
      </Draggable>,
    );
    const dt = createMockDataTransfer({ "text/uri-list": "https://browser.example/generated" });
    fireEvent.dragStart(screen.getByRole("link"), { dataTransfer: dt });
    expect(dt.getData("text/html")).toBe(`<a href="${acme.url}">Acme Corp</a>`);
    expect(dt.getData("text/plain")).not.toContain("Startup");
  });

  it("keeps the innermost payload for nested sources", () => {
    render(
      <Draggable reference={{ label: "Companies", url: "https://app.example.com/companies" }}>
        <Draggable reference={acme}>Acme</Draggable>
      </Draggable>,
    );
    const dt = createMockDataTransfer();
    fireEvent.dragStart(screen.getByText("Acme"), { dataTransfer: dt });
    expect(dt.getData("text/plain")).toBe("Acme Corp");
  });

  it("passes options through and still calls the caller's onDragStart", () => {
    const onDragStart = vi.fn();
    render(
      <Draggable reference={acme} plainText="markdown" onDragStart={onDragStart}>
        Acme
      </Draggable>,
    );
    const dt = createMockDataTransfer();
    fireEvent.dragStart(screen.getByText("Acme"), { dataTransfer: dt });
    expect(dt.getData("text/plain")).toBe(`[Acme Corp](${acme.url})`);
    expect(onDragStart).toHaveBeenCalledOnce();
  });

  it("is not draggable when disabled", () => {
    render(
      <Draggable reference={acme} disabled>
        Acme
      </Draggable>,
    );
    const el = screen.getByText("Acme");
    expect(el.getAttribute("draggable")).toBe("false");
    const dt = createMockDataTransfer();
    fireEvent.dragStart(el, { dataTransfer: dt });
    expect(dt.types).toEqual([]);
  });
});

describe("useDragSource", () => {
  function Source({ get }: { get: () => typeof acme | null }) {
    return <div {...useDragSource(get)}>source</div>;
  }

  it("resolves the reference lazily at drag time", () => {
    const get = vi.fn(() => acme);
    render(<Source get={get} />);
    expect(get).not.toHaveBeenCalled();
    const dt = createMockDataTransfer();
    fireEvent.dragStart(screen.getByText("source"), { dataTransfer: dt });
    expect(get).toHaveBeenCalledOnce();
    expect(dt.getData("text/uri-list")).toBe(acme.url);
  });

  it("cancels the drag when the reference resolves to null", () => {
    render(<Source get={() => null} />);
    const dt = createMockDataTransfer();
    const notCancelled = fireEvent.dragStart(screen.getByText("source"), { dataTransfer: dt });
    expect(notCancelled).toBe(false);
    expect(dt.types).toEqual([]);
  });
});
