import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { METRICS } from "../fixtures/classes";
import { ProcessTiles } from "./ProcessTiles";

const tile = (label: string) => document.querySelector<HTMLElement>(`[data-metric="${label}"]`)!;

describe("ProcessTiles", () => {
  it("shows process CPU with a tone and bar", () => {
    render(<ProcessTiles metrics={METRICS} />);
    expect(tile("Process CPU")).toHaveTextContent("37.5%");
    expect(tile("Process CPU").querySelector<HTMLElement>("[data-metric-bar]")).toHaveStyle({ width: "37.5%" });
    expect(tile("Process CPU").querySelector(".bg-green-500")).not.toBeNull();
  });

  it("colours CPU red from 90%", () => {
    render(<ProcessTiles metrics={{ ...METRICS, processCpuPercent: 95 }} />);
    expect(tile("Process CPU").querySelector(".bg-red-500")).not.toBeNull();
  });

  it("does not invent a CPU reading when the JVM cannot measure it", () => {
    render(<ProcessTiles metrics={{ ...METRICS, processCpuPercent: null }} />);
    expect(tile("Process CPU")).toHaveTextContent("Unavailable");
    expect(tile("Process CPU").querySelector("[data-metric-bar]")).toBeNull();
  });

  it("compares the load average with the processor count", () => {
    render(<ProcessTiles metrics={METRICS} />);
    expect(tile("Load average")).toHaveTextContent("2.40 / 8 cores");
  });

  it("totals heap use against the pools' limits", () => {
    render(<ProcessTiles metrics={METRICS} />);
    expect(screen.getByText("805 MB / 1.3 GB")).toBeInTheDocument();
  });
});
