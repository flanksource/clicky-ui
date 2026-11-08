import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Expectation } from "./Expectation";

const trace = [
  "cel: a == b && c > d",
  "     │    │    │   │",
  "     │    │    │   └─ int(4)",
  "     │    │    └─ int(3)",
  "     │    └─ int(1)",
  "     └─ int(1)",
].join("\n");

describe("Expectation", () => {
  it("keeps native backtrace values aligned beneath their operands in a scrollable expression", () => {
    const { container } = render(<Expectation checkLabel="expression" check={trace} expected={true} actual={false} />);
    const expression = container.querySelector("dd code");
    expect(expression?.textContent).toBe(trace);
    expect(expression).toHaveClass("whitespace-pre", "overflow-x-auto", "block");
    expect(expression).not.toHaveClass("whitespace-pre-wrap", "break-words");
    expect(screen.getByText("true")).toBeInTheDocument();
    expect(screen.getByText("false")).toBeInTheDocument();
  });

  it("retains wrapping and structured inspection for variable values", () => {
    render(<Expectation check="message == expected" vars={{ message: "a long diagnostic", summary: { errors: 1 } }} />);
    expect(screen.getByText("message == expected")).toHaveClass("whitespace-pre-wrap", "break-words");
    expect(screen.getByText("a long diagnostic")).toHaveClass("whitespace-pre-wrap", "break-words");
    expect(screen.getByText("errors")).toBeInTheDocument();
  });
});
