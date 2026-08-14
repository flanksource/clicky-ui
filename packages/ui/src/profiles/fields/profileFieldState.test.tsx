import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProfileEditorPreview } from "../editor/profileEditorPreview";
import { ProfileFieldList } from "./profileFieldList";
import { useProfileFieldState } from "./profileFieldState";
import {
  applyVisibleFieldSelection,
  availableProfileFields,
  renameProfileField,
  reorderProfileColumns,
  type ProfileColumn,
} from "../wizard/profileWizardModel";

/** What the last sample (or the stored profile at open time) reported. */
const discovered: ProfileColumn[] = [
  { name: "created_at", type: "datetime" },
  { name: "body", type: "string" },
];

function ListProbe({ configured }: { configured: ProfileColumn[] }) {
  const state = useProfileFieldState({
    discovered,
    configured,
    activeName: "created_at",
    onConfiguredChange: () => undefined,
    onActiveNameChange: () => undefined,
  });
  return <ProfileFieldList state={state} />;
}

function EditableListProbe({
  configured,
  onConfiguredChange,
}: {
  configured: ProfileColumn[];
  onConfiguredChange: (columns: ProfileColumn[]) => void;
}) {
  const state = useProfileFieldState({
    discovered,
    configured,
    activeName: "created_at",
    onConfiguredChange,
    onActiveNameChange: () => undefined,
  });
  return <ProfileFieldList state={state} />;
}

describe("column configuration in the field list", () => {
  it("carries hide, filter and delete on every row, without selection or width controls", () => {
    const html = renderToStaticMarkup(
      <ListProbe
        configured={[
          { name: "created_at", type: "datetime" },
          { name: "body", type: "string", hidden: true },
        ]}
      />,
    );

    expect(html).toContain('aria-label="Hide created_at"');
    expect(html).toContain('aria-label="Show body"');
    expect(html).toContain('aria-label="Offer no filter for created_at"');
    expect(html).toContain('aria-label="Delete created_at"');
    expect(html).toContain('aria-label="Reorder created_at"');
    expect(html).not.toContain('aria-label="Include created_at"');
    expect(html).not.toContain('aria-label="Width for created_at"');
  });

  it("summarizes each collapsed row with what the column holds and how it filters", () => {
    const html = renderToStaticMarkup(
      <ListProbe
        configured={[
          { name: "created_at", type: "datetime", label: "Created", width: 40 },
          { name: "body", type: "string", filter: { disabled: true } },
        ]}
      />,
    );

    expect(html).toContain("Created");
    expect(html).toContain("datetime · date &amp; time range");
    expect(html).toContain("string · no filter");
  });

  it("offers filtering as a row action, alongside hide, and names the state it is in", () => {
    render(
      <EditableListProbe
        configured={[
          { name: "created_at", type: "datetime" },
          { name: "body", type: "string", filter: { disabled: true } },
        ]}
        onConfiguredChange={() => undefined}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Offer no filter for created_at" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter body" })).toBeInTheDocument();
    // The collapsed row still says how each column filters, without opening it.
    expect(screen.getByText("string · no filter")).toBeInTheDocument();
  });

  it("writes the filter toggle onto the column", () => {
    const onConfiguredChange = vi.fn();
    render(
      <EditableListProbe
        configured={[{ name: "created_at", type: "datetime" }]}
        onConfiguredChange={onConfiguredChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Offer no filter for created_at" }));
    expect(onConfiguredChange).toHaveBeenLastCalledWith([
      { name: "created_at", type: "datetime", filter: { disabled: true } },
    ]);
  });

  it("edits the active column in its own row rather than a separate pane", () => {
    render(
      <EditableListProbe
        configured={[
          { name: "created_at", type: "datetime" },
          { name: "body", type: "string" },
        ]}
        onConfiguredChange={() => undefined}
      />,
    );

    // created_at is the active field, so its panel is the one open.
    const disclosure = screen.getByRole("button", { name: /created_at/, expanded: true });
    expect(screen.getByRole("combobox", { name: "Data type" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /body/, expanded: false })).toBeInTheDocument();

    fireEvent.click(disclosure);

    expect(screen.queryByRole("combobox", { name: "Data type" })).not.toBeInTheDocument();
  });

  it("drags a configured row onto another to reorder, and withholds the handle from deleted ones", () => {
    const onConfiguredChange = vi.fn();
    render(
      <EditableListProbe
        configured={[
          { name: "body", type: "string" },
          { name: "created_at", type: "datetime" },
        ]}
        onConfiguredChange={onConfiguredChange}
      />,
    );

    const handle = screen.getByRole("button", { name: "Reorder created_at" });
    fireEvent.dragStart(handle, { dataTransfer: { setData: vi.fn(), setDragImage: vi.fn() } });
    fireEvent.drop(screen.getByRole("button", { name: /body/, expanded: false }), {
      dataTransfer: { getData: () => "1" },
    });

    expect(onConfiguredChange).toHaveBeenLastCalledWith([
      { name: "created_at", type: "datetime" },
      { name: "body", type: "string" },
    ]);
  });

  it("offers a deleted column its way back, since the row is the only editor left", () => {
    const onConfiguredChange = vi.fn();
    render(
      <EditableListProbe
        configured={[{ name: "created_at", type: "datetime" }]}
        onConfiguredChange={onConfiguredChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Restore body" }));

    expect(onConfiguredChange).toHaveBeenLastCalledWith([
      { name: "created_at", type: "datetime" },
      { name: "body", type: "string" },
    ]);
  });

  it("strikes deleted fields and mutes hidden fields", () => {
    const html = renderToStaticMarkup(
      <ListProbe
        configured={[
          { name: "created_at", type: "datetime", hidden: true },
        ]}
      />,
    );

    expect(html).toMatch(/data-field-state="hidden"[^>]*text-muted-foreground[^>]*opacity-60/);
    expect(html).toMatch(/data-field-state="deleted"[^>]*line-through[^>]*opacity-60/);
  });

  it("offers the configured field to editors, so a grid edit composes onto inspector edits", () => {
    expect(
      availableProfileFields(discovered, [
        { name: "created_at", type: "datetime", label: "Created", cel: "row.created_at" },
        { name: "computed", type: "string", cel: "row.a + row.b" },
      ]),
    ).toEqual([
      { name: "created_at", type: "datetime", label: "Created", cel: "row.created_at" },
      { name: "body", type: "string" },
      { name: "computed", type: "string", cel: "row.a + row.b" },
    ]);
  });

  it("replaces a discovered field with its renamed output field", () => {
    expect(
      availableProfileFields(discovered, [
        { name: "created", source: "created_at", type: "datetime" },
        { name: "body", type: "string" },
      ]),
    ).toEqual([
      { name: "created", source: "created_at", type: "datetime" },
      { name: "body", type: "string" },
    ]);
  });

  it("offers a drag handle on configured fields and withholds it from deleted ones", () => {
    const html = renderToStaticMarkup(
      <ListProbe configured={[{ name: "created_at", type: "datetime" }]} />,
    );

    /** The opening tag of the reorder handle for `name`. */
    const handle = (name: string) => {
      const at = html.indexOf(`aria-label="Reorder ${name}"`);
      expect(at, `no reorder handle for ${name}`).toBeGreaterThan(-1);
      return html.slice(html.lastIndexOf("<", at), html.indexOf(">", at));
    };

    expect(handle("created_at")).not.toMatch(/\sdisabled=/);
    expect(handle("body")).toMatch(/\sdisabled=/);
  });

  it("records the original provider key when a direct field is renamed", () => {
    expect(renameProfileField({ name: "created_at", type: "datetime" }, "created"))
      .toEqual({ name: "created", source: "created_at", type: "datetime" });
    expect(renameProfileField(
      { name: "created", source: "created_at", type: "datetime" },
      "created_on",
    )).toEqual({ name: "created_on", source: "created_at", type: "datetime" });
    expect(renameProfileField(
      { name: "calculated", cel: "row.a + row.b" },
      "total",
    )).toEqual({ name: "total", cel: "row.a + row.b" });
  });

  it("previews the renamed value before another sample is run", () => {
    const html = renderToStaticMarkup(
      <ProfileEditorPreview
        columns={[{ name: "created", source: "created_at" }]}
        rows={[{ created_at: "2026-08-04" }]}
      />,
    );

    expect(html).toContain(">created</th>");
    expect(html).toContain(">2026-08-04</td>");
    expect(html).not.toContain(">created_at</th>");
  });
});

/** Reordering is what a row drag writes, so these cover the order the grid then
 *  shows and the order the profile saves. */
describe("column order", () => {
  const columns: ProfileColumn[] = [
    { name: "created_at" },
    { name: "body" },
    { name: "level" },
  ];

  it("drops a dragged column onto the target position, shifting the ones between", () => {
    expect(reorderProfileColumns(columns, "level", "created_at").map((c) => c.name))
      .toEqual(["level", "created_at", "body"]);
    expect(reorderProfileColumns(columns, "created_at", "level").map((c) => c.name))
      .toEqual(["body", "level", "created_at"]);
  });

  it("leaves the order alone when either end of the drag is not configured", () => {
    expect(reorderProfileColumns(columns, "missing", "body")).toBe(columns);
    expect(reorderProfileColumns(columns, "body", "missing")).toBe(columns);
    expect(reorderProfileColumns(columns, "body", "body")).toBe(columns);
  });

  it("shows the grid the configured order, not the order the source reported", () => {
    expect(
      availableProfileFields(discovered, [
        { name: "body", type: "string" },
        { name: "created_at", type: "datetime" },
      ]).map((field) => field.name),
    ).toEqual(["body", "created_at"]);
  });

  it("keeps a deleted field where the grid last showed it, after its sample neighbour", () => {
    expect(
      availableProfileFields(
        [{ name: "created_at" }, { name: "body" }, { name: "level" }],
        [{ name: "level" }, { name: "created_at" }],
      ).map((field) => field.name),
    ).toEqual(["level", "created_at", "body"]);
  });

  it("survives a deletion, which must not resort the rest into sample order", () => {
    expect(
      applyVisibleFieldSelection(
        [{ name: "created_at" }, { name: "body" }, { name: "level" }],
        [{ name: "level" }, { name: "created_at" }, { name: "body" }],
        new Set(["body"]),
        false,
      ).map((field) => field.name),
    ).toEqual(["level", "created_at"]);
  });
});
