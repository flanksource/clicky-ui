import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { TreeDataTable } from "./TreeDataTable";

type Node = { id: string; name: string; status: string; children?: Node[] };
const roots: Node[] = [
  { id: "acme", name: "Acme", status: "1 conflict", children: [
    { id: "policy", name: "Policy", status: "ready" },
    { id: "claim", name: "Claim", status: "conflict" },
  ] },
  { id: "globex", name: "Globex", status: "1 ready", children: [{ id: "quote", name: "Quote", status: "ready" }] },
];
const props = {
  roots,
  columns: [{ key: "name", label: "Permission" }, { key: "status", label: "Status" }],
  treeColumn: "name",
  getChildren: (node: Node) => node.children,
  getKey: (node: Node) => node.id,
  getAriaLabel: (node: Node) => node.name,
};
const names = () => screen.getAllByRole("row").slice(1).map((row) => row.querySelector("td")?.textContent);

describe("TreeDataTable", () => {
  it("lists open subtrees in tree order with parents and leaves sharing columns", () => {
    render(<TreeDataTable {...props} defaultExpanded={(node) => node.id === "acme"} />);
    expect(names()).toEqual(["Acme", "Policy", "Claim", "Globex"]);
    expect(screen.getByText("1 conflict")).toBeInTheDocument();
  });

  it("indents leaves one step past their parent", () => {
    render(<TreeDataTable {...props} defaultExpanded />);
    const lead = (text: string) => screen.getByText(text).closest<HTMLElement>("[data-tree-depth]")!;
    expect([lead("Acme").style.paddingLeft, lead("Policy").style.paddingLeft]).toEqual(["0rem", "1.25rem"]);
    expect(lead("Policy").querySelector('[aria-hidden="true"]')).toHaveClass("size-4");
  });

  it("expands a parent from the tree column's chevron", () => {
    render(<TreeDataTable {...props} />);
    expect(names()).toEqual(["Acme", "Globex"]);
    fireEvent.click(screen.getByRole("button", { name: "Expand Globex" }));
    expect(names()).toEqual(["Acme", "Globex", "Quote"]);
  });

  it("refuses a tree column that is not one of its columns", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TreeDataTable {...props} treeColumn="missing" />)).toThrow('treeColumn "missing"');
    consoleError.mockRestore();
  });
});
