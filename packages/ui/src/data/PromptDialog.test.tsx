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

const connectionPrompt: PromptSnapshot = {
  id: "p2",
  title: "Target database",
  state: "pending",
  value: {},
  schema: {
    type: "object",
    properties: {
      db: {
        type: "string",
        title: "Connection",
        "x-clicky-lookup": { url: "/api/v1/connection?types=sql_server", filter: "connection", searchParam: "__lookup_q" },
      },
    },
  } as PromptSnapshot["schema"],
};

describe("PromptDialog lookups", () => {
  it("resolves the schema's x-clicky-lookup fields through the supplied fetcher", async () => {
    const lookupFetcher = vi.fn().mockResolvedValue([{ value: "lab", label: "lab (sql_server)" }]);
    render(
      <PromptDialog prompt={connectionPrompt} basePath="/api" open onClose={() => {}} lookupFetcher={lookupFetcher} />,
    );
    await waitFor(() => expect(lookupFetcher).toHaveBeenCalled());
    expect(lookupFetcher.mock.calls[0][0].descriptor.url).toBe("/api/v1/connection?types=sql_server");
  });
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

describe("PromptDialog size", () => {
  const dialogClass = (size?: "md" | "xl") => {
    const { unmount } = render(
      <PromptDialog prompt={selectPrompt} basePath="/api/todos" open onClose={() => {}} {...(size ? { size } : {})} />,
    );
    const className = screen.getByRole("dialog").className;
    unmount();
    return className;
  };

  it("opens wide enough for a multi-field form by default, and takes a host's size", () => {
    expect(dialogClass()).toContain("max-w-2xl");
    expect(dialogClass("xl")).toContain("max-w-4xl");
    expect(dialogClass("md")).toContain("max-w-md");
  });
});
