import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createTestRunnerRegistry } from "./adapter";
import { TestRunnerProvider } from "./context";
import { emptyTestFilters } from "./filterState";
import { TestDetailPanel } from "./TestDetailPanel";
import type { Test } from "./types";

const stdout = "connecting\nconnected\nloading\nloaded\nvalidating\nvalidated\nsaving\nsaved";
const stderr = "warning: slow response\nretrying\nretry exhausted";
const combined = `${stdout}\n${stderr}`;
const preview = `${stdout}\nwarning: slow response\nretrying`;
const node: Test = { name: "sync records", failed: true, stdout, stderr };

function Panel({ test = node, controlled = false }: { test?: Test; controlled?: boolean }) {
  const [activeTab, onTabChange] = useState("detail");
  return (
    <TestRunnerProvider value={{
      tests: [test], selected: test, done: true, filters: emptyTestFilters(),
      expandAll: null, busy: {}, adapters: createTestRunnerRegistry(),
      onSelect: () => {}, onFiltersChange: () => {}, onExpandAllChange: () => {},
      ...(controlled ? { activeTab, onTabChange } : {}),
    }}>
      <TestDetailPanel />
    </TestRunnerProvider>
  );
}

describe("test output", () => {
  it("combines both streams into one ten-line detail preview", () => {
    const { container } = render(<Panel />);
    expect([...container.querySelectorAll("pre")].map((el) => el.textContent)).toEqual([preview]);
    expect(screen.queryByText("stderr")).not.toBeInTheDocument();
  });

  it.each([false, true])("Show more opens the complete Stdout tab (controlled: %s)", (controlled) => {
    const { container } = render(<Panel controlled={controlled} />);
    fireEvent.click(screen.getByRole("button", { name: "Show more in Stdout" }));
    expect(screen.getByRole("tab", { name: "Stdout" })).toHaveAttribute("aria-selected", "true");
    expect([...container.querySelectorAll("pre")].map((el) => el.textContent)).toEqual([combined]);
    expect(screen.queryByRole("button", { name: /Show more/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Detail" }));
    expect(container.querySelector("pre")?.textContent).toBe(preview);
  });

  it.each([
    { name: "stdout only", streams: { stdout }, expected: stdout },
    { name: "stderr only", streams: { stderr }, expected: stderr },
    { name: "exactly ten lines", streams: { stdout: `${stdout}\n`, stderr: "warning\nretrying\n" }, expected: `${stdout}\nwarning\nretrying` },
  ])("shows $name without a Show more link", ({ streams, expected }) => {
    const { container } = render(<Panel test={{ name: "short output", ...streams }} />);
    expect([...container.querySelectorAll("pre")].map((el) => el.textContent)).toEqual([expected]);
    expect(screen.queryByRole("button", { name: /Show more/ })).not.toBeInTheDocument();
  });

  it("omits the output tab and preview when both streams are empty", () => {
    const { container } = render(<Panel test={{ name: "no output", stdout: "", stderr: "" }} />);
    expect(screen.queryByRole("tab", { name: "Stdout" })).not.toBeInTheDocument();
    expect(container.querySelector("pre")).toBeNull();
  });

  it("switches full output with the selected attempt", () => {
    const { container } = render(<Panel test={{ ...node, attempts: [
      { sequence: 1, failed: true, stdout: "first output", stderr: "first error" },
      { sequence: 2, failed: true, stdout, stderr },
    ] }} />);
    fireEvent.click(screen.getByRole("button", { name: "Show more in Stdout" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Attempt" }), { target: { value: "1" } });
    expect(container.querySelector("pre")?.textContent).toBe("first output\nfirst error");
  });
});
