import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

type Row = { time: string; primary: string; secondary: string };

const columns: DataTableColumn<Row>[] = [
  { key: "time", label: "Time" },
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
];

// jsdom lays nothing out, so the header band the prompt sits in needs a height.
function layOutHeader(scroll: HTMLElement) {
  Object.defineProperty(scroll.querySelector("thead")!, "offsetHeight", { configurable: true, value: 30 });
}

describe("DataTable horizontal overflow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("falls back to window resize checks when ResizeObserver is unavailable", () => {
    vi.stubGlobal("ResizeObserver", undefined);

    render(
      <DataTable
        columns={columns}
        data={[{ time: "10:00", primary: "SELECT 1", secondary: "OIPA" }]}
      />,
    );

    const scroll = screen.getByTestId("data-table-scroll");
    Object.defineProperties(scroll, {
      clientWidth: { configurable: true, value: 400 },
      scrollWidth: { configurable: true, value: 900 },
    });
    layOutHeader(scroll);
    fireEvent(window, new Event("resize"));

    expect(screen.getByText("More columns")).toBeInTheDocument();
  });

  it("keeps the more-columns prompt inside the header band so it never covers a row", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    render(
      <DataTable
        columns={columns}
        data={[{ time: "10:00", primary: "SELECT 1", secondary: "OIPA" }]}
      />,
    );

    const scroll = screen.getByTestId("data-table-scroll");
    Object.defineProperties(scroll, {
      clientWidth: { configurable: true, value: 400 },
      scrollWidth: { configurable: true, value: 900 },
    });
    const HEADER_HEIGHT = 33;
    Object.defineProperty(scroll.querySelector("thead")!, "offsetHeight", { configurable: true, value: HEADER_HEIGHT });
    fireEvent(window, new Event("resize"));

    const band = screen.getByTestId("data-table-overflow-prompt");
    expect({ top: band.style.top, height: band.style.height }).toEqual({ top: "0px", height: `${HEADER_HEIGHT}px` });
    expect(band).toHaveTextContent("More columns");
  });

  it("points to clipped columns and replaces the prompt with edge fades after scrolling", () => {
    // DataTable observes its scroll element more than once (overflow cue and
    // the visible-width measurement), so a resize must reach every observer.
    const observers: ResizeObserverCallback[] = [];
    const resize = () => observers.forEach((callback) => callback([], {} as ResizeObserver));
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          observers.push(callback);
        }
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );

    render(
      <DataTable
        columns={columns}
        data={[{ time: "10:00", primary: "SELECT 1", secondary: "OIPA" }]}
      />,
    );

    const scroll = screen.getByTestId("data-table-scroll");
    Object.defineProperties(scroll, {
      clientWidth: { configurable: true, value: 400 },
      scrollWidth: { configurable: true, value: 900 },
      scrollLeft: { configurable: true, writable: true, value: 0 },
    });
    layOutHeader(scroll);
    act(resize);

    expect(screen.getByText("More columns")).toBeInTheDocument();
    expect(screen.getByTestId("data-table-overflow-right")).toBeInTheDocument();
    expect(screen.queryByTestId("data-table-overflow-left")).not.toBeInTheDocument();

    Object.defineProperty(scroll, "scrollLeft", {
      configurable: true,
      writable: true,
      value: 120,
    });
    fireEvent.scroll(scroll);
    expect(screen.queryByText("More columns")).not.toBeInTheDocument();
    expect(screen.getByTestId("data-table-overflow-left")).toBeInTheDocument();

    Object.defineProperty(scroll, "scrollLeft", {
      configurable: true,
      writable: true,
      value: 500,
    });
    fireEvent.scroll(scroll);
    expect(screen.queryByTestId("data-table-overflow-right")).not.toBeInTheDocument();
  });
});
