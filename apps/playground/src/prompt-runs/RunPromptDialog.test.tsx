// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../comments/useComments";
import type { PromptRun } from "./prompt-runs-api";
import {
  RunPromptPanel,
  type PromptRunsApi,
  type PromptTarget,
} from "./RunPromptDialog";

const PROMPT = { id: "polish-copy", name: "Polish copy", version: "v1" };
const MODEL = "anthropic/claude-sonnet-4-6";
const SPEC_SCHEMA = {
  type: "object",
  properties: { model: { type: "string" } },
};
const RUNTIMES = [
  {
    family: "claude",
    provider: "anthropic",
    catalogPrefix: "anthropic",
    modes: [
      {
        mode: "cli",
        defaultModel: MODEL,
        availability: { state: "available" },
        schema: SPEC_SCHEMA,
      },
      {
        mode: "api",
        defaultModel: MODEL,
        availability: { state: "missing_credentials" },
        schema: SPEC_SCHEMA,
      },
    ],
  },
] as Awaited<ReturnType<PromptRunsApi["fetchRuntimeCatalog"]>>;
const MODELS = [
  {
    id: MODEL,
    provider: "anthropic",
    label: "Claude Sonnet 4.6",
    reasoning: true,
  },
];
const TARGET: PromptTarget = {
  page: "welcome",
  anchor: "heading",
  element: Promise.resolve({
    source: "src/pages/welcome.tsx:3",
    html: "<h1>Playground</h1>",
  }),
};
const RUN: PromptRun = {
  runId: "run-1",
  promptId: PROMPT.id,
  promptName: PROMPT.name,
  page: TARGET.page,
  anchor: TARGET.anchor,
  startedAt: "2026-10-25T00:00:00.000Z",
  state: "running",
};

function stubApi(overrides: Partial<PromptRunsApi> = {}): PromptRunsApi {
  return {
    fetchPrompts: vi.fn(async () => [PROMPT]),
    fetchPrompt: vi.fn(async () => ({
      prompt: PROMPT,
      preparationId: "prepared",
      variablesSchema: { type: "object", properties: {} },
    })),
    startPromptRun: vi.fn(async () => RUN),
    fetchRuntimeCatalog: vi.fn(async () => RUNTIMES),
    fetchModelCatalog: vi.fn(async () => MODELS),
    fetchWorkspaceFiles: vi.fn(async () => []),
    ...overrides,
  };
}

function renderPanel(api: PromptRunsApi, target: PromptTarget = TARGET) {
  const onStarted = vi.fn();
  render(
    <RunPromptPanel
      target={target}
      api={api}
      defaultPromptId={PROMPT.id}
      onStarted={onStarted}
      onClose={vi.fn()}
    />,
  );
  return onStarted;
}

afterEach(cleanup);

describe("RunPromptPanel", () => {
  it("starts the run on the runtime bar's first available runtime", async () => {
    const api = stubApi();
    const onStarted = renderPanel(api);
    expect(
      await screen.findByRole("group", { name: "Prompt runtime" }),
    ).toBeTruthy();
    await screen.findByText("This prompt takes no arguments.");
    fireEvent.click(screen.getByRole("button", { name: "Run prompt" }));
    await vi.waitFor(() => expect(onStarted).toHaveBeenCalledWith(RUN));
    expect(api.startPromptRun).toHaveBeenCalledWith(
      expect.objectContaining({
        promptId: PROMPT.id,
        presets: ["lint"],
        spec: { mode: "cli", model: MODEL },
      }),
    );
  });

  it("starts on the runtime and presets the prompt's frontmatter configures", async () => {
    const configured = {
      mode: "cli",
      model: "openai/gpt-5-codex",
      effort: "high",
      prompt: { user: "Polish" },
    };
    const api = stubApi({
      fetchPrompt: vi.fn(async () => ({
        prompt: {
          ...PROMPT,
          run: { presets: ["review", "strict"], spec: configured },
        },
        preparationId: "prepared",
        variablesSchema: { type: "object", properties: {} },
      })),
    });
    const onStarted = renderPanel(api);
    await screen.findByText("This prompt takes no arguments.");
    fireEvent.click(screen.getByRole("button", { name: "Run prompt" }));
    await vi.waitFor(() => expect(onStarted).toHaveBeenCalledWith(RUN));
    expect(api.startPromptRun).toHaveBeenCalledWith(
      expect.objectContaining({
        presets: ["review", "strict"],
        spec: { mode: "cli", model: "openai/gpt-5-codex", effort: "high" },
      }),
    );
  });

  it("runs on the target's own files, not the element's source file", async () => {
    const markdownFile = "apps/playground/src/pages/guide.md";
    const api = stubApi({
      fetchPrompt: vi.fn(async () => ({
        prompt: PROMPT,
        preparationId: "prepared",
        variablesSchema: {
          type: "object",
          properties: { files: { type: "string" } },
        },
      })),
    });
    const onStarted = renderPanel(api, { ...TARGET, files: [markdownFile] });
    await screen.findByRole("group", { name: "Prompt runtime" });
    await vi.waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Run prompt",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "Run prompt" }));
    await vi.waitFor(() => expect(onStarted).toHaveBeenCalledWith(RUN));
    expect(api.startPromptRun).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { files: markdownFile } }),
    );
  });

  it("names the runtime catalog when it fails to load, and Retry recovers", async () => {
    const fetchRuntimeCatalog = vi
      .fn<PromptRunsApi["fetchRuntimeCatalog"]>()
      .mockRejectedValueOnce(
        new Error("GET /__playground/runtime-profiles/runtimes failed (502)"),
      )
      .mockResolvedValue(RUNTIMES);
    renderPanel(stubApi({ fetchRuntimeCatalog }));
    expect(
      await screen.findByText("Couldn't load runtimes from captain"),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(
      await screen.findByRole("button", { name: "Run prompt" }),
    ).toBeTruthy();
  });

  it("refuses to offer a run when captain has no available runtime", async () => {
    const unavailable = RUNTIMES.map((family) => ({
      ...family,
      modes: family.modes.map((mode) => ({
        ...mode,
        availability: { state: "missing_executable" as const },
      })),
    }));
    renderPanel(
      stubApi({ fetchRuntimeCatalog: vi.fn(async () => unavailable) }),
    );
    expect(
      await screen.findByText(/Captain reports no available runtime/),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Run prompt" })).toBeNull();
  });

  it("keeps the form after a rejected start and labels the button Try again", async () => {
    const startPromptRun = vi
      .fn<PromptRunsApi["startPromptRun"]>()
      .mockRejectedValueOnce(
        new Error("runtime claude:sonnet is not installed"),
      );
    const onStarted = renderPanel(stubApi({ startPromptRun }));
    fireEvent.click(await screen.findByRole("button", { name: "Run prompt" }));
    expect(await screen.findByText("Couldn't start the run")).toBeTruthy();
    expect(
      screen.getByText("runtime claude:sonnet is not installed"),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    expect(onStarted).not.toHaveBeenCalled();
  });

  it("shows Captain's refusal as its message with the hint in view and the request kept as context", async () => {
    const refusal = "a run needs something to do: prompt.user is empty";
    const hint =
      "Captain refused the run. Check the prompt's arguments and runtime, then try again.";
    const command = "clicky prompt run --presets=lint";
    const startPromptRun = vi
      .fn<PromptRunsApi["startPromptRun"]>()
      .mockRejectedValueOnce(
        new ApiError(502, {
          message: refusal,
          context: [
            ["Hint", hint],
            ["Captain", "POST /api/v1/prompt/run"],
            ["Exit code", "1"],
          ],
          details: [{ label: "Captain command", value: command }],
        }),
      );
    renderPanel(stubApi({ startPromptRun }));
    fireEvent.click(await screen.findByRole("button", { name: "Run prompt" }));
    expect(await screen.findByText(refusal)).toBeTruthy();
    expect(screen.getByRole("note").textContent).toBe(hint);
    const context = [...document.querySelectorAll("details")]
      .map((details) => details.textContent ?? "")
      .join("\n");
    expect(context).toContain("POST /api/v1/prompt/run");
    expect(context).toContain(command);
    expect(context).not.toContain(hint);
  });
});
