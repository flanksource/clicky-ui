import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SpecRuntimeBar } from "./SpecRuntimeBar";
import type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";

const VALUE: AISpecRuntimeValue = {
  mode: "agent",
  effort: "high",
  budget: { timeout: "2h", cost: 5 },
  permissions: { mode: "auto", tools: { Read: "allow" } },
  workflow: { commits: [] },
};

describe("SpecRuntimeBar", () => {
  it("uses the standard catalog while an empty host catalog loads", () => {
    render(<SpecRuntimeBar value={{}} onChange={vi.fn()} families={[]} />);
    expect(screen.getByRole("group", { name: "Runtime" })).toBeInTheDocument();
  });
  it("exposes all common settings through the runtime menu", async () => {
    render(<SpecRuntimeBar value={VALUE} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Runtime options" }));
    await screen.findByRole("menuitem", { name: "Permission mode" });
    for (const name of [
      "Permission mode",
      "Source",
      "Commit",
      "Timeout",
      "Budget",
    ]) {
      expect(screen.getByRole("menuitem", { name })).toBeInTheDocument();
    }
  });

  it("disables all controls for read-only layers", () => {
    render(<SpecRuntimeBar value={VALUE} onChange={vi.fn()} readOnly />);
    expect(
      screen.getByRole("button", { name: "Runtime options" }),
    ).toBeDisabled();
  });

  it("shows inherited commit policy without writing it into the draft", () => {
    const onChange = vi.fn();
    render(
      <SpecRuntimeBar
        value={{ mode: "agent" }}
        onChange={onChange}
        inheritedCommits={[{ on: "turn" }]}
      />,
    );
    expect(
      screen.getByTitle("Commit — Every turn (inherited)"),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps task-owned worktree paths out of preset authoring", async () => {
    render(
      <SpecRuntimeBar
        value={{
          mode: "agent",
          setup: { checkout: { worktree: { mode: "new" } } },
        }}
        onChange={vi.fn()}
        variant="preset"
      />,
    );
    fireEvent.click(screen.getByTitle("Source — New worktree"));
    await screen.findByRole("menuitem", { name: "New worktree" });
    expect(screen.queryByLabelText("Worktree path")).not.toBeInTheDocument();
  });
});
