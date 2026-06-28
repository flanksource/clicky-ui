import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PromptDialog } from "./PromptDialog";
import { answerPrompt, type PromptSnapshot } from "../hooks/use-prompts";

const selectPrompt: PromptSnapshot = {
  id: "p1",
  title: "Staged file matches .gitignore",
  state: "pending",
  // A pre-seeded answer so Submit posts a deterministic value without driving the
  // radio widget in jsdom.
  value: { choice: "1" },
  schema: {
    type: "object",
    properties: {
      choice: {
        type: "string",
        title: "Choose",
        enum: ["0", "1"],
        "x-enum-labels": { "0": "Add to .gitignore", "1": "Allow once" },
        "x-enum-display": "radio",
      },
    },
    required: ["choice"],
  } as PromptSnapshot["schema"],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PromptDialog", () => {
  it("renders the prompt title and posts the answer on submit", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
    vi.stubGlobal("fetch", fetchMock);
    const onResolved = vi.fn();

    render(
      <PromptDialog prompt={selectPrompt} basePath="/api/todos" open onClose={() => {}} onResolved={onResolved} />,
    );

    expect(screen.getByText("Staged file matches .gitignore")).toBeTruthy();

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/todos/prompts/p1/answer");
    expect(JSON.parse(init.body)).toEqual({ values: { choice: "1" } });
    await waitFor(() => expect(onResolved).toHaveBeenCalled());
  });
});

describe("answerPrompt", () => {
  it("POSTs a cancellation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
    vi.stubGlobal("fetch", fetchMock);

    await answerPrompt("/api/todos", "p2", { cancelled: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/todos/prompts/p2/answer");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ cancelled: true });
  });
});
