import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommitSection } from "./CommitSection";

function commitPhaseSelect() {
  return screen.getByRole("combobox", { name: "Commit" });
}

function chooseCommitPhase(name: string) {
  fireEvent.focus(commitPhaseSelect());
  fireEvent.mouseDown(screen.getByRole("option", { name }));
}

describe("CommitSection", () => {
  it("shows Never with no inherited hint when nothing is set anywhere", () => {
    render(<CommitSection value={{}} onChange={vi.fn()} />);
    expect(commitPhaseSelect()).toHaveValue("Never");
    expect(screen.queryByText(/inherited/)).not.toBeInTheDocument();
  });

  it("shows the inherited phase as the current selection, marked inherited", () => {
    render(
      <CommitSection
        value={{}}
        onChange={vi.fn()}
        inheritedCommits={[{ on: "run", stage: "worktree", gates: "full" }]}
      />,
    );
    expect(commitPhaseSelect()).toHaveValue("End of run");
    expect(screen.getByText(/inherited/)).toBeInTheDocument();
  });

  it("maps every inherited phase onto the same select labels used for an explicit choice", () => {
    render(
      <CommitSection
        value={{}}
        onChange={vi.fn()}
        inheritedCommits={[{ on: "turn" }]}
      />,
    );
    expect(commitPhaseSelect()).toHaveValue("Every turn");
    expect(screen.getByText(/inherited/)).toBeInTheDocument();
  });

  it("ignores an empty inherited list and falls back to Never", () => {
    render(
      <CommitSection value={{}} onChange={vi.fn()} inheritedCommits={[]} />,
    );
    expect(commitPhaseSelect()).toHaveValue("Never");
    expect(screen.queryByText(/inherited/)).not.toBeInTheDocument();
  });

  it("stops showing the inherited state once the operator sets commits explicitly", () => {
    render(
      <CommitSection
        value={{ workflow: { commits: [{ on: "turn" }] } }}
        onChange={vi.fn()}
        inheritedCommits={[{ on: "run", stage: "worktree", gates: "full" }]}
      />,
    );
    expect(commitPhaseSelect()).toHaveValue("Every turn");
    expect(screen.queryByText(/inherited/)).not.toBeInTheDocument();
  });

  it("treats an explicit empty commits list as the operator's own Never, not inherited", () => {
    render(
      <CommitSection
        value={{ workflow: { commits: [] } }}
        onChange={vi.fn()}
        inheritedCommits={[{ on: "run", stage: "worktree", gates: "full" }]}
      />,
    );
    expect(commitPhaseSelect()).toHaveValue("Never");
    expect(screen.queryByText(/inherited/)).not.toBeInTheDocument();
  });

  it("emits a delta-only value when the operator selects the inherited phase explicitly", () => {
    const onChange = vi.fn();
    render(
      <CommitSection
        value={{}}
        onChange={onChange}
        inheritedCommits={[{ on: "run", stage: "worktree", gates: "full" }]}
      />,
    );
    chooseCommitPhase("End of run");
    // The inherited stage/gates never get copied into the emitted value.
    expect(onChange).toHaveBeenCalledWith({
      workflow: { commits: [{ on: "run" }] },
    });
  });

  it("emits an explicit empty commits list when the operator selects Never over an inherited policy", () => {
    const onChange = vi.fn();
    render(
      <CommitSection
        value={{}}
        onChange={onChange}
        inheritedCommits={[{ on: "run", stage: "worktree", gates: "full" }]}
      />,
    );
    chooseCommitPhase("Never");
    expect(onChange).toHaveBeenCalledWith({ workflow: { commits: [] } });
  });
});
