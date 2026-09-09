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

  // Metadata is whatever JSON reached the client over the task API or the SSE
  // stream. A key that means "destination" is not a promise that the value is
  // one: linked as-is, these navigate nowhere and run something instead.
  it("refuses to link a value that would run rather than navigate", () => {
    render(
      <TaskMetadata
        metadata={{
          url: "javascript:alert(document.cookie)",
          href: "data:text/html,<script>alert(1)</script>",
          // A browser strips the tab before reading the scheme; so does this.
          link: "java\tscript:alert(1)",
          // Protocol-relative — an off-site URL wearing a path's clothes.
          logs: "//evil.example/steal",
        }}
      />,
    );

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("javascript:alert(document.cookie)")).toBeInTheDocument();
  });

  it("still links the destinations that are only destinations", () => {
    render(<TaskMetadata metadata={{ url: "https://example.com/runs/7", href: "/todos/5d9f1d2a" }} />);

    expect(screen.getByRole("link", { name: "https://example.com/runs/7" })).toHaveAttribute(
      "href",
      "https://example.com/runs/7",
    );
    expect(screen.getByRole("link", { name: "/todos/5d9f1d2a" })).toBeInTheDocument();
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
