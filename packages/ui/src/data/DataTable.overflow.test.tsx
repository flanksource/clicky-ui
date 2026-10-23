import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

type Row = { time: string; primary: string; secondary: string };

const columns: DataTableColumn<Row>[] = [
  { key: "time", label: "Time" },
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
];

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
    fireEvent(window, new Event("resize"));

    expect(screen.getByText("More columns")).toBeInTheDocument();
  });

  it("points to clipped columns and replaces the prompt with edge fades after scrolling", () => {
    // DataTable runs several observers (overflow cue, viewport width); a real
    // resize notifies all of them.
    const observers: ResizeObserverCallback[] = [];
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
    act(() => observers.forEach((notify) => notify([], {} as ResizeObserver)));

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
