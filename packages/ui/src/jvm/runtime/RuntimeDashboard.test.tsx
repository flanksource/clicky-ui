import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { METRICS } from "../fixtures/classes";
import { RuntimeDashboard } from "./RuntimeDashboard";

describe("RuntimeDashboard", () => {
  it("stamps the snapshot with its capture time", () => {
    const { container } = render(<RuntimeDashboard metrics={METRICS} />);
    expect(screen.getByText(/Snapshot captured at/)).toBeInTheDocument();
    expect(container.querySelector("time")).toHaveAttribute("datetime", "2026-11-15T08:00:00.000Z");
  });

  it("shows the process tiles, runtime, collectors, memory pools and pool tables", () => {
    render(<RuntimeDashboard metrics={METRICS} />);
    expect(screen.getByText("Process CPU")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Runtime" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Garbage collectors" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Memory pools" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Server connectors" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Data sources" })).toBeInTheDocument();
  });

  it("leaves out connector and data source sections when the JVM has none", () => {
    render(<RuntimeDashboard metrics={{ ...METRICS, connectors: [], dataSources: [] }} />);
    expect(screen.queryByRole("heading", { name: "Server connectors" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Data sources" })).toBeNull();
  });

  it("refreshes on request", () => {
    const onRefresh = vi.fn();
    render(<RuntimeDashboard metrics={METRICS} onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("throws on a malformed capture time rather than rendering Invalid Date", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<RuntimeDashboard metrics={{ ...METRICS, capturedAt: "soon" }} />)).toThrow(/capturedAt/);
    quiet.mockRestore();
  });
});
