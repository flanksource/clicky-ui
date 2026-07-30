import { render, screen } from "@testing-library/react";
import { EntityCell } from "./EntityCell";

describe("EntityCell", () => {
  it("renders the title and subtitle as separate lines", () => {
    render(
      <EntityCell
        title="Push 12 close journals to Xero"
        subtitle="Upstream write · 4f0ab21d"
      />,
    );

    expect(
      screen.getByText("Push 12 close journals to Xero"),
    ).toBeInTheDocument();
    expect(screen.getByText("Upstream write · 4f0ab21d")).toBeInTheDocument();
  });

  it("links the title when href is set", () => {
    render(<EntityCell title="INV-2039" href="/approvals/inv-2039" />);

    expect(screen.getByRole("link", { name: "INV-2039" })).toHaveAttribute(
      "href",
      "/approvals/inv-2039",
    );
  });

  it("renders a plain title when there is no href or handler", () => {
    render(<EntityCell title="INV-2039" />);

    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders trailing content", () => {
    render(<EntityCell title="INV-2039" trailing={<span>copy</span>} />);

    expect(screen.getByText("copy")).toBeInTheDocument();
  });
});
