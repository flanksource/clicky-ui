import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Clicky, ClickyTable, type ClickyDocument } from "./Clicky";

const text = (value: string) => ({ kind: "text" as const, text: value });

const document: ClickyDocument = {
  version: 1,
  node: {
    kind: "table",
    columns: [
      { name: "statement", label: "Statement" },
      { name: "duration", label: "Duration" },
      { name: "clientHost", label: "Host", defaultHidden: true },
      { name: "clientApp", label: "App" },
    ],
    rows: [
      {
        cells: {
          statement: text("SELECT 1"),
          duration: text("4 ms"),
          clientHost: text("app-node-7"),
          clientApp: text("oipa-web"),
        },
      },
    ],
  },
};

const hostHeader = () => screen.queryByRole("columnheader", { name: /host/i });

describe("ClickyTable defaultHidden columns", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts a defaultHidden column hidden but lists it in the column menu", () => {
    render(<Clicky data={JSON.stringify(document)} />);

    expect(hostHeader()).not.toBeInTheDocument();
    expect(screen.queryByText("app-node-7")).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /app/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    const hostToggle = screen.getByRole("checkbox", { name: /host/i });
    expect(hostToggle).not.toBeChecked();

    fireEvent.click(hostToggle);
    expect(hostHeader()).toBeInTheDocument();
    expect(screen.getByText("app-node-7")).toBeInTheDocument();
  });

  it("keys the default by the DataTable cell key and still removes hiddenColumns outright", () => {
    const table = document.node as Extract<ClickyDocument["node"], { kind: "table" }>;
    render(
      <ClickyTable
        columns={table.columns ?? []}
        rows={table.rows ?? []}
        hiddenColumns={["clientApp"]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /host/i }));

    const [storageKey] = Object.keys(window.localStorage);
    expect(storageKey).toBeDefined();
    expect(window.localStorage.getItem(storageKey!)).toBe(
      JSON.stringify({ "cells.clientHost": false }),
    );
    expect(screen.queryByRole("checkbox", { name: /^app$/i })).not.toBeInTheDocument();
  });
});
