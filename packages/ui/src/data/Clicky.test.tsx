import { fireEvent, render, screen, within } from "@testing-library/react";
import { Clicky, type ClickyDocument } from "./Clicky";
import { clickyFixture } from "./Clicky.fixtures";

describe("Clicky", () => {
  it("renders a JSON string payload", () => {
    render(<Clicky data={JSON.stringify(clickyFixture)} />);

    expect(screen.getByText("Cluster Status")).toBeInTheDocument();
    expect(screen.getByText(/Healthy/)).toBeInTheDocument();
  });

  it("sorts tables and expands row detail", () => {
    render(<Clicky data={clickyFixture} />);

    const latencyHeader = screen.getByRole("button", { name: /latency/i });
    fireEvent.click(latencyHeader);
    fireEvent.click(latencyHeader);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("worker");
    expect(rows[2]).toHaveTextContent("api");

    fireEvent.click(rows[2]);

    expect(screen.getByText("platform")).toBeInTheDocument();
    expect(
      screen.getAllByText((_, element) => element?.textContent?.includes("apiVersion: v1") ?? false)[0],
    ).toBeInTheDocument();
  });

  it("renders tree nodes through the native tree component", () => {
    render(<Clicky data={clickyFixture} />);

    const tree = screen.getByRole("tree");
    expect(tree).toBeInTheDocument();
    expect(
      within(tree).getAllByText((_, element) => element?.textContent === "cluster / prod-eu")[0],
    ).toBeInTheDocument();
    expect(within(tree).getByText("worker")).toBeInTheDocument();
  });

  it("sanitizes html fallback content", () => {
    const malicious: ClickyDocument = {
      version: 1,
      node: {
        kind: "html",
        html: '<span>Hello</span><script>window.__x = true</script><a href="javascript:alert(1)" onclick="alert(2)">bad</a>',
      },
    };

    const { container } = render(<Clicky data={malicious} />);
    expect(container.querySelector("script")).toBeNull();
    expect(container.innerHTML).not.toContain("onclick=");
    expect(container.innerHTML).not.toContain("javascript:");
  });

  it("shows a compact error for invalid JSON", () => {
    render(<Clicky data={"{"} />);

    expect(screen.getByText("Invalid Clicky payload")).toBeInTheDocument();
  });
});
