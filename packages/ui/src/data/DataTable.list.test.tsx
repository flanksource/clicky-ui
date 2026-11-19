import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

type Run = Record<string, unknown> & {
  id: string;
  name: string;
  status: string;
  duration: number | null;
  project: string;
  owner: string;
};

const RUNS: Run[] = [
  { id: "a", name: "Commit gavel", status: "success", duration: 6, project: "gavel", owner: "ci" },
  { id: "b", name: "Commit captain", status: "failed", duration: null, project: "captain", owner: "ci" },
];

const COLUMNS: DataTableColumn<Run>[] = [
  { key: "name", label: "Run", sortable: true, listRole: "title" },
  {
    key: "status", label: "Status", listRole: "status",
    render: (value) => <span>{String(value)} text</span>,
    listRender: (value) => <span role="img" aria-label={String(value)} />,
  },
  { key: "duration", label: "Duration", sortable: true, listRole: "meta", render: (value) => (value == null ? null : `${String(value)}s`) },
  { key: "project", label: "Project", listRole: "meta" },
  { key: "owner", label: "Owner", listRole: "hidden" },
];

function listItem(name: string): HTMLElement {
  const title = screen.getByText(name);
  const item = title.closest<HTMLElement>("[data-list-item]");
  if (!item) throw new Error(`no list item holds ${name}`);
  return item;
}

function metaTexts(item: HTMLElement): string[] {
  return Array.from(item.querySelectorAll<HTMLElement>("[data-list-meta]")).map((node) => node.dataset.listMeta ?? "");
}

function stubContainerWidth(width: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("DataTable list layout", () => {
  it("renders each row as a title line with its status and a meta line of the meta columns", () => {
    render(<DataTable data={RUNS} columns={COLUMNS} getRowId={(row) => row.id} layout="list" />);

    expect(screen.queryByRole("columnheader", { name: /Status/ })).not.toBeInTheDocument();
    const item = listItem("Commit gavel");
    expect(within(item).getByRole("img", { name: "success" })).toBeInTheDocument();
    expect(within(item).queryByText("success text")).not.toBeInTheDocument();
    expect(metaTexts(item)).toEqual(["duration", "project"]);
    expect(within(item).getByText("6s")).toBeInTheDocument();
    expect(within(item).queryByText("ci")).not.toBeInTheDocument();
  });

  it("drops a meta item whose renderer returns nothing instead of leaving a dangling separator", () => {
    render(<DataTable data={RUNS} columns={COLUMNS} getRowId={(row) => row.id} layout="list" />);

    expect(metaTexts(listItem("Commit captain"))).toEqual(["project"]);
  });

  it("defaults the first column to the title, a status-kind column to the status and the rest to meta", () => {
    const columns: DataTableColumn<Run>[] = [
      { key: "name", label: "Run" },
      { key: "status", label: "Status", kind: "status" },
      { key: "project", label: "Project" },
      { key: "owner", label: "Owner" },
    ];
    render(<DataTable data={RUNS} columns={columns} getRowId={(row) => row.id} layout="list" />);

    const item = listItem("Commit gavel");
    expect(item.querySelector("[data-list-title]")).toHaveTextContent("Commit gavel");
    expect(item.querySelector("[data-list-status]")).not.toBeNull();
    expect(metaTexts(item)).toEqual(["project", "owner"]);
  });

  it("switches to the list below the container breakpoint and never shows the overflow cue there", () => {
    stubContainerWidth(390);
    const { unmount } = render(<DataTable data={RUNS} columns={COLUMNS} getRowId={(row) => row.id} layout="auto" />);
    expect(screen.getAllByText((_, node) => node?.hasAttribute("data-list-item") ?? false)).toHaveLength(2);
    expect(screen.queryByText("More columns")).not.toBeInTheDocument();
    unmount();

    vi.restoreAllMocks();
    stubContainerWidth(1280);
    render(<DataTable data={RUNS} columns={COLUMNS} getRowId={(row) => row.id} layout="auto" />);
    expect(screen.getByRole("columnheader", { name: /Status/ })).toBeInTheDocument();
    expect(document.querySelector("[data-list-item]")).toBeNull();
  });

  it("honours a custom listBreakpoint", () => {
    stubContainerWidth(700);
    render(<DataTable data={RUNS} columns={COLUMNS} getRowId={(row) => row.id} layout="auto" listBreakpoint={768} />);

    expect(document.querySelectorAll("[data-list-item]")).toHaveLength(2);
  });

  it("keeps row click expanding the row detail", () => {
    function Harness() {
      const [open, setOpen] = useState<string[]>([]);
      return (
        <DataTable
          data={RUNS}
          columns={COLUMNS}
          getRowId={(row) => row.id}
          layout="list"
          expandedRowIds={open}
          onExpandedRowIdsChange={setOpen}
          renderExpandedRow={(row) => <div>detail of {row.name}</div>}
        />
      );
    }
    render(<Harness />);

    const row = listItem("Commit gavel").closest("tr")!;
    expect(row).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(row);
    expect(screen.getByText("detail of Commit gavel")).toBeInTheDocument();
    expect(row).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps row selection and select-all working", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        data={RUNS}
        columns={COLUMNS}
        getRowId={(row) => row.id}
        layout="list"
        rowSelection={{ selectedRowIds: [], onSelectionChange }}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Select row b" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["b"], [RUNS[1]]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all visible rows" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a", "b"], RUNS);
  });

  it("filters the list through the global search", () => {
    vi.useFakeTimers();
    render(<DataTable data={RUNS} columns={COLUMNS} getRowId={(row) => row.id} layout="list" showGlobalFilter />);

    fireEvent.change(screen.getByPlaceholderText("Search all columns…"), { target: { value: "captain" } });
    act(() => { vi.advanceTimersByTime(500); });
    vi.useRealTimers();

    expect(screen.getByText("Commit captain")).toBeInTheDocument();
    expect(screen.queryByText("Commit gavel")).not.toBeInTheDocument();
  });

  it("sorts the list from the preferences menu since there are no column headers", () => {
    render(<DataTable data={RUNS} columns={COLUMNS} getRowId={(row) => row.id} layout="list" />);
    const order = () => Array.from(document.querySelectorAll("[data-list-title]")).map((node) => node.textContent);
    expect(order()).toEqual(["Commit gavel", "Commit captain"]);

    fireEvent.click(screen.getByRole("button", { name: "Open column menu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Run" }));
    expect(order()).toEqual(["Commit captain", "Commit gavel"]);

    fireEvent.click(screen.getByRole("button", { name: "Open column menu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Run/ }));
    expect(order()).toEqual(["Commit gavel", "Commit captain"]);
  });

  it("refuses to combine a host card renderer with the list layout", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(
      <DataTable data={RUNS} columns={COLUMNS} layout="list" renderCard={(row) => <div>{row.name}</div>} />,
    )).toThrow("DataTable renderCard cannot be combined with layout=\"list\" or \"auto\"");
  });
});
