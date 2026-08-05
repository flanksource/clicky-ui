import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LookupTreeControl } from "./json-schema-form-lookup-tree";
import type { FieldControl, FieldOption } from "./json-schema-form-types";

// The motivating dataset: dotted profile names where a parent segment is often
// itself a real profile (`jms`), and `logs` is a folder nothing selects.
const OPTIONS: FieldOption[] = [
  { value: "jms", label: "jms" },
  { value: "jms.incoming", label: "jms.incoming" },
  { value: "jms.incoming.disbursements", label: "jms.incoming.disbursements" },
  { value: "logs.api", label: "logs.api" },
  { value: "remote-debugger.jdbc", label: "remote-debugger.jdbc" },
];

const HIERARCHY = { delimiters: "./" };

function control(overrides: Partial<FieldControl> = {}): FieldControl {
  return {
    key: "dest",
    label: "Destination",
    kind: "lookup",
    schema: { type: "string" },
    required: false,
    value: undefined,
    onChange: vi.fn(),
    options: [],
    lookup: { url: "/api/v1/profiles", filter: "name", hierarchy: HIERARCHY },
    ...overrides,
  } as FieldControl;
}

function renderControl(field: FieldControl) {
  render(
    <LookupTreeControl
      field={field}
      fieldId="dest"
      readOnly={false}
      size="md"
      options={OPTIONS}
      loading={false}
      hierarchy={HIERARCHY}
    />,
  );
}

function panel(): HTMLElement {
  const found = document.querySelector<HTMLElement>(
    '[data-slot="tree-picker-popup"]',
  );
  if (!found) throw new Error("picker panel is not open");
  return found;
}

function openPicker(name: RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
}

// Branches start closed, so a test that wants a nested row must open its parent
// first — via the caret, which toggles without committing. Clicking the row
// label instead would commit whenever that row is itself an option.
function expandBranch(label: string) {
  const row = within(panel()).getByText(label).closest('[role="treeitem"]');
  fireEvent.click(
    within(row as HTMLElement).getAllByRole("button", { name: /Expand/ })[0]!,
  );
}

describe("LookupTreeControl — single select", () => {
  it("browses option labels as a tree instead of a flat list", () => {
    renderControl(control());
    openPicker(/Select/);
    // Only the roots are visible until a branch is opened — the point of the
    // tree over a 55-row scrolling list.
    expect(within(panel()).getByText("jms")).toBeTruthy();
    expect(within(panel()).getByText("logs")).toBeTruthy();
    expect(within(panel()).queryByText("disbursements")).toBeNull();
  });

  it("commits the option's own value, never the path", () => {
    const onChange = vi.fn();
    renderControl(control({ onChange }));
    openPicker(/Select/);
    expandBranch("jms");
    fireEvent.click(within(panel()).getByText("incoming"));
    // "jms/incoming" is the tree's internal key; the committed value is the
    // option's own, with the producer's delimiter intact.
    expect(onChange).toHaveBeenCalledWith("jms.incoming");
  });

  // A node that is both a folder and a leaf must stay selectable — clicking
  // `jms` has to commit the `jms` profile, not merely expand the branch.
  it("keeps a folder that is also an option selectable", () => {
    const onChange = vi.fn();
    renderControl(control({ onChange }));
    openPicker(/Select/);
    fireEvent.click(within(panel()).getByText("jms"));
    expect(onChange).toHaveBeenCalledWith("jms");
  });

  // Without the caret a folder-and-leaf node would be unreachable: clicking its
  // label commits and closes the panel, so its children could never be opened.
  it("browses past a folder that is also an option without committing it", () => {
    const onChange = vi.fn();
    renderControl(control({ onChange }));
    openPicker(/Select/);
    expandBranch("jms");
    expect(onChange).not.toHaveBeenCalled();
    expect(within(panel()).getByText("incoming")).toBeTruthy();
  });

  it("expands a folder no option names instead of committing it", () => {
    const onChange = vi.fn();
    renderControl(control({ onChange }));
    openPicker(/Select/);
    expect(within(panel()).queryByText("api")).toBeNull();

    // A pure folder has nothing to commit, so even the row label just toggles.
    fireEvent.click(within(panel()).getByText("logs"));
    expect(onChange).not.toHaveBeenCalled();
    // The click still does something useful — it opens the branch — and the
    // panel stays open, unlike a committing click.
    expect(within(panel()).getByText("api")).toBeTruthy();
  });

  // A hyphen is an ordinary name character; splitting it would invent a
  // "remote" folder that does not exist.
  it("splits only on the declared delimiters", () => {
    renderControl(control());
    openPicker(/Select/);
    expect(within(panel()).getByText("remote-debugger")).toBeTruthy();
    expect(within(panel()).queryByText("remote")).toBeNull();
  });

  it("shows the committed value on the trigger and reveals it in the tree", () => {
    renderControl(control({ value: "jms.incoming.disbursements" }));
    expect(
      screen.getByRole("button", { name: /jms\.incoming\.disbursements/ }),
    ).toBeTruthy();
    openPicker(/jms\.incoming\.disbursements/);
    expect(
      panel().querySelector('[aria-selected="true"]'),
    ).toHaveTextContent("disbursements");
  });
});

describe("LookupTreeControl — multi select", () => {
  function multiControl(overrides: Partial<FieldControl> = {}) {
    return control({
      lookup: {
        url: "/api/v1/profiles",
        filter: "name",
        multi: true,
        hierarchy: HIERARCHY,
      },
      ...overrides,
    });
  }

  it("renders each committed value as a chip and appends a new one", () => {
    const onChange = vi.fn();
    renderControl(multiControl({ value: ["jms"], onChange }));
    expect(screen.getByText("jms")).toBeTruthy();

    openPicker(/Add Destination/);
    expandBranch("logs");
    fireEvent.click(within(panel()).getByText("api"));
    expect(onChange).toHaveBeenCalledWith(["jms", "logs.api"]);
  });

  it("removes a chip without disturbing the others", () => {
    const onChange = vi.fn();
    renderControl(multiControl({ value: ["jms", "logs.api"], onChange }));
    fireEvent.click(screen.getByRole("button", { name: "Remove jms" }));
    expect(onChange).toHaveBeenCalledWith(["logs.api"]);
  });

  it("leaves an already-chosen option visible but inert", () => {
    const onChange = vi.fn();
    renderControl(multiControl({ value: ["jms"], onChange }));
    openPicker(/Add Destination/);
    // `jms` is still shown (so the branch can be opened) but re-clicking it
    // must not duplicate the entry.
    fireEvent.click(within(panel()).getByText("jms"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores a non-array value rather than rendering broken chips", () => {
    renderControl(multiControl({ value: "jms" }));
    expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Add Destination/ })).toBeTruthy();
  });

  it("offers no add affordance and no remove buttons when read only", () => {
    render(
      <LookupTreeControl
        field={multiControl({ value: ["jms"] })}
        fieldId="dest"
        readOnly
        size="md"
        options={OPTIONS}
        loading={false}
        hierarchy={HIERARCHY}
      />,
    );
    expect(screen.getByText("jms")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Add/ })).toBeNull();
  });
});
