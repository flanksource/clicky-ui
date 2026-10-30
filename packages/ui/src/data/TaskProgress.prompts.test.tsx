import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskProgress } from "./TaskProgress";
import type { TaskSnapshot } from "./TaskSnapshot";
import type { PromptSnapshot } from "../hooks/use-prompts";

const PROMPT_BASE = "/api/prompts-test";

const staleLockPrompt: PromptSnapshot = {
  id: "p-lock",
  kind: "select",
  title: "Stale git lock detected: .git/index.lock (age 12s, 0 bytes, no process has it open). Remove and retry?",
  state: "pending",
  schema: {
    type: "object",
    properties: {
      choice: {
        type: "string",
        enum: ["0", "1"],
        "x-enum-labels": { "0": "Remove and retry", "1": "Cancel" },
      },
    },
    required: ["choice"],
  },
};

const formPrompt: PromptSnapshot = {
  id: "p-form",
  kind: "form",
  title: "Describe the change",
  state: "pending",
  schema: { type: "object", properties: { summary: { type: "string", title: "Summary" } } },
};

function run(prompts: PromptSnapshot[]): TaskSnapshot[] {
  return [
    { id: "commit", name: "commit", type: "group", status: "running", groupId: "g1", total: 1, running: 1 },
    { id: "t1", name: "gavel commit", type: "task", groupId: "g1", status: "running", prompts },
  ];
}

afterEach(() => vi.unstubAllGlobals());

describe("TaskProgress prompts", () => {
  it("answers a running task's single-choice prompt with the clicked option", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<TaskProgress snapshots={run([staleLockPrompt])} promptBasePath={PROMPT_BASE} />);

    expect(screen.getByText(staleLockPrompt.title)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove and retry" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(`${PROMPT_BASE}/prompts/p-lock/answer`, expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ values: { choice: "0" } }),
    }));
  });

  it("opens the prompt form for a prompt that is not a single choice", () => {
    render(<TaskProgress snapshots={run([formPrompt])} promptBasePath={PROMPT_BASE} />);

    fireEvent.click(screen.getByRole("button", { name: `Answer ${formPrompt.title}` }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByLabelText("Summary")).toBeTruthy();
  });

  it("shows the answer error on the task row and keeps the prompt", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("prompt expired", { status: 409 })));
    render(<TaskProgress snapshots={run([staleLockPrompt])} promptBasePath={PROMPT_BASE} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect((await screen.findByRole("alert")).textContent).toContain("prompt expired");
    expect(screen.getByText(staleLockPrompt.title)).toBeTruthy();
  });
});
