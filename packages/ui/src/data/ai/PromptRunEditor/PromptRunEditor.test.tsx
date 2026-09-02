import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { PromptRunEditor, type PromptRunEditorProps } from ".";
import type { RuntimePreset, RuntimeProfile } from "../runtime-profile";
import type { AIPromptRunValue } from "./model";

const PRESETS: RuntimePreset[] = [
  {
    id: "defaults",
    name: "Defaults",
    scope: "global",
    spec: { model: "anthropic/claude-sonnet-5", mode: "cli" },
  },
];

const PROFILES: RuntimeProfile[] = [
  {
    id: "review-profile",
    name: "Plan and review",
    spec: { permissions: { mode: "plan" } },
    presets: ["defaults"],
  },
];

function Harness({
  initial,
  ...props
}: { initial: AIPromptRunValue } & Omit<PromptRunEditorProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <PromptRunEditor value={value} onChange={setValue} {...props} />
      <output data-testid="value-json">{JSON.stringify(value)}</output>
    </>
  );
}

function currentValue(): AIPromptRunValue {
  return JSON.parse(screen.getByTestId("value-json").textContent ?? "{}");
}

const VALUE: AIPromptRunValue = {
  variables: { company: "Acme" },
  spec: {
    model: "claude-sonnet-4-6",
    id: "anthropic/claude-sonnet-4-6",
    mode: "api",
    prompt: { user: "Review {{company}}", system: "Be precise" },
    messages: [{ role: "user", parts: [{ type: "text", text: "preserve me" }] }],
  },
  chat: true,
};

describe("PromptRunEditor", () => {
  it("edits the canonical prompt run request without dropping untouched spec fields", () => {
    const onChange = vi.fn();
    render(<PromptRunEditor value={VALUE} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("User prompt"), {
      target: { value: "Reconcile {{company}}" },
    });

    expect(onChange).toHaveBeenLastCalledWith({
      ...VALUE,
      spec: {
        ...VALUE.spec,
        prompt: {
          ...VALUE.spec?.prompt,
          user: "Reconcile {{company}}",
        },
      },
    });
  });

  it("creates canonical comparison runtimes inside the shared editor", () => {
    const onChange = vi.fn();
    render(<PromptRunEditor value={VALUE} onChange={onChange} />);

    expect(screen.getByRole("group", { name: "Runtime 1" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add runtime" }));

    expect(onChange).toHaveBeenLastCalledWith({
      ...VALUE,
      spec: VALUE.spec,
      runtimes: [
        {
          model: "claude-sonnet-4-6",
          id: "anthropic/claude-sonnet-4-6",
          mode: "api",
        },
        { mode: "api" },
      ],
    });
  });

  it("renders no profile picker unless profiles are supplied", () => {
    render(<PromptRunEditor value={VALUE} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit spec" }));
    expect(
      screen.queryByRole("combobox", { name: "Runtime profile" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("runtime-profile-chip")).not.toBeInTheDocument();
  });

  it("selects a profile by reference and edits its draft without touching the run spec", async () => {
    const onSaveProfile = vi.fn(async (profile: RuntimeProfile) => profile);
    render(
      <Harness
        initial={VALUE}
        profiles={PROFILES}
        presets={PRESETS}
        onSaveProfile={onSaveProfile}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit spec" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("combobox", { name: "Runtime profile" }));
    fireEvent.mouseDown(screen.getByRole("option", { name: /Plan and review/ }));
    expect(currentValue()).toEqual({ ...VALUE, runtimeProfile: "review-profile" });
    expect(screen.getByTestId("runtime-profile-chip")).toHaveTextContent(
      "Profile · Plan and review",
    );

    fireEvent.click(
      within(dialog).getByRole("radio", { name: "Profile «Plan and review»" }),
    );
    expect(within(dialog).getByText("Editing profile «Plan and review»")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByTitle("Model — prompt default"));
    fireEvent.change(screen.getByLabelText("Model id"), {
      target: { value: "openai/gpt-5.5" },
    });
    expect(currentValue().spec?.model).toBe("claude-sonnet-4-6");

    await act(async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: "Save profile" }));
    });
    expect(onSaveProfile).toHaveBeenCalledTimes(1);
    expect(onSaveProfile).toHaveBeenCalledWith({
      ...PROFILES[0],
      spec: { permissions: { mode: "plan" }, model: "openai/gpt-5.5" },
    });
    expect(currentValue()).toEqual({ ...VALUE, runtimeProfile: "review-profile" });
  });
});
