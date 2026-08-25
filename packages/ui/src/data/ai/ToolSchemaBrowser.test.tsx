import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolSchemaBrowser } from "./ToolSchemaBrowser";
import type { ToolMeta } from "../chat/types";

// Two entities in Xero Read whose list operations share the label "List"; the
// parent surface is what distinguishes them. Contacts also has a Get, and a
// separate Xero Write tool exercises a second group. Header buttons carry a
// trailing count (e.g. "Xero Read 3"), so match them by prefix.
const TOOLS: ToolMeta[] = [
  {
    name: "xero_accounts_list",
    label: "List",
    group: "Xero Read",
    parent: "Xero Accounts",
    description: "List account balances from Xero.",
    strict: true,
    annotations: {
      title: "List accounts",
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
      source: "catalog",
    },
    inputSchema: {
      type: "object",
      properties: {
        tenantId: {
          type: "string",
          description: "Connected Xero tenant id.",
        },
      },
      required: ["tenantId"],
      additionalProperties: false,
    },
  },
  {
    name: "xero_contacts_list",
    label: "List",
    group: "Xero Read",
    parent: "Xero Contacts",
    strict: true,
  },
  {
    name: "xero_contacts_get",
    label: "Get",
    group: "Xero Read",
    parent: "Xero Contacts",
  },
  {
    name: "xero_transactions_split",
    label: "Split",
    group: "Xero Write",
    parent: "Xero Transactions",
    annotations: { destructiveHint: true },
  },
];

function follows(before: Element, after: Element): boolean {
  return Boolean(
    before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
}

describe("ToolSchemaBrowser", () => {
  it("renders a split detail pane with selected tool id, strictness, and annotations", () => {
    render(<ToolSchemaBrowser tools={TOOLS} />);

    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
    expect(screen.getAllByText("xero_accounts_list").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Strict").length).toBeGreaterThan(0);
    expect(screen.getByText("Tool ID")).toBeInTheDocument();
    expect(screen.getByText("Annotations")).toBeInTheDocument();
    expect(screen.getByText("readOnlyHint")).toBeInTheDocument();
    expect(screen.getByText("idempotentHint")).toBeInTheDocument();
    expect(screen.getByText("openWorldHint")).toBeInTheDocument();
    expect(screen.getAllByText("Read only").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Idempotent").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Open world").length).toBeGreaterThan(0);
  });

  it("keeps sidebar rows free of tool ids and metadata badges", () => {
    render(<ToolSchemaBrowser tools={TOOLS} />);

    expect(
      screen.queryByRole("button", { name: /xero_accounts_list/ }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: /Strict/ })).toBeNull();
    expect(
      screen.getAllByRole("button", { name: "List" })[0],
    ).not.toHaveTextContent("Read only");
    expect(screen.getByText("Tool ID")).toBeInTheDocument();
    expect(screen.getAllByText("xero_accounts_list").length).toBeGreaterThan(0);
  });

  it("shows compact safety glyphs in the tree without adding hint text to the row", () => {
    render(<ToolSchemaBrowser tools={TOOLS} />);

    const rows = screen.getAllByRole("button", { name: "List" });
    expect(rows[0]).toContainElement(screen.getByLabelText("Read only tool"));
    expect(rows[0]).toContainElement(screen.getByLabelText("Idempotent tool"));
    expect(rows[0]).toContainElement(screen.getByLabelText("Open world tool"));
    expect(rows[0]).not.toHaveTextContent("Read only");
  });

  it("filters annotations from one dropdown menu with explicit tri-state controls", () => {
    render(<ToolSchemaBrowser tools={TOOLS} />);

    expect(screen.queryByText("Tool annotations")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Filter tool annotations" }),
    );
    expect(
      screen.getByText("Tool annotations").closest('[role="menu"]'),
    ).toHaveAttribute("aria-label", "Tool annotation filters");
    const readOnlyFilter = screen.getByRole("radiogroup", {
      name: "Read only",
    });

    fireEvent.click(within(readOnlyFilter).getByRole("radio", { name: "Yes" }));
    expect(screen.getAllByRole("button", { name: "List" })).toHaveLength(1);
    expect(
      screen.getByRole("button", {
        name: "Filter tool annotations, 1 active",
      }),
    ).toBeInTheDocument();

    fireEvent.click(within(readOnlyFilter).getByRole("radio", { name: "No" }));
    expect(screen.queryByLabelText("Read only tool")).not.toBeInTheDocument();
  });

  it("bulk-selects visible descendants and emits one ordered exact-name rule", () => {
    const onRule = vi.fn();
    const { rerender } = render(
      <ToolSchemaBrowser
        tools={TOOLS}
        value={{
          xero_accounts_list: "allow",
          xero_contacts_list: "ask",
          xero_contacts_get: "ask",
          xero_transactions_split: "deny",
        }}
        onRule={onRule}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search tools"), {
      target: { value: "contacts" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Select all visible tools in Xero Read",
      }),
    );
    expect(screen.getByText("2 selected")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "On" }));
    fireEvent.click(screen.getByRole("button", { name: "Save strategy" }));

    expect(onRule).toHaveBeenCalledWith({
      name: ["xero_contacts_get", "xero_contacts_list"],
      policy: "allow",
    });
    expect(screen.queryByText("2 selected")).not.toBeInTheDocument();

    rerender(
      <ToolSchemaBrowser
        tools={TOOLS}
        value={{
          xero_contacts_list: "allow",
          xero_contacts_get: "allow",
        }}
        onRule={onRule}
      />,
    );
    expect(screen.getAllByText("On")).toHaveLength(2);
  });

  it("adds metadata strategies by clicking directory row headers", () => {
    const onRule = vi.fn();
    render(<ToolSchemaBrowser tools={TOOLS} onRule={onRule} />);

    fireEvent.click(screen.getByRole("button", { name: /^Xero Read/ }));
    expect(onRule).toHaveBeenLastCalledWith({
      group: "Xero Read",
      policy: "ask",
    });

    fireEvent.click(screen.getByRole("button", { name: /^Xero Accounts/ }));
    expect(onRule).toHaveBeenLastCalledWith({
      group: "Xero Read",
      parent: "Xero Accounts",
      policy: "ask",
    });

    fireEvent.click(screen.getByRole("button", { name: "Tree" }));
    fireEvent.click(screen.getByRole("button", { name: /^Xero Accounts/ }));
    expect(onRule).toHaveBeenLastCalledWith({
      parent: "Xero Accounts",
      policy: "ask",
    });
  });

  it("keeps duplicate 'List' labels distinct by nesting them under their parent surface", () => {
    render(<ToolSchemaBrowser tools={TOOLS} />);
    // The bug this replaces rendered every entity list as one identical row.
    expect(screen.getAllByRole("button", { name: "List" })).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /^Xero Accounts/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Xero Contacts/ }),
    ).toBeInTheDocument();
  });

  it("nests the parent surface inside each tool-group in the default group view", () => {
    render(<ToolSchemaBrowser tools={TOOLS} />);
    const group = screen.getByRole("button", { name: /^Xero Read/ });
    const parent = screen.getByRole("button", { name: /^Xero Accounts/ });
    // Group is the outer level, so its header precedes the parent header.
    expect(follows(group, parent)).toBe(true);
    // A group appears exactly once as an outer section.
    expect(screen.getAllByRole("button", { name: /^Xero Read/ })).toHaveLength(
      1,
    );
  });

  it("flips to a tree view where the group nests inside each parent surface", () => {
    render(<ToolSchemaBrowser tools={TOOLS} />);
    fireEvent.click(screen.getByRole("button", { name: /Tree/ }));
    const parent = screen.getByRole("button", { name: /^Xero Accounts/ });
    const nestedGroups = screen.getAllByRole("button", { name: /^Xero Read/ });
    // Parent is now the outer level, preceding its nested group header.
    expect(follows(parent, nestedGroups[0])).toBe(true);
    // The group now recurs once under every parent that owns Xero Read tools.
    expect(nestedGroups.length).toBeGreaterThan(1);
  });

  it("collapses a section to hide its nested contents", () => {
    render(<ToolSchemaBrowser tools={TOOLS} />);
    expect(
      screen.getByRole("button", { name: /^Xero Accounts/ }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Xero Read/ }));
    expect(
      screen.queryByRole("button", { name: /^Xero Accounts/ }),
    ).not.toBeInTheDocument();
  });

  it("renders input schemas on the Schema tab", () => {
    render(<ToolSchemaBrowser tools={TOOLS} />);

    expect(screen.getByRole("tab", { name: "Schema" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("tenantId")).toBeInTheDocument();
    expect(screen.getByText("Connected Xero tenant id.")).toBeInTheDocument();
  });

  it("renders the runtime tool payload on the JSON tab", () => {
    render(<ToolSchemaBrowser tools={TOOLS} />);

    fireEvent.click(screen.getByRole("tab", { name: "JSON" }));
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText('"xero_accounts_list"')).toBeInTheDocument();
    expect(screen.getByText("strict")).toBeInTheDocument();
    expect(screen.getByText("annotations")).toBeInTheDocument();
    expect(screen.getAllByText("readOnlyHint").length).toBeGreaterThan(1);
    expect(screen.getByText('"List accounts"')).toBeInTheDocument();
  });
});
