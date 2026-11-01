import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProblemRow } from "./ProblemRow";
import { diagnosticKeys } from "./diagnostic-identity";
import { useProblemExpansion } from "./use-problem-expansion";

describe("problem rows", () => {
  it("prunes expansion for removed findings before they reappear", () => {
    const { result, rerender } = renderHook(({ keys }) => useProblemExpansion(keys), { initialProps: { keys: ["first", "second"] } });
    act(() => result.current[1](["second"]));
    rerender({ keys: ["first"] });
    rerender({ keys: ["first", "second"] });
    expect(result.current[0]).toEqual([]);
  });
  it("expands without navigating and exposes navigation in its menu", () => {
    const open = vi.fn();
    render(
      <ProblemRow
        message="Check this expression"
        severity="warning"
        location="12:4"
        metadata="lint rule"
        actions={[{ label: "Jump to Source", onSelect: open }]}
      >
        <p>Full source context</p>
      </ProblemRow>,
    );
    expect(screen.queryByText("Full source context")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: /Check this expression/ }),
    );
    expect(screen.getByText("Full source context")).toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Problem actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Jump to Source" }));
    expect(open).toHaveBeenCalledOnce();
    expect(screen.getByText("Full source context")).toBeInTheDocument();
  });

  it("keeps identities independent of ordering and separates duplicate occurrences", () => {
    const a = ["root-a", "file.go", "lint", "rule", 1, "message"];
    const b = ["root-b", "file.go", "lint", "rule", 1, "message"];
    const keys = diagnosticKeys([a, b, a]);
    expect(new Set(keys).size).toBe(3);
    expect(diagnosticKeys([b, a])).toEqual([keys[1], keys[0]]);
  });
});
