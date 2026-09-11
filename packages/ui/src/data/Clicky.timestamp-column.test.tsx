import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClickyTable } from "./Clicky";

// A ClickyColumn with kind:"timestamp" used to always get a custom `render`
// (ClickyNodeRenderer on the raw ClickyNode), which permanently shadowed
// DataTable's own `applyKindDefaults` timestamp renderer (DataTable.tsx:4008)
// — the column never got the adaptive relative/short/iso format or the
// full-ISO hover tooltip DataTable's <Timestamp> component supplies. The fix
// feeds the column's accessor the raw scalar (filterValue, falling back to
// plain/text) instead of the ClickyNode, so DataTable's default kicks in.
describe("ClickyTable timestamp column", () => {
  // "name" is explicitly unsortable so ClickyTable's "first sortable column"
  // default-sort picks "time" — the column under test — rather than "name".
  const columns = [
    { name: "name", label: "Name", sortable: false },
    { name: "time", label: "Time", kind: "timestamp" as const, sortable: true },
  ];

  it("renders through DataTable's own Timestamp component, not a raw ISO string", () => {
    render(
      <ClickyTable
        columns={columns}
        rows={[
          {
            cells: {
              name: { kind: "text", text: "first", plain: "first" },
              time: {
                kind: "text",
                text: "2026-09-10T06:44:53.930Z",
                plain: "2026-09-10T06:44:53.930Z",
                filterValue: "2026-09-10T06:44:53.930Z",
              },
            },
          },
        ]}
      />,
    );

    // DataTable's <Timestamp> carries the full ISO instant as a title
    // attribute (showTitleOnHover) — the one behavior a plain ClickyNode
    // <span> never reproduces, so it is the signal the default kicked in.
    const cell = screen
      .getByText("first")
      .closest("tr")
      ?.querySelector("td:nth-child(2)");
    expect(cell).not.toBeNull();
    const titled = cell!.querySelector("[title]");
    expect(titled).not.toBeNull();
    expect(titled!.getAttribute("title")).toContain("2026-09-10");
  });

  it("sorts by the parsed timestamp, not by the formatted display text", () => {
    render(
      <ClickyTable
        columns={columns}
        rows={[
          {
            cells: {
              name: { kind: "text", text: "later", plain: "later" },
              time: {
                kind: "text",
                text: "later",
                plain: "later",
                filterValue: "2026-09-10T08:00:00.000Z",
              },
            },
          },
          {
            cells: {
              name: { kind: "text", text: "earlier", plain: "earlier" },
              time: {
                kind: "text",
                text: "earlier",
                plain: "earlier",
                filterValue: "2026-09-10T06:00:00.000Z",
              },
            },
          },
        ]}
      />,
    );

    // ClickyTable picks the first sortable column as the default ascending
    // sort — "time" here — so rows should come back earliest-first even
    // though "later"'s row was listed first in the input.
    const names = screen.getAllByRole("row").slice(1).map((row) => row.textContent);
    expect(names[0]).toContain("earlier");
    expect(names[1]).toContain("later");
  });
});
