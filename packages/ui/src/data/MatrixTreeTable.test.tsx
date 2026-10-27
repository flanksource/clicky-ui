import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MatrixTreeTable } from "./MatrixTreeTable";

type Node = { id: string; name: string; cells?: string[]; children?: Node[] };
const roots: Node[] = [
  { id: "acme", name: "Acme", children: [
    { id: "policy", name: "Policy", cells: ["Y", ""] },
    { id: "claims", name: "Claims", children: [{ id: "claim", name: "Claim", cells: ["", "Y"] }] },
  ] },
];
const props = {
  roots,
  columns: ["Operators", "Finance"],
  getChildren: (node: Node) => node.children,
  getKey: (node: Node) => node.id,
  getAriaLabel: (node: Node) => node.name,
  renderLabel: (node: Node) => node.name,
  getCells: (node: Node) => node.cells ?? [],
};
const bodyRows = (container: HTMLElement) => [...container.querySelectorAll("tbody tr")].map((row) => row.textContent);

describe("MatrixTreeTable", () => {
  it("renders parents as spanning group bands and leaves as cell rows", () => {
    const { container } = render(<MatrixTreeTable {...props} defaultExpanded />);
    expect(bodyRows(container)).toEqual(["Acme", "PolicyY", "Claims", "ClaimY"]);
    expect(screen.getByRole("rowheader", { name: "Policy" })).toBeInTheDocument();
    expect(container.querySelector('[data-matrix-group="claims"] th')).toHaveAttribute("colspan", "3");
  });

  it("indents each leaf one step past its parent, behind a chevron-sized spacer", () => {
    const { container } = render(<MatrixTreeTable {...props} defaultExpanded />);
    const lead = (text: string) => screen.getByText(text).closest<HTMLElement>("[data-tree-depth]")!;
    expect([lead("Acme").style.paddingLeft, lead("Claims").style.paddingLeft, lead("Claim").style.paddingLeft]).toEqual(["0rem", "1.25rem", "2.5rem"]);
    expect(lead("Claim").querySelector('[aria-hidden="true"]')).toHaveClass("size-4");
    expect(container.querySelectorAll('tbody th[scope="row"] > div')).toHaveLength(0);
  });

  it("collapses a parent's subtree from its chevron", () => {
    const { container } = render(<MatrixTreeTable {...props} defaultExpanded={(_node, depth) => depth < 1} />);
    expect(bodyRows(container)).toEqual(["Acme", "PolicyY", "Claims"]);
    fireEvent.click(screen.getByRole("button", { name: "Collapse Acme" }));
    expect(bodyRows(container)).toEqual(["Acme"]);
    fireEvent.click(screen.getByRole("button", { name: "Expand Acme" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand Claims" }));
    expect(bodyRows(container)).toEqual(["Acme", "PolicyY", "Claims", "ClaimY"]);
  });

  it("reports toggles through controlled expansion without changing on its own", () => {
    const onExpandedChange = vi.fn();
    const { container } = render(<MatrixTreeTable {...props} expanded={{ acme: true }} onExpandedChange={onExpandedChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Expand Claims" }));
    expect(onExpandedChange).toHaveBeenCalledWith({ acme: true, claims: true });
    expect(bodyRows(container)).toEqual(["Acme", "PolicyY", "Claims"]);
  });
});
