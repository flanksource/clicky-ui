import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommitSection } from "./CommitSection";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";

describe("CommitSection details", () => {
  it.each([undefined, []])(
    "offers no commit message when commits are disabled (%j)",
    (commits) => {
      render(
        <CommitSection
          value={commits ? { workflow: { commits } } : {}}
          onChange={vi.fn()}
        />,
      );
      expect(screen.queryByLabelText("Commit message")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("combobox", { name: "Commit" }),
      ).not.toBeInTheDocument();
    },
  );

  it("edits the message without copying inherited policy settings", () => {
    const onChange = vi.fn();
    render(
      <CommitSection
        value={{}}
        onChange={onChange}
        inheritedCommits={[{ on: "turn", stage: "worktree", gates: "full" }]}
      />,
    );
    fireEvent.change(screen.getByLabelText("Commit message"), {
      target: { value: "Apply changes" },
    });
    expect(onChange).toHaveBeenCalledWith({
      workflow: { commits: [{ message: "Apply changes" }] },
    });
  });

  it("preserves an explicit policy when editing its message", () => {
    const value: AISpecRuntimeValue = {
      workflow: { commits: [{ on: "turn", stage: "session" }] },
    };
    const onChange = vi.fn();
    render(<CommitSection value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Commit message"), {
      target: { value: "Apply changes" },
    });
    expect(onChange).toHaveBeenCalledWith({
      workflow: {
        commits: [{ on: "turn", stage: "session", message: "Apply changes" }],
      },
    });
  });
});
