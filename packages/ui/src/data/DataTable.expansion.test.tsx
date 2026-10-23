import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "./DataTable";

const rows = [
  { id: "run-1", name: "First run" },
  { id: "run-2", name: "Second run" },
];

describe("DataTable controlled row expansion", () => {
  it("shows the selected detail and requests the next selection on row click", () => {
    const onExpandedRowIdsChange = vi.fn();
    const { rerender } = render(
      <DataTable
        data={rows}
        columns={[{ key: "name", label: "Run" }]}
        getRowId={(row) => row.id}
        expandedRowIds={["run-2"]}
        onExpandedRowIdsChange={onExpandedRowIdsChange}
        renderExpandedRow={(row) => <div>Progress for {row.name}</div>}
      />,
    );

    expect(screen.queryByText("Progress for First run")).not.toBeInTheDocument();
    expect(screen.getByText("Progress for Second run")).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("row", { name: "First run" })).getByText("First run"));
    expect(onExpandedRowIdsChange).toHaveBeenCalledWith(["run-2", "run-1"]);

    rerender(
      <DataTable
        data={rows}
        columns={[{ key: "name", label: "Run" }]}
        getRowId={(row) => row.id}
        expandedRowIds={["run-1"]}
        onExpandedRowIdsChange={onExpandedRowIdsChange}
        renderExpandedRow={(row) => <div>Progress for {row.name}</div>}
      />,
    );
    expect(screen.getByText("Progress for First run")).toBeInTheDocument();
    expect(screen.queryByText("Progress for Second run")).not.toBeInTheDocument();
  });

  it("pins expanded detail to the scroll container's visible width, not the table's", () => {
    const visibleWidth = 640;
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(visibleWidth);
    render(
      <DataTable
        data={rows}
        columns={[{ key: "name", label: "Run" }]}
        getRowId={(row) => row.id}
        expandedRowIds={["run-1"]}
        renderExpandedRow={(row) => <div>Progress for {row.name}</div>}
      />,
    );

    expect(screen.getByTestId("data-table-scroll").style.getPropertyValue("--dt-viewport-w")).toBe(
      `${visibleWidth}px`,
    );
    expect(screen.getByTestId("data-table-expansion").className).toMatch(
      /\bsticky\b.*w-\[calc\(var\(--dt-viewport-w\)/,
    );
    vi.restoreAllMocks();
  });
});
