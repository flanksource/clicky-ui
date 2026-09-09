import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TaskMetadata } from "./TaskProcessMetadata";

describe("TaskMetadata", () => {
  it("renders a flat object as labelled values", () => {
    render(<TaskMetadata metadata={{ state: "running", session: "df7aa36e" }} />);

    expect(screen.getByText("state")).toBeInTheDocument();
    expect(screen.getByText("running")).toBeInTheDocument();
    expect(screen.getByText("df7aa36e")).toBeInTheDocument();
  });

  it("links a value that points somewhere", () => {
    render(<TaskMetadata metadata={{ logPath: "/var/log/agent.log", state: "idle" }} />);

    expect(screen.getByRole("link", { name: "/var/log/agent.log" })).toHaveAttribute(
      "href",
      "/var/log/agent.log",
    );
    // A plain label is not turned into a link just because it sits beside one.
    expect(screen.queryByRole("link", { name: "idle" })).toBeNull();
  });

  // The reason metadata is JSON rather than a string map: a nested value has to
  // keep its structure instead of being flattened into something that only looks
  // like a label.
  it("keeps a structured value's structure instead of flattening it", () => {
    render(
      <TaskMetadata
        metadata={{ state: "running", turn: { planMode: true, pending: 2 } }}
      />,
    );

    expect(screen.getByText(/planMode/)).toBeInTheDocument();
    expect(screen.queryByText("[object Object]")).toBeNull();
  });

  it("renders nothing for absent or empty metadata", () => {
    const { container: absent } = render(<TaskMetadata />);
    expect(absent).toBeEmptyDOMElement();

    const { container: empty } = render(<TaskMetadata metadata={{}} />);
    expect(empty).toBeEmptyDOMElement();

    // A producer reporting a field it has no value for yet is saying nothing.
    const { container: blank } = render(<TaskMetadata metadata={{ session: "" }} />);
    expect(blank).toBeEmptyDOMElement();
  });
});
