import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { PromptRunEditor, type PromptRunEditorProps } from ".";
import type { RuntimePreset } from "../runtime-profile";
import type { AIPromptRunValue } from "./model";

const INITIAL: AIPromptRunValue = {
  variables: { tenant: "acme" },
  chat: true,
  spec: { mode: "api", effort: "medium", prompt: { user: "Keep this prompt" } },
};
const PRESET: RuntimePreset = {
  id: "review",
  name: "Review",
  scope: "surface",
  spec: {
    mode: "api",
    model: "review-model",
    effort: "high",
    permissions: { mode: "plan" },
  },
};

function Harness({
  initial = INITIAL,
  ...props
}: Omit<PromptRunEditorProps, "value" | "onChange"> & {
  initial?: AIPromptRunValue;
}) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <PromptRunEditor value={value} onChange={setValue} {...props} />
      <output>{JSON.stringify(value)}</output>
    </>
  );
}

function currentValue(): AIPromptRunValue {
  return JSON.parse(screen.getByRole("status").textContent!);
}

function openMenu(name: string) {
  fireEvent.click(screen.getAllByTitle("Runtime options").at(-1)!);
  fireEvent.click(screen.getByRole("menuitem", { name }));
}

describe("PromptRunEditor runtime bar", () => {
  it("uses the resolved model's permission catalog for an unspecified identity", () => {
    render(
      <Harness
        initial={{ spec: {} }}
        models={[
          { id: "resolved-model", provider: "openai", label: "Resolved model" },
        ]}
        families={[
          {
            id: "claude",
            label: "Claude",
            provider: "anthropic",
            modes: [{ id: "agent", label: "Agent" }],
          },
          {
            id: "codex",
            label: "Codex",
            provider: "openai",
            modes: [{ id: "agent", label: "Agent" }],
          },
        ]}
        resolution={{
          spec: { mode: "agent", model: "resolved-model" },
          constraints: {},
          trace: [],
        }}
      />,
    );
    openMenu("Permission mode");
    expect(
      screen.getByRole("menuitem", { name: "Read only" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Manual" }),
    ).not.toBeInTheDocument();
    expect(currentValue()).toEqual({ spec: {} });
  });
  it("edits Source and Commit without dropping prompt or run fields", () => {
    render(<Harness />);
    openMenu("Source");
    fireEvent.click(screen.getByRole("menuitem", { name: "HEAD" }));
    openMenu("Commit");
    fireEvent.click(screen.getByRole("menuitem", { name: "Never" }));
    expect(currentValue()).toEqual({
      ...INITIAL,
      spec: {
        ...INITIAL.spec,
        setup: {
          checkout: {
            worktree: {
              mode: "none",
              base: "",
              path: "",
              prefix: "",
              keep: false,
            },
          },
        },
        workflow: { commits: [] },
      },
    });
  });

  it("applies preset settings to the first multi-model row and preserves the other row", () => {
    const second = { mode: "api", model: "second-model" };
    render(
      <Harness
        initial={{
          ...INITIAL,
          runtimes: [{ mode: "api", model: "first-model" }, second],
        }}
        presets={[PRESET]}
      />,
    );
    openMenu("Presets");
    fireEvent.click(screen.getByRole("menuitem", { name: "Review" }));
    expect(currentValue()).toEqual({
      ...INITIAL,
      presets: [PRESET.id],
      spec: { ...INITIAL.spec, ...PRESET.spec },
      runtimes: [
        { mode: "api", model: "review-model", effort: "high" },
        second,
      ],
    });
  });

  it("saves only the authored bar settings through the host callback", async () => {
    const create = vi.fn(async (draft: RuntimePreset) => ({
      ...draft,
      id: "saved",
    }));
    render(<Harness presets={[]} onCreatePreset={create} />);
    openMenu("Save as preset…");
    const dialog = screen.getByRole("dialog", { name: "Save as preset" });
    expect(
      within(dialog).getByRole("region", { name: "Preset settings" }),
    ).not.toHaveTextContent("Keep this prompt");
    fireEvent.change(screen.getByLabelText("Preset name"), {
      target: { value: "Review defaults" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save preset" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(create).toHaveBeenCalledWith({
      id: expect.any(String),
      name: "Review defaults",
      scope: "surface",
      presets: [],
      spec: { mode: "api", effort: "medium" },
    });
    expect(currentValue()).toEqual({ ...INITIAL, presets: ["saved"] });
  });

  it("respects the allowed spec sections in a verification editor", () => {
    render(<Harness specSections={["model", "permissions", "verify"]} />);
    fireEvent.click(screen.getByTitle("Runtime options"));
    expect(
      screen.queryByRole("menuitem", { name: "Source" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Commit" }),
    ).not.toBeInTheDocument();
  });
});
