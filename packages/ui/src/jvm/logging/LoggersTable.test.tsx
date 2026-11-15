import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LOGGERS } from "../fixtures/classes";
import { LoggersTable, type LoggersTableProps } from "./LoggersTable";

function renderTable(props: Partial<LoggersTableProps> = {}) {
  const onEdit = vi.fn();
  const onFilterChange = vi.fn();
  render(<LoggersTable loggers={LOGGERS} filter="" onFilterChange={onFilterChange} onEdit={onEdit} canEdit {...props} />);
  return { onEdit, onFilterChange };
}

const rowOf = (name: string) => screen.getByRole("button", { name: `Edit level of ${name}` }).closest("tr") as HTMLElement;

describe("LoggersTable", () => {
  it("names the root logger <root> and shows the parent of each logger", () => {
    renderTable();
    expect(within(rowOf("<root>")).getByText("INFO")).toBeInTheDocument();
    expect(within(rowOf("<root>")).getByText("–")).toBeInTheDocument();
    expect(within(rowOf("com.example")).getByText("<root>")).toBeInTheDocument();
  });

  it("shows an inherited level together with the level it resolves to", () => {
    renderTable();
    expect(within(rowOf("com.example.orders.OrderService")).getByText("(inherit) → FINE")).toBeInTheDocument();
    expect(within(rowOf("com.example")).getByText("(inherit) → INFO")).toBeInTheDocument();
  });

  it("filters by name and counts the matches", () => {
    renderTable({ filter: "orders" });
    expect(screen.getByText("2 of 7 loggers")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Edit level of/ }).map((button) => button.getAttribute("aria-label"))).toEqual([
      "Edit level of com.example.orders",
      "Edit level of com.example.orders.OrderService",
    ]);
  });

  it("reports filter edits", () => {
    const { onFilterChange } = renderTable();
    fireEvent.change(screen.getByRole("textbox", { name: "Filter loggers" }), { target: { value: "cat" } });
    expect(onFilterChange).toHaveBeenCalledWith("cat");
  });

  it("says when nothing matches", () => {
    renderTable({ filter: "zzz" });
    expect(screen.getByText("0 of 7 loggers")).toBeInTheDocument();
    expect(screen.getByText("No loggers match.")).toBeInTheDocument();
  });

  it("passes the row to Edit, with the raw name for the root", () => {
    const { onEdit } = renderTable();
    fireEvent.click(screen.getByRole("button", { name: "Edit level of <root>" }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ name: "", displayName: "<root>", level: "INFO" }));
  });

  it("disables Edit when the operator cannot change levels", () => {
    renderTable({ canEdit: false });
    expect(screen.getByRole("button", { name: "Edit level of com.example" })).toBeDisabled();
  });
});
