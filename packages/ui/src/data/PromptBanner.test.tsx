import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PromptSnapshot } from "../hooks/use-prompts";
import {
  analyzePromptInlineActions,
  buildPromptInlineValues,
  summarizePromptAnswer,
} from "./PromptBanner.model";
import { PromptBanner } from "./PromptBanner";

const approvalPrompt: PromptSnapshot = {
  id: "p-approval",
  kind: "approval",
  title: "Approve production deploy",
  description: "All checks passed.",
  state: "pending",
  value: { reason: "Change window is open" },
  schema: {
    type: "object",
    properties: {
      decision: {
        type: "string",
        title: "Decision",
        enum: ["approve", "reject"],
        "x-enum-labels": { approve: "Approve", reject: "Reject" },
      },
      reason: { type: "string", title: "Reason" },
    },
    required: ["decision"],
  },
};

const selectPrompt: PromptSnapshot = {
  id: "p-select",
  title: "Compatibility warning",
  state: "pending",
  schema: {
    type: "object",
    properties: {
      choice: {
        type: "string",
        title: "Choose",
        enum: ["0", "1"],
        "x-enum-labels": { "0": "Continue commit", "1": "Cancel commit" },
      },
    },
    required: ["choice"],
  },
};

const booleanPrompt: PromptSnapshot = {
  id: "p-bool",
  title: "Approve budget",
  state: "pending",
  schema: {
    type: "object",
    properties: {
      value: { type: "boolean", title: "Approve" },
    },
    required: ["value"],
  },
};

const unsupportedPrompt: PromptSnapshot = {
  id: "p-unsupported",
  title: "Choose deployment region",
  state: "pending",
  schema: {
    type: "object",
    properties: {
      region: { type: "string", enum: ["eu-west-1", "us-east-1"] },
    },
    required: ["region"],
  },
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("PromptBanner inline action model", () => {
  it("detects decision enum prompts and includes comments in answer values", () => {
    const spec = analyzePromptInlineActions(approvalPrompt);
    expect(spec).toMatchObject({ field: "decision", approveValue: "approve", rejectValue: "reject", commentField: "reason" });
    expect(buildPromptInlineValues(approvalPrompt, spec!, "approve", "LGTM")).toEqual({
      decision: "approve",
      reason: "LGTM",
    });
  });

  it("detects generated choice prompts from enum labels", () => {
    const spec = analyzePromptInlineActions(selectPrompt);
    expect(spec).toMatchObject({ field: "choice", approveValue: "0", rejectValue: "1" });
  });

  it("detects boolean confirm prompts", () => {
    const spec = analyzePromptInlineActions(booleanPrompt);
    expect(spec).toMatchObject({ field: "value", approveValue: true, rejectValue: false });
  });

  it("does not infer inline actions for unsupported schemas", () => {
    expect(analyzePromptInlineActions(unsupportedPrompt)).toBeNull();
  });

  it("summarizes answered prompt values", () => {
    expect(
      summarizePromptAnswer({
        ...approvalPrompt,
        state: "answered",
        value: { decision: "reject", reason: "Needs rollback plan" },
      }),
    ).toBe("Rejected - Needs rollback plan");
  });
});

describe("PromptBanner", () => {
  it("renders summary counts and recent prompt history", async () => {
    stubPromptStream([
      approvalPrompt,
      { ...selectPrompt, id: "p-done", title: "Previous approval", state: "answered", value: { choice: "0" } },
      { ...booleanPrompt, id: "p-cancelled", title: "Cancelled approval", state: "cancelled", cancelled: true },
    ]);

    render(<PromptBanner basePath="/api/todos" />);

    expect((await screen.findAllByText("Approve production deploy")).length).toBeGreaterThan(0);
    expect(screen.getByText("1 pending")).toBeInTheDocument();
    expect(screen.getByText("1 answered")).toBeInTheDocument();
    expect(screen.getByText("1 closed")).toBeInTheDocument();
    expect(screen.getByText("Previous approval")).toBeInTheDocument();
    expect(screen.getByText("Cancelled approval")).toBeInTheDocument();
  });

  it("posts inline approval values with a comment", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
    vi.stubGlobal("fetch", fetchMock);
    stubPromptStream([approvalPrompt]);

    render(<PromptBanner basePath="/api/todos" />);

    fireEvent.change(await screen.findByLabelText("Reason"), { target: { value: "Approved after smoke tests" } });
    fireEvent.click(screen.getByRole("button", { name: /Approve/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/todos/prompts/p-approval/answer");
    expect(JSON.parse(init.body)).toEqual({
      values: { decision: "approve", reason: "Approved after smoke tests" },
    });
  });

  it("posts inline reject values instead of cancellation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
    vi.stubGlobal("fetch", fetchMock);
    stubPromptStream([selectPrompt]);

    render(<PromptBanner basePath="/api/todos" />);

    fireEvent.click(await screen.findByRole("button", { name: /Reject/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ values: { choice: "1" } });
  });

  it("falls back to the full dialog for unsupported prompt schemas", async () => {
    stubPromptStream([unsupportedPrompt]);

    render(<PromptBanner basePath="/api/todos" />);

    await screen.findByRole("button", { name: "Answer" });
    expect(screen.queryByRole("button", { name: /Approve/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Answer" }));
    expect(screen.getByRole("dialog", { name: "Choose deployment region" })).toBeInTheDocument();
  });

  it("keeps the banner visible and shows resolve errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, text: async () => "schema mismatch" }));
    stubPromptStream([approvalPrompt]);

    render(<PromptBanner basePath="/api/todos" />);

    fireEvent.click(await screen.findByRole("button", { name: /Approve/ }));

    expect(await screen.findByText("schema mismatch")).toBeInTheDocument();
    expect(screen.getAllByText("Approve production deploy").length).toBeGreaterThan(0);
  });
});

function stubPromptStream(prompts: PromptSnapshot[]) {
  class FakeEventSource {
    private listeners: Record<string, ((event: MessageEvent) => void)[]> = {};

    constructor() {
      setTimeout(() => this.emit("prompts", prompts), 0);
    }

    addEventListener(type: string, callback: (event: MessageEvent) => void) {
      (this.listeners[type] ??= []).push(callback);
    }

    close() {}

    private emit(type: string, data: unknown) {
      for (const callback of this.listeners[type] ?? []) {
        callback(new MessageEvent(type, { data: JSON.stringify(data) }));
      }
    }
  }

  vi.stubGlobal("EventSource", FakeEventSource);
}
