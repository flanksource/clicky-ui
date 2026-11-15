import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RegisterSummary } from "./RegisterSummary";

describe("RegisterSummary", () => {
  it("pluralises and flags unleased and stale rows", () => {
    render(<RegisterSummary summary={{ patched: 3, stale: 2, unleased: 1 }} />);
    expect(screen.getByText("3 classes patched")).toBeInTheDocument();
    expect(screen.getByText("1 without a lease")).toBeInTheDocument();
    expect(screen.getByText("2 stale")).toBeInTheDocument();
  });

  it("is singular for one class and shows no badges when nothing needs attention", () => {
    render(<RegisterSummary summary={{ patched: 1, stale: 0, unleased: 0 }} />);
    expect(screen.getByText("1 class patched")).toBeInTheDocument();
    expect(screen.queryByText(/without a lease/)).toBeNull();
    expect(screen.queryByText(/stale/)).toBeNull();
  });
});
