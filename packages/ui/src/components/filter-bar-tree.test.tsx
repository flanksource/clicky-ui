import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { FilterBar, type FilterBarFilter } from "./FilterBar";
import { FILTER_INPUT_DEBOUNCE_MS } from "./filter-bar-context";
import { TreeFilterField } from "./filter-bar-tree";
import {
  treeSelectionSummary,
  type FilterBarTreeFilter,
  type FilterTreeNode,
} from "./filter-bar-tree-model";

type TreeValue = FilterBarTreeFilter["value"];

const NODES: FilterTreeNode[] = [
  {
    key: "acme",
    label: "Acme",
    children: [
      {
        key: "acme/billing",
        label: "Billing",
        children: [
          { key: "acme/billing/invoices", label: "Invoices", description: "Open and paid" },
          { key: "acme/billing/payments", label: "Payments" },
        ],
      },
      { key: "acme/support", label: "Support" },
    ],
  },
  { key: "globex", label: "Globex", children: [{ key: "globex/overview", label: "Overview" }] },
];

// A tree wide enough that Tree turns its search box on (more than 20 edges).
const WIDE_NODES: FilterTreeNode[] = [
  {
    key: "wide",
    label: "Wide",
    children: Array.from({ length: 24 }, (_, index) => ({
      key: `wide/page-${index}`,
      label: `Page ${index}`,
    })),
  },
];

function treeFilter(overrides: Partial<FilterBarTreeFilter> = {}): FilterBarTreeFilter {
  return {
    key: "pages",
    kind: "tree",
    label: "Pages",
    value: {},
    nodes: NODES,
    onChange: vi.fn(),
    ...overrides,
  };
}

function Harness({
  initial = {},
  nodes = NODES,
  onChange,
  placeholder,
}: {
  initial?: TreeValue;
  nodes?: FilterTreeNode[];
  onChange?: (value: TreeValue) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState<TreeValue>(initial);
  return (
    <TreeFilterField
      grow
      filter={treeFilter({
        value,
        nodes,
        onChange: (next) => {
          setValue(next);
          onChange?.(next);
        },
        ...(placeholder !== undefined ? { placeholder } : {}),
      })}
    />
  );
}

function trigger() {
  return screen.getByRole("button", { name: "Pages" });
}

function open() {
  fireEvent.click(trigger());
}

// The switch's accessible name is the node label; the row's own caret is named
// "Expand"/"Collapse", so a name match never confuses the two.
function switchFor(label: string) {
  return screen.getByRole("button", { name: label });
}

function regionOf(label: string, region: "exclude" | "neutral" | "include") {
  const target = switchFor(label).querySelector(`[data-tristate-region="${region}"]`);
  if (!target) throw new Error(`no ${region} region on ${label}`);
  return target;
}

async function committed(onChange: ReturnType<typeof vi.fn>) {
  await waitFor(() => expect(onChange).toHaveBeenCalled(), {
    timeout: FILTER_INPUT_DEBOUNCE_MS * 4,
  });
  return onChange.mock.calls.at(-1)?.[0] as TreeValue;
}

describe("treeSelectionSummary", () => {
  it("names included nodes and prefixes excluded ones with a minus sign", () => {
    expect(
      treeSelectionSummary(NODES, { acme: "include", "acme/billing/payments": "exclude" }),
    ).toBe("Acme, −Payments");
  });

  it("is empty when nothing is selected", () => {
    expect(treeSelectionSummary(NODES, {})).toBe("");
  });

  it("falls back to the raw key for a selection that is not in the tree", () => {
    expect(treeSelectionSummary(NODES, { "gone/page": "include" })).toBe("gone/page");
  });
});

describe("TreeFilterField", () => {
  it("shows the inline label and, with a selection, the selected node labels", () => {
    render(<Harness initial={{ globex: "include", "acme/support": "exclude" }} />);
    expect(trigger()).toHaveTextContent("Pages");
    expect(trigger()).toHaveTextContent("Globex, −Support");
  });

  it("shows only an explicit placeholder when nothing is selected", () => {
    const { unmount } = render(<Harness />);
    expect(trigger()).toHaveTextContent(/^Pages$/);
    unmount();
    render(<Harness placeholder="Any page" />);
    expect(trigger()).toHaveTextContent("Any page");
  });

  it("includes a folder from its switch, and keeps the panel open", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    open();
    fireEvent.click(regionOf("Acme", "include"));
    expect(await committed(onChange)).toEqual({ acme: "include" });
    expect(screen.getByRole("tree")).toBeInTheDocument();
    expect(trigger()).toHaveTextContent("Acme");
  });

  it("excludes a leaf from its switch", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    open();
    fireEvent.click(screen.getByText("Acme"));
    fireEvent.click(regionOf("Support", "exclude"));
    expect(await committed(onChange)).toEqual({ "acme/support": "exclude" });
  });

  it("cycles a leaf neutral, include, exclude, neutral when its row is clicked", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    open();
    // The trigger summary repeats the label once the node is selected.
    const row = () => within(screen.getByRole("tree")).getByText("Overview");
    fireEvent.click(screen.getByText("Globex"));

    fireEvent.click(row());
    expect(await committed(onChange)).toEqual({ "globex/overview": "include" });
    fireEvent.click(row());
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ "globex/overview": "exclude" }), {
      timeout: FILTER_INPUT_DEBOUNCE_MS * 4,
    });
    fireEvent.click(row());
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({}), {
      timeout: FILTER_INPUT_DEBOUNCE_MS * 4,
    });
  });

  it("does not select a folder when its row is clicked, it only expands", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    open();
    expect(screen.queryByText("Support")).toBeNull();
    fireEvent.click(screen.getByText("Acme"));
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("opens straight to a deeply selected node without manual expansion", () => {
    render(<Harness initial={{ "acme/billing/invoices": "exclude" }} />);
    open();
    expect(within(screen.getByRole("tree")).getByText("Invoices")).toBeInTheDocument();
    expect(screen.getByText("Open and paid")).toBeInTheDocument();
  });

  it("filters the tree by label when it is wide enough to show a search box", () => {
    render(<Harness nodes={WIDE_NODES} />);
    open();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Page 17" } });
    expect(screen.getByText("Page 17")).toBeInTheDocument();
    expect(screen.queryByText("Page 3")).toBeNull();
  });

  it("does not open when disabled", () => {
    render(<TreeFilterField grow filter={treeFilter({ disabled: true })} />);
    fireEvent.click(trigger());
    expect(screen.queryByRole("tree")).toBeNull();
  });
});

describe("FilterBar kind: tree", () => {
  function Bar({ onChange }: { onChange: (value: TreeValue) => void }) {
    const [value, setValue] = useState<TreeValue>({ acme: "include", "acme/billing": "exclude" });
    const filters: FilterBarFilter[] = [
      treeFilter({
        value,
        onChange: (next) => {
          setValue(next);
          onChange(next);
        },
      }),
    ];
    return <FilterBar filters={filters} />;
  }

  it("renders the tree filter in the bar and round-trips an edit through onChange", async () => {
    const onChange = vi.fn();
    render(<Bar onChange={onChange} />);
    expect(trigger()).toHaveTextContent("Acme, −Billing");
    open();
    fireEvent.click(regionOf("Acme", "include"));
    expect(await committed(onChange)).toEqual({ "acme/billing": "exclude" });
  });
});
