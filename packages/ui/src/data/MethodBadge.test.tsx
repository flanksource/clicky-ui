import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MethodBadge } from "./MethodBadge";

describe("MethodBadge", () => {
  it.each([
    ["get", "GET"],
    ["post", "POST"],
    ["put", "PUT"],
    ["patch", "PATCH"],
    ["delete", "DELETE"],
  ])("renders %s as uppercase", (input, expected) => {
    render(<MethodBadge method={input} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("applies the info tone for GET", () => {
    render(<MethodBadge method="get" />);
    expect(screen.getByText("GET").parentElement?.className).toMatch(/border-blue-500/);
  });

  it("applies the danger tone for DELETE", () => {
    render(<MethodBadge method="DELETE" />);
    expect(screen.getByText("DELETE").parentElement?.className).toMatch(/border-red-500/);
  });

  it("falls back to neutral tone for unknown methods", () => {
    render(<MethodBadge method="OPTIONS" />);
    expect(screen.getByText("OPTIONS").parentElement?.className).toMatch(/border-border/);
  });
});
