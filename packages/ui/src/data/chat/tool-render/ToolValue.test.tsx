import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolValue } from "./ToolValue";

const PAGED = {
  data: [
    { id: "pod-1", name: "api-7c9", restarts: 0 },
    { id: "pod-2", name: "worker-1f2", restarts: 3 },
  ],
  page: { limit: 20, offset: 0, total: 37 },
};

describe("ToolValue", () => {
  it("renders a paged envelope as a table with derived headers and a count footer", () => {
    render(<ToolValue value={PAGED} />);
    expect(screen.getByText("id")).toBeInTheDocument();
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("api-7c9")).toBeInTheDocument();
    expect(screen.getByText("Showing 2 of 37")).toBeInTheDocument();
  });

  it("caps rows at maxRows and reports the full count", () => {
    const rows = Array.from({ length: 6 }, (_, i) => ({ id: `r${i}` }));
    render(<ToolValue value={rows} maxRows={2} />);
    expect(screen.getByText("r0")).toBeInTheDocument();
    expect(screen.queryByText("r5")).toBeNull();
    expect(screen.getByText("Showing 2 of 6")).toBeInTheDocument();
  });

  it("renders an all-numeric object as count tiles keyed by the raw field name", () => {
    render(<ToolValue value={{ created: 3, skipped: 1 }} />);
    expect(screen.getByText("created")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("skipped")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders a single record as a heading, an id chip and its remaining fields", () => {
    render(<ToolValue value={{ id: "pod-1", name: "api-7c9", status: "RUNNING" }} />);
    expect(screen.getByText("api-7c9")).toBeInTheDocument();
    expect(screen.getByText("pod-1")).toBeInTheDocument();
    expect(screen.getByText("status")).toBeInTheDocument();
    expect(screen.getByText("RUNNING")).toBeInTheDocument();
  });

  it("deep-links a record heading only when the host resolves an href", () => {
    const { rerender } = render(
      <ToolValue
        value={{ id: "pod-1", name: "api-7c9" }}
        entity="pods"
        resolveEntityHref={(entity, id) => `/${entity}/${id}`}
      />,
    );
    expect(screen.getByRole("link", { name: "api-7c9" })).toHaveAttribute("href", "/pods/pod-1");

    // No entity on the tool means clicky-ui has no idea where the record lives.
    rerender(
      <ToolValue
        value={{ id: "pod-1", name: "api-7c9" }}
        resolveEntityHref={(entity, id) => `/${entity}/${id}`}
      />,
    );
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders a scalar as a sentence and an empty value as the empty message", () => {
    const { rerender } = render(<ToolValue value="Restarted 4 pods" />);
    expect(screen.getByText("Restarted 4 pods")).toBeInTheDocument();

    rerender(<ToolValue value={[]} />);
    expect(screen.getByText("No result")).toBeInTheDocument();
  });

  it("marks an error payload as destructive", () => {
    const { container } = render(
      <ToolValue value={{ code: 400, detail: "unknown namespace" }} isError />,
    );
    expect(container.querySelector(".text-destructive")).not.toBeNull();
  });
});
