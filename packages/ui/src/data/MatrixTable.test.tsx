import { render, screen } from "@testing-library/react";
import { MatrixTable } from "./MatrixTable";

const columns = ["read", "environment-read"];
const rows = [{ key: "global", label: "Global", cells: ["yes", "no"] }];

describe("MatrixTable", () => {
  it.each([{ headers: columns }, { headers: [] }])("keeps headers and controls available with no rows ($headers)", ({ headers }) => {
    render(<MatrixTable columns={headers} rows={[]} corner={<button>Add source</button>} emptyMessage="Choose sources" />);
    expect(screen.getByRole("columnheader", { name: "Add source" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add source" })).toBeEnabled();
    expect(screen.getByRole("cell", { name: "Choose sources" })).toHaveAttribute("colspan", String(headers.length + 1));
  });
  it("uses one sticky background plane for angled headers", () => {
    const { container } = render(
      <MatrixTable
        columns={columns}
        rows={rows}
        corner="Scope"
        angledHeaders
        headerClassName="bg-background"
      />,
    );

    const head = container.querySelector("thead");
    const row = head?.querySelector("tr");
    const corner = screen.getByRole("columnheader", { name: "Scope" });
    const angled = screen.getByRole("columnheader", { name: "environment-read" });

    expect(head).toHaveClass("sticky", "top-0", "z-20");
    expect(row).toHaveClass("bg-background");
    expect(corner).toHaveClass("sticky", "left-0", "z-30", "bg-background");
    expect(angled).toHaveClass("relative", "overflow-visible", "bg-transparent");
    expect(angled).not.toHaveClass("sticky", "top-0", "z-20", "bg-background");
  });

  it("anchors angled header labels to the center of their body cells", () => {
    render(<MatrixTable columns={columns} rows={rows} angledHeaders />);

    const label = screen.getByText("environment-read");

    expect(label).toHaveClass("absolute", "bottom-0");
    expect(label).not.toHaveClass("bottom-2");
    expect(label).toHaveStyle({
      left: "24px",
      transform: "rotate(-45deg)",
      transformOrigin: "0 100%",
    });
  });

  it("renders a group row as one full-width header cell over every column", () => {
    const { container } = render(
      <MatrixTable
        columns={columns}
        rows={[
          { type: "group", key: "product", label: "Annuity" },
          { type: "group", key: "plan", label: "Annuity Plan", depth: 1, className: "bg-amber-50" },
          { key: "add-rider", label: "AddRider", cells: ["A", "B"], depth: 2 },
        ]}
        corner="Entity"
      />,
    );

    const bodyRows = [...container.querySelectorAll("tbody tr")];
    expect(bodyRows.map((row) => [row.getAttribute("data-matrix-group"), row.children.length])).toEqual([
      ["product", 1],
      ["plan", 1],
      [null, 1 + columns.length],
    ]);
    const product = screen.getByRole("columnheader", { name: "Annuity" });
    expect(product).toHaveAttribute("colspan", String(columns.length + 1));
    expect(product).toHaveAttribute("scope", "colgroup");
    expect(product).toHaveClass("font-semibold");
    expect(screen.getByRole("columnheader", { name: "Annuity Plan" })).toHaveClass("bg-amber-50");
    expect(screen.getByText("Annuity Plan")).toHaveStyle({ paddingLeft: "0.75rem" });
    expect(screen.getByText("AddRider")).toHaveStyle({ paddingLeft: "1.5rem" });
  });

  it("applies a column's header and cell class and style to that column only", () => {
    const { container } = render(
      <MatrixTable
        columns={[
          "plain",
          {
            header: <span>qa · tenant-x</span>,
            title: "qa-tenant-x",
            headerClassName: "accent-bar",
            headerStyle: { boxShadow: "inset 0 3px 0 rgb(14, 165, 233)" },
            cellClassName: "tinted",
            cellStyle: { backgroundColor: "rgb(240, 249, 255)" },
          },
        ]}
        rows={[
          { key: "one", label: "One", cells: ["a", "b"] },
          { key: "two", label: "Two", cells: ["c", "d"] },
        ]}
      />,
    );

    const header = screen.getByRole("columnheader", { name: "qa · tenant-x" });
    expect(header).toHaveClass("accent-bar", "sticky");
    expect(header).toHaveAttribute("title", "qa-tenant-x");
    expect(header).toHaveStyle({ boxShadow: "inset 0 3px 0 rgb(14, 165, 233)" });
    expect(screen.getByRole("columnheader", { name: "plain" })).not.toHaveClass("accent-bar");

    const tinted = [...container.querySelectorAll("tbody td")].map((td) => [
      td.textContent,
      td.classList.contains("tinted"),
      (td as HTMLElement).style.backgroundColor,
    ]);
    expect(tinted).toEqual([
      ["a", false, ""],
      ["b", true, "rgb(240, 249, 255)"],
      ["c", false, ""],
      ["d", true, "rgb(240, 249, 255)"],
    ]);
  });

  it("keeps a column's cell style alongside the angled-header width", () => {
    const { container } = render(
      <MatrixTable
        angledHeaders
        columnWidth={40}
        columns={[{ header: "read", cellStyle: { backgroundColor: "rgb(1, 2, 3)" } }]}
        rows={rows.map((row) => ({ ...row, cells: [row.cells[0]] }))}
      />,
    );
    expect(container.querySelector("tbody td")).toHaveStyle({
      width: "40px",
      backgroundColor: "rgb(1, 2, 3)",
    });
  });

  it("keeps non-angled column headers individually sticky", () => {
    const { container } = render(
      <MatrixTable columns={columns} rows={rows} corner="Scope" headerClassName="bg-background" />,
    );

    expect(container.querySelector("thead")).not.toHaveClass("sticky");
    expect(screen.getByRole("columnheader", { name: "environment-read" })).toHaveClass(
      "sticky",
      "top-0",
      "z-20",
      "bg-background",
    );
  });
});
