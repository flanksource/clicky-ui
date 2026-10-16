import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { goProfileRecords } from "./fixtures";
import { GoProfileView } from "./GoProfileView";

const functionNames = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => row.getAttribute("data-profile-function"))
    .filter(Boolean);

const row = (func: string) => within(document.querySelector(`[data-profile-function="${func}"]`) as HTMLElement);

describe("GoProfileView", () => {
  it("opens on the latest checkpoint and its last sample type, with the total", () => {
    render(<GoProfileView records={goProfileRecords} />);
    expect(screen.getByRole("combobox", { name: "Profile checkpoint" })).toHaveValue("prof-cpu");
    expect(screen.getByRole("combobox", { name: "Sample type" })).toHaveValue("cpu");
    // 1.2 s + 0.6 s + 0.3 s + 0.2 s across 7 distinct functions.
    expect(screen.getByText("Total 2.3 s across 7 functions")).toBeInTheDocument();
  });

  it("ranks functions by flat value, with flat and cumulative shares of the total", () => {
    render(<GoProfileView records={goProfileRecords} />);
    expect(functionNames().slice(0, 3)).toEqual([
      "app/runner.hashChunk",
      "compress/flate.(*compressor).deflate",
      "runtime.mallocgc",
    ]);
    // hashChunk is the leaf of 1.2 s + 0.3 s of 2.3 s, and sits in no other stack.
    const hash = row("app/runner.hashChunk");
    expect(hash.getAllByText("1.5 s")).toHaveLength(2);
    expect(hash.getAllByText("65.2%")).toHaveLength(2);
  });

  it("ranks by cumulative value once Cum is chosen: the entry point holds everything", () => {
    render(<GoProfileView records={goProfileRecords} />);
    fireEvent.click(screen.getByRole("button", { name: "Cum" }));
    expect(functionNames()[0]).toBe("main.main");
    expect(row("main.main").getByText("100.0%")).toBeInTheDocument();
  });

  it("switches sample type and re-aggregates", () => {
    render(<GoProfileView records={goProfileRecords} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Sample type" }), { target: { value: "samples" } });
    // 120 + 60 + 30 + 20 samples.
    expect(screen.getByText("Total 230 across 7 functions")).toBeInTheDocument();
  });

  it("shows another checkpoint's profile once it is picked, in that profile's units", () => {
    render(<GoProfileView records={goProfileRecords} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Profile checkpoint" }), { target: { value: "prof-heap" } });
    expect(screen.getByRole("combobox", { name: "Sample type" })).toHaveValue("inuse_space");
    expect(screen.getByText("Total 120 MB across 5 functions")).toBeInTheDocument();
    expect(functionNames()[0]).toBe("bytes.growSlice");
    expect(row("bytes.growSlice").getAllByText("96 MB")).toHaveLength(2);
  });

  it("drills into the heaviest stacks through a function and hides them again", () => {
    render(<GoProfileView records={goProfileRecords} />);
    fireEvent.click(within(document.querySelector('[data-profile-function="app/runner.hashChunk"]') as HTMLElement).getByRole("button"));
    const stacks = within(document.querySelector('[data-profile-stacks="app/runner.hashChunk"]') as HTMLElement);
    // Two distinct stacks reach hashChunk: via process (1.2 s) and via verify (300 ms).
    expect(stacks.getByText(/^1\.2 s/)).toBeInTheDocument();
    expect(stacks.getByText(/^300 ms/)).toBeInTheDocument();
    expect(stacks.getByText("app/runner.(*Runner).verify")).toBeInTheDocument();
    fireEvent.click(within(document.querySelector('[data-profile-function="app/runner.hashChunk"]') as HTMLElement).getByRole("button"));
    expect(document.querySelector('[data-profile-stacks="app/runner.hashChunk"]')).toBeNull();
  });

  it("shows the top N and reveals the rest on request", () => {
    render(<GoProfileView records={goProfileRecords} topN={2} />);
    expect(functionNames()).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Show all 7 functions" }));
    expect(functionNames()).toHaveLength(7);
  });

  it("says so when there are no records", () => {
    render(<GoProfileView records={[]} />);
    expect(screen.getByText("No profile collected yet")).toBeInTheDocument();
  });

  it("shows one process of several when told which, and refuses to guess otherwise", () => {
    const other = goProfileRecords.map((record) => ({ ...record, key: "101:100", pid: 101, checkpointId: `other-${record.checkpointId}` }));
    const both = [...goProfileRecords, ...other];
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<GoProfileView records={both} />)).toThrow(/records of 2 processes/);
    render(<GoProfileView records={both} processKey="101:100" />);
    expect(screen.getByRole("combobox", { name: "Profile checkpoint" })).toHaveValue("other-prof-cpu");
  });
});
