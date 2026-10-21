import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SPEC_RUNTIME_FAMILIES } from "../runtime/runtime-mode";
import { runtimeSpecFields } from "./runtime-spec-fields";
import { SpecRuntimeBar } from "./SpecRuntimeBar";
import type {
  AISpecRuntimeCommit,
  AISpecRuntimeValue,
} from "./SpecRuntimeEditor.model";

const INHERITED: AISpecRuntimeCommit[] = [
  { on: "run", stage: "worktree", gates: "full" },
];

describe("commit policy runtime bar", () => {
  it.each([
    { value: {}, inheritedCommits: undefined, title: "-" },
    { value: {}, inheritedCommits: INHERITED, title: "End of run (inherited)" },
    {
      value: {},
      inheritedCommits: [{ on: "turn" }],
      title: "Every turn (inherited)",
    },
    { value: {}, inheritedCommits: [], title: "Never (inherited)" },
    {
      value: { workflow: { commits: [{ on: "turn" }] } },
      inheritedCommits: INHERITED,
      title: "Every turn",
    },
    {
      value: { workflow: { commits: [] } },
      inheritedCommits: INHERITED,
      title: "Never",
    },
  ] satisfies Array<{
    value: AISpecRuntimeValue;
    inheritedCommits: AISpecRuntimeCommit[] | undefined;
    title: string;
  }>)(
    "presents $title without changing the draft",
    ({ value, inheritedCommits, title }) => {
      const onChange = vi.fn();
      const commit = runtimeSpecFields({
        value,
        onChange,
        families: SPEC_RUNTIME_FAMILIES,
        inheritedCommits,
      }).find((field) => field.id === "workflow.commits");
      expect(commit?.title).toBe(`Commit — ${title}`);
      expect(onChange).not.toHaveBeenCalled();
    },
  );

  it.each([
    { choice: "End of run", commits: [{ on: "run" }] },
    { choice: "Never", commits: [] },
  ] satisfies Array<{ choice: string; commits: AISpecRuntimeCommit[] }>)(
    "writes only the explicit $choice choice over an inherited policy",
    async ({ choice, commits }) => {
      const onChange = vi.fn();
      render(
        <SpecRuntimeBar
          value={{}}
          onChange={onChange}
          inheritedCommits={INHERITED}
        />,
      );
      fireEvent.click(screen.getByTitle("Runtime options"));
      fireEvent.click(await screen.findByRole("menuitem", { name: "Commit" }));
      fireEvent.click(await screen.findByRole("menuitem", { name: choice }));
      expect(onChange).toHaveBeenCalledWith({ workflow: { commits } });
    },
  );
});
