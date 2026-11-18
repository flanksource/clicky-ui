import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { METRICS } from "../fixtures/classes";
import { GcSummary } from "./GcSummary";

describe("GcSummary", () => {
  it("shows each collector's count and accumulated time", () => {
    render(<GcSummary collectors={METRICS.garbageCollectors} />);
    expect(screen.getByText("G1 Young Generation")).toBeInTheDocument();
    expect(screen.getByText("1842 · 21.3 s")).toBeInTheDocument();
    expect(screen.getByText("2 · 3.5 s")).toBeInTheDocument();
  });

  it("says when no collectors are reported", () => {
    render(<GcSummary collectors={[]} />);
    expect(screen.getByText("No garbage collectors reported.")).toBeInTheDocument();
  });
});
