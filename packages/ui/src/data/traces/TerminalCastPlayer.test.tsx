import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { terminalEvents } from "./fixtures";
import { TerminalCastPlayer } from "./TerminalCastPlayer";

const CAST = [
  '{"version":2,"width":80,"height":24,"duration":1.5,"command":"/bin/sh -c echo hi","_gavel":{"exit_code":3,"snapshots":[[1500,"hi\\nbye"]],"truncated":true}}',
  '[0.01,"o","hi\\r\\n"]',
  '[1.2,"o","bye\\r\\n"]',
].join("\n");

const screenText = () => screen.getByRole("region", { name: "Terminal screen" }).textContent ?? "";
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("TerminalCastPlayer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts paused at the beginning with nothing on the screen", () => {
    render(<TerminalCastPlayer events={terminalEvents} />);
    expect(screenText().trim()).toBe("");
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("replays output over time when played", () => {
    render(<TerminalCastPlayer events={terminalEvents} />);
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    advance(1000);
    expect(screenText()).toContain("compiling 1/3");
    expect(screenText()).not.toContain("compiling 2/3");
    advance(500);
    expect(screenText()).toContain("compiling 2/3");
  });

  it("pauses where it is", () => {
    render(<TerminalCastPlayer events={terminalEvents} />);
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    advance(700);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    const paused = screenText();
    advance(3000);
    expect(screenText()).toBe(paused);
    expect(paused).toContain("compiling 1/3");
  });

  it.each([
    ["2x", 750, "compiling 2/3"],
    ["4x", 450, "compiling 3/3"],
  ])("plays at %s", (speed, elapsedMs, expected) => {
    render(<TerminalCastPlayer events={terminalEvents} />);
    fireEvent.click(screen.getByRole("radio", { name: speed }));
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    advance(elapsedMs);
    expect(screenText()).toContain(expected);
  });

  it("scrubs to a position with the slider", () => {
    render(<TerminalCastPlayer events={terminalEvents} />);
    fireEvent.change(screen.getByRole("slider", { name: "Seek" }), { target: { value: "1.2" } });
    expect(screenText()).toContain("compiling 2/3");
    fireEvent.change(screen.getByRole("slider", { name: "Seek" }), { target: { value: "0.2" } });
    expect(screenText()).toContain("$ make build");
    expect(screenText()).not.toContain("compiling");
  });

  it("jumps to the end, resized, and stops", () => {
    render(<TerminalCastPlayer events={terminalEvents} />);
    fireEvent.click(screen.getByRole("button", { name: "Jump to end" }));
    expect(screenText()).toContain("warning: 1 unused import");
    expect(screenText()).toContain("done");
    expect(screen.getByRole("region", { name: "Terminal screen" })).toHaveAttribute("data-cols", "60");
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("restarts from the beginning when played at the end", () => {
    render(<TerminalCastPlayer events={terminalEvents} />);
    fireEvent.click(screen.getByRole("button", { name: "Jump to end" }));
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    advance(200);
    expect(screenText()).toContain("$ make build");
    expect(screenText()).not.toContain("done");
  });

  it("stops playing by itself at the end of the session", () => {
    render(<TerminalCastPlayer events={terminalEvents} />);
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    advance(4000);
    expect(screenText()).toContain("done");
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("shows the exit code", () => {
    render(<TerminalCastPlayer events={terminalEvents} />);
    expect(screen.getByText("exit 0")).toBeInTheDocument();
    expect(screen.getByText("make build")).toBeInTheDocument();
  });

  it("offers the settled screen when a snapshot was recorded", () => {
    render(<TerminalCastPlayer events={terminalEvents} />);
    fireEvent.click(screen.getByRole("radio", { name: "Settled screen" }));
    expect(screenText()).toBe("$ make build\ncompiling 3/3\nwarning: 1 unused import\ndone");
  });

  it("has no settled-screen view without a snapshot", () => {
    render(<TerminalCastPlayer events={terminalEvents.filter((e) => e.kind !== "snapshot")} />);
    expect(screen.queryByRole("radio", { name: "Settled screen" })).not.toBeInTheDocument();
  });

  it("renders a downloaded asciinema cast the same way, with its exit code and truncation", () => {
    render(<TerminalCastPlayer castText={CAST} />);
    expect(screen.getByText("exit 3")).toBeInTheDocument();
    expect(screen.getByText("output truncated")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Jump to end" }));
    expect(screenText()).toContain("bye");
  });

  it("says so when the session recorded nothing", () => {
    render(<TerminalCastPlayer events={[]} />);
    expect(screen.getByText("No terminal output recorded")).toBeInTheDocument();
  });

  it("throws when given both or neither of events and castText", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TerminalCastPlayer />)).toThrow(/either events or castText/);
    expect(() => render(<TerminalCastPlayer events={[]} castText={CAST} />)).toThrow(/either events or castText/);
  });
});
