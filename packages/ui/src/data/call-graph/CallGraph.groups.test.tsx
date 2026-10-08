import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DATA_CLIENT_COLUMNS, DATA_IDS, oipaDataGraph, OIPA_VOCABULARY } from "./call-graph.fixtures";
import { CallGraph, type CallGraphProps } from "./CallGraph";
import type { CallGraphFetchParams } from "./types";

// SchemeInstall's data access with columns and fields as nodes: ten AsClient columns read by one SQL
// site, two AsPolicy columns, two Policy fields, AsActivity and a procedure writing AsClassGroup.
function renderColumns(props: Partial<CallGraphProps> = {}) {
  const fetchGraph = vi.fn(async (params: CallGraphFetchParams) => oipaDataGraph({ ...params, columns: true }));
  const view = render(<CallGraph root={DATA_IDS.install} fetchGraph={fetchGraph} vocabulary={OIPA_VOCABULARY} depth={3} dataAccess columns {...props} />);
  return { fetchGraph, ...view };
}

const ready = () => screen.findByRole("group", { name: "Call graph of SchemeInstall" });
const MERGED_READ = `${DATA_IDS.packet}|group:AsClient|read`;
const clientColumns = (container: HTMLElement) => container.querySelectorAll("[data-graph-node^='column:AsClient.']").length;

describe("CallGraph group collapse", () => {
  it("collapses a table from its chevron into its header and one merged read counting its columns, and expands it back", async () => {
    const { container } = renderColumns();
    await ready();
    const before = clientColumns(container);

    fireEvent.click(screen.getByRole("button", { name: "Collapse AsClient" }));
    const collapsed = {
      columns: clientColumns(container),
      header: container.querySelector("[data-graph-group-collapsed]")?.textContent,
      merged: container.querySelector(`[data-graph-edge-label="${MERGED_READ}"]`)?.textContent,
    };
    fireEvent.click(screen.getByRole("button", { name: "Expand AsClient" }));

    expect({ before, collapsed, after: clientColumns(container) }).toEqual({
      before: 10,
      collapsed: { columns: 0, header: "AsClient10 columns", merged: "10 columns" },
      after: 10,
    });
  });

  it("asks a controlling host to change the collapsed groups, from a chevron and from the toolbar", async () => {
    const onCollapsedGroupsChange = vi.fn();
    renderColumns({ collapsedGroups: ["AsClient"], onCollapsedGroupsChange });
    await ready();

    fireEvent.click(screen.getByRole("button", { name: "Expand AsClient" }));
    fireEvent.click(screen.getByRole("button", { name: "Collapse AsPolicy" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand all groups" }));
    fireEvent.click(screen.getByRole("button", { name: "Collapse all groups" }));

    const [expand, collapse, expandAll, collapseAll] = onCollapsedGroupsChange.mock.calls.map(([ids]: [string[]]) => ids);
    expect({ expand, collapse, expandAll, collapseAll: [...(collapseAll ?? [])].sort() }).toEqual({
      expand: [],
      collapse: ["AsClient", "AsPolicy"],
      expandAll: [],
      collapseAll: ["AsClassGroup", "AsClient", "AsPolicy", "Database", "Policy"],
    });
  });

  it("lists the sites and columns behind a merged read when it is selected", async () => {
    const { container } = renderColumns({ collapsedGroups: ["AsClient"], onCollapsedGroupsChange: () => {} });
    await ready();

    const pill = container.querySelector(`[data-graph-edge-label="${MERGED_READ}"]`);
    if (!pill) throw new Error("the merged read has no pill");
    fireEvent.click(pill);
    const sites = await screen.findByRole("region", { name: "Access sites" });

    // The chip list shows its first eight members before a "+2 more" button.
    expect({
      heading: within(sites).getByRole("heading").textContent,
      columns: within(within(sites).getByRole("list", { name: "Columns" })).getAllByRole("listitem").map((item) => item.getAttribute("data-member")),
    }).toEqual({ heading: "SchemeInstallPacket → AsClient", columns: DATA_CLIENT_COLUMNS.slice(0, 8) });
  });

  it("shows a collapsed group's details from its header, without offering to focus a node the host does not know", async () => {
    renderColumns({ collapsedGroups: ["AsClient"], onCollapsedGroupsChange: () => {}, onFocusNode: () => {} });
    await ready();

    fireEvent.click(screen.getByRole("button", { name: "Select AsClient" }));
    const details = await screen.findByRole("region", { name: "Node details" });

    expect({ heading: within(details).getByRole("heading").textContent, focus: within(details).queryByRole("button", { name: "Focus" }) })
      .toEqual({ heading: "AsClient", focus: null });
  });

  it("marks each field by how the packet accesses it", async () => {
    const { container } = renderColumns();
    await ready();
    const mark = (id: string) => container.querySelector(`[data-graph-node="${id}"] [data-access]`)?.getAttribute("aria-label");
    await waitFor(() => expect([mark(DATA_IDS.policyStatus), mark(DATA_IDS.schemeNumber), mark(DATA_IDS.packet)]).toEqual(["Read and written", "Read", undefined]));
  });
});
