import { render, screen } from "@testing-library/react";
import { MatrixTable } from "./MatrixTable";

const columns = ["read", "environment-read"];
const rows = [{ key: "global", label: "Global", cells: ["yes", "no"] }];

describe("MatrixTable", () => {
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
