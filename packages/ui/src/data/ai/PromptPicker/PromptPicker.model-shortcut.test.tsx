import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import { PromptPickerField, type PromptSpecSavePayload } from ".";

vi.mock("../SpecRuntimeEditor", () => ({
  SpecRuntimeEditor: ({ value }: { value: AISpecRuntimeValue }) => (
    <output data-testid="runtime-value">{JSON.stringify(value)}</output>
  ),
}));

const models = [
  {
    id: "gpt-5.6-luna",
    provider: "openai",
    label: "GPT-5.6 Luna",
    reasoning: true,
    backends: ["codex-agent", "codex-cmux"],
  },
];
const families = [
  {
    id: "codex",
    label: "OpenAI",
    provider: "openai",
    modes: [
      { id: "codex-agent", label: "Codex Agent", backend: "codex-agent" },
    ],
  },
];

it("resolves agent:luna while loading and saves the canonical model fields", async () => {
  const raw = "---\nmodel: agent:luna\n---\nReview the change.";
  const loaded = {
    id: "lint.fix",
    scope: "global",
    source: "inline" as const,
    spec: { model: "agent:luna" },
    body: "Review the change.",
    raw,
  };
  const saved = {
    ...loaded,
    spec: { model: "gpt-5.6-luna", backend: "codex-agent" },
  };
  const onChange = vi.fn();
  const saveDetail = vi.fn(async (_payload: PromptSpecSavePayload) => saved);

  render(
    <PromptPickerField
      value={{ inline: raw }}
      onChange={onChange}
      title="Lint fix"
      loadDetail={() => Promise.resolve(loaded)}
      saveDetail={saveDetail}
      models={models}
      families={families}
    />
  );

  const row = await screen.findByRole("button", {
    name: "Edit prompt Lint fix",
  });
  expect(row).toHaveTextContent("GPT-5.6 Luna");
  expect(onChange).not.toHaveBeenCalled();

  fireEvent.click(row);
  expect(await screen.findByTestId("runtime-value")).toHaveTextContent(
    '"model":"gpt-5.6-luna","backend":"codex-agent"'
  );
  fireEvent.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() =>
    expect(saveDetail).toHaveBeenCalledWith({
      source: "inline",
      path: undefined,
      spec: { model: "gpt-5.6-luna", backend: "codex-agent" },
      body: "Review the change.",
      baseRaw: raw,
    })
  );
  expect(onChange).toHaveBeenCalledWith({ inline: raw });
});

it("fails loudly when a shortcut does not identify one catalog model", async () => {
  const loaded = {
    id: "lint.fix",
    scope: "global",
    source: "inline" as const,
    spec: { model: "agent:missing" },
    body: "Review the change.",
    raw: "---\nmodel: agent:missing\n---\nReview the change.",
  };
  const onChange = vi.fn();

  render(
    <PromptPickerField
      value={{ inline: loaded.raw }}
      onChange={onChange}
      title="Lint fix"
      loadDetail={() => Promise.resolve(loaded)}
      saveDetail={() => Promise.resolve(loaded)}
      models={models}
      families={families}
    />
  );

  const row = await screen.findByRole("button", {
    name: "Edit prompt Lint fix",
  });
  await waitFor(() => expect(row).toBeDisabled());
  expect(row).toHaveTextContent(
    'model shortcut "agent:missing" matched 0 catalog models'
  );
  expect(onChange).not.toHaveBeenCalled();
});
