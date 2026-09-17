import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClickyTable, type ClickyRow } from "./Clicky";

// ClickyTableNode/ClickyTable used to have no way to surface a host row-detail
// panel at all (only the server's own, now-removed, row.detail node — see
// "does not expand an inline row-detail panel on row click" in Clicky.test.tsx).
// renderRowDetail/detailStyle add a host-owned expand, fed raw values keyed by
// column name rather than the formatted ClickyNode cells the visible table
// renders — so a host can read a scalar for a code block or a structured
// execution-tree/object-graph payload straight into <ExecutionTree>/<ObjectGraph>.
describe("ClickyTable renderRowDetail", () => {
  const columns = [
    { name: "id", label: "ID" },
    { name: "name", label: "Name" },
  ];

  it("does not add an expand affordance when renderRowDetail is omitted", () => {
    render(
      <ClickyTable
        columns={columns}
        rows={[
          {
            cells: {
              id: { kind: "text", text: "widget-1", filterValue: "widget-1" },
              name: { kind: "text", text: "First widget" },
            },
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByText("First widget"));
    expect(screen.queryByText(/detail/i)).toBeNull();
  });

  it("passes raw values keyed by column name, preferring filterValue over rendered text", () => {
    const renderRowDetail = vi.fn((row: Record<string, unknown>) => (
      <div>Detail for {String(row.name)} (#{String(row.id)})</div>
    ));

    render(
      <ClickyTable
        columns={columns}
        rows={[
          {
            cells: {
              id: {
                kind: "text",
                text: "widget-1",
                plain: "widget-1",
                filterValue: "raw-id-1",
              },
              name: { kind: "text", text: "First widget", plain: "First widget" },
            },
          },
        ]}
        renderRowDetail={renderRowDetail}
      />,
    );

    fireEvent.click(screen.getByText("First widget"));

    // The rendered cell still shows the formatted text...
    expect(screen.getByText("First widget")).toBeInTheDocument();
    // ...but the detail renderer received the raw scalar, not the display text.
    expect(screen.getByText("Detail for First widget (#raw-id-1)")).toBeInTheDocument();
    expect(renderRowDetail).toHaveBeenCalledWith({
      id: "raw-id-1",
      name: "First widget",
    });
  });

  it("includes a column absent from `columns` (a hidden column) in the raw row", () => {
    const rows: ClickyRow[] = [
      {
        cells: {
          id: { kind: "text", text: "widget-1", filterValue: "widget-1" },
          name: { kind: "text", text: "First widget" },
          // Never listed in `columns`, so it renders no header/cell in the
          // grid — but a hidden JSON/tree column like this is exactly what a
          // JVM trace row's call tree rides in.
          execution: {
            kind: "execution-tree",
            executionRoots: [{ id: "0", label: "processActivitySequence" }],
          },
        },
      },
    ];

    render(
      <ClickyTable
        columns={columns}
        rows={rows}
        renderRowDetail={(row) => {
          const roots = row.execution as { id: string; label: string }[];
          return <div>Root: {roots[0]?.label}</div>;
        }}
      />,
    );

    expect(screen.queryByText(/processActivitySequence/)).toBeNull();
    fireEvent.click(screen.getByText("First widget"));
    expect(
      screen.getByText("Root: processActivitySequence"),
    ).toBeInTheDocument();
  });

  it("confines an inline (row-style) detail's intrinsic width so it cannot stretch the table", () => {
    // A `pre`/tree-shaped detail (a SQL statement, a call tree) has no
    // natural wrap point. Without `w-0 min-w-full overflow-x-auto` on the
    // wrapper, its intrinsic width becomes the expansion <td>'s width,
    // which is also the table's width — every other column gets pushed
    // off-screen. The wrapper must absorb that overflow internally instead.
    const { container } = render(
      <ClickyTable
        columns={columns}
        rows={[
          {
            cells: {
              id: { kind: "text", text: "widget-1", filterValue: "widget-1" },
              name: { kind: "text", text: "First widget" },
            },
          },
        ]}
        renderRowDetail={() => (
          <pre>{"a very long unbroken line ".repeat(20)}</pre>
        )}
      />,
    );

    fireEvent.click(screen.getByText("First widget"));

    const wrapper = container.querySelector("td .rounded-md.border.bg-background");
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass("w-0", "min-w-full", "overflow-x-auto");
  });

  it("opens the detail in a dialog when detailStyle is 'dialog'", () => {
    render(
      <ClickyTable
        columns={columns}
        rows={[
          {
            cells: {
              id: { kind: "text", text: "widget-1", filterValue: "widget-1" },
              name: { kind: "text", text: "First widget" },
            },
          },
        ]}
        renderRowDetail={(row) => <div>Detail for {String(row.name)}</div>}
        detailStyle="dialog"
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("First widget"));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Detail for First widget");
  });

  it("sizes the dialog from detailDialogSize, defaulting to DataTable's own default", () => {
    const { rerender } = render(
      <ClickyTable
        columns={columns}
        rows={[
          {
            cells: {
              id: { kind: "text", text: "widget-1", filterValue: "widget-1" },
              name: { kind: "text", text: "First widget" },
            },
          },
        ]}
        renderRowDetail={(row) => <div>Detail for {String(row.name)}</div>}
        detailStyle="dialog"
      />,
    );

    fireEvent.click(screen.getByText("First widget"));
    // No detailDialogSize given: DataTable defaults to "lg" -> "max-w-2xl".
    expect(screen.getByRole("dialog")).toHaveClass("max-w-2xl");

    rerender(
      <ClickyTable
        columns={columns}
        rows={[
          {
            cells: {
              id: { kind: "text", text: "widget-1", filterValue: "widget-1" },
              name: { kind: "text", text: "First widget" },
            },
          },
        ]}
        renderRowDetail={(row) => <div>Detail for {String(row.name)}</div>}
        detailStyle="dialog"
        detailDialogSize="xl"
      />,
    );

    expect(screen.getByRole("dialog")).toHaveClass("max-w-4xl");
  });

  it("titles the dialog from detailDialogTitle, fed the same raw row values as renderRowDetail", () => {
    render(
      <ClickyTable
        columns={columns}
        rows={[
          {
            cells: {
              id: { kind: "text", text: "widget-1", filterValue: "widget-1" },
              name: { kind: "text", text: "First widget" },
            },
          },
        ]}
        renderRowDetail={(row) => <div>Detail for {String(row.name)}</div>}
        detailStyle="dialog"
        detailDialogTitle={(row) => `Widget ${String(row.id)}`}
      />,
    );

    fireEvent.click(screen.getByText("First widget"));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Widget widget-1");
  });
});
