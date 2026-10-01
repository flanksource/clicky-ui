import { useState } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RuntimeBar } from "../../runtime/RuntimeBar";
import type { RuntimePreset } from "../runtime-profile";
import type { RuntimePresetMenuValue } from "./model";
import { useRuntimePresetMenu } from "./use-runtime-preset-menu";

const PRESETS: RuntimePreset[] = [
  {
    id: "careful",
    name: "Careful",
    scope: "surface",
    spec: { effort: "high", permissions: { mode: "plan" } },
  },
  { id: "quick", name: "Quick", scope: "surface", spec: { effort: "low" } },
];
const INITIAL: RuntimePresetMenuValue = {
  spec: {
    mode: "cli",
    effort: "medium",
    budget: { timeout: "30m" },
    prompt: { user: "Keep this prompt" },
  },
  presets: [],
};

function Harness({
  create,
  catalog = PRESETS,
}: {
  create?: ((draft: RuntimePreset) => Promise<RuntimePreset>) | undefined;
  catalog?: RuntimePreset[];
}) {
  const [value, setValue] = useState(INITIAL);
  const { menu, dialogs } = useRuntimePresetMenu({
    value,
    onChange: setValue,
    presets: catalog,
    onCreatePreset: create,
  });
  return (
    <>
      <RuntimeBar
        value={value.spec}
        onChange={(spec) => setValue({ ...value, spec })}
        showTimeout
        showCost
        actions={{ menu }}
      />
      {dialogs}
      <output>{JSON.stringify(value)}</output>
    </>
  );
}

function currentValue(): RuntimePresetMenuValue {
  return JSON.parse(screen.getByRole("status").textContent!);
}

function openPresets() {
  fireEvent.click(screen.getByTitle("Runtime options"));
  fireEvent.click(screen.getByRole("menuitem", { name: "Presets" }));
}

function openSave() {
  fireEvent.click(screen.getByTitle("Runtime options"));
  fireEvent.click(screen.getByRole("menuitem", { name: "Save as preset…" }));
}

describe("runtime preset menu", () => {
  it("layers and applies a preset, then preserves edits when deselecting it", () => {
    render(<Harness />);
    openPresets();
    fireEvent.click(screen.getByRole("menuitem", { name: "Careful" }));
    expect(currentValue()).toEqual({
      spec: { ...INITIAL.spec, effort: "high", permissions: { mode: "plan" } },
      presets: ["careful"],
    });
    openPresets();
    expect(
      screen.getByRole("menuitem", { name: "Careful" }).querySelector("svg"),
    ).not.toHaveClass("invisible");
    fireEvent.click(screen.getByRole("menuitem", { name: "Careful" }));
    expect(currentValue().presets).toEqual([]);
    expect(currentValue().spec.effort).toBe("high");
  });

  it("offers the existing ordering modal after selecting two presets", () => {
    render(<Harness />);
    openPresets();
    fireEvent.click(screen.getByRole("menuitem", { name: "Careful" }));
    openPresets();
    fireEvent.click(screen.getByRole("menuitem", { name: "Quick" }));
    openPresets();
    fireEvent.click(screen.getByRole("menuitem", { name: "Reorder presets…" }));
    fireEvent.click(screen.getByRole("button", { name: "Move Quick up" }));
    expect(currentValue().presets).toEqual(["quick", "careful"]);
    expect(currentValue().spec.effort).toBe("low");
  });

  it("hides saving without a host callback and shows an empty catalog", () => {
    render(<Harness catalog={[]} />);
    openPresets();
    expect(
      screen.getByRole("menuitem", { name: "No presets yet" }),
    ).toBeDisabled();
    expect(
      screen.queryByRole("menuitem", { name: "Save as preset…" }),
    ).not.toBeInTheDocument();
  });

  it("validates names, previews captured settings, and cancels without saving", () => {
    const create = vi.fn();
    render(<Harness create={create} />);
    openSave();
    const dialog = screen.getByRole("dialog", { name: "Save as preset" });
    expect(
      within(dialog).getByRole("region", { name: "Preset settings" }),
    ).toHaveTextContent("30m");
    expect(dialog).not.toHaveTextContent("Keep this prompt");
    fireEvent.change(screen.getByLabelText("Preset name"), {
      target: { value: " CAREFUL " },
    });
    expect(screen.getByRole("button", { name: "Save preset" })).toBeDisabled();
    expect(dialog).toHaveTextContent("A unique preset name is required.");
    fireEvent.change(screen.getByLabelText("Preset name"), {
      target: { value: " " },
    });
    expect(screen.getByRole("button", { name: "Save preset" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(create).not.toHaveBeenCalled();
    expect(currentValue()).toEqual(INITIAL);
  });

  it("saves only bar settings and makes the returned canonical preset selectable", async () => {
    const create = vi.fn(async (draft: RuntimePreset) => ({
      ...draft,
      id: "saved-canonical",
    }));
    render(<Harness create={create} catalog={[]} />);
    openSave();
    fireEvent.change(screen.getByLabelText("Preset name"), {
      target: { value: " My runtime " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save preset" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(create).toHaveBeenCalledWith({
      id: expect.any(String),
      name: "My runtime",
      scope: "surface",
      presets: [],
      spec: { mode: "cli", effort: "medium", budget: { timeout: "30m" } },
    });
    expect(currentValue()).toEqual({
      ...INITIAL,
      presets: ["saved-canonical"],
    });
    openPresets();
    fireEvent.click(screen.getByRole("menuitem", { name: "My runtime" }));
    openPresets();
    fireEvent.click(screen.getByRole("menuitem", { name: "My runtime" }));
    expect(currentValue().presets).toEqual(["saved-canonical"]);
  });

  it("blocks duplicate submissions and retains the draft after a failed save", async () => {
    let rejectSave!: (reason: Error) => void;
    const create = vi.fn(
      () =>
        new Promise<RuntimePreset>((_resolve, reject) => {
          rejectSave = reject;
        }),
    );
    render(<Harness create={create} />);
    openSave();
    fireEvent.change(screen.getByLabelText("Preset name"), {
      target: { value: "Retry me" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save preset" }));
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Saving…" }));
    expect(create).toHaveBeenCalledTimes(1);
    await act(async () => rejectSave(new Error("Store unavailable")));
    expect(screen.getByRole("alert")).toHaveTextContent("Store unavailable");
    expect(screen.getByLabelText("Preset name")).toHaveValue("Retry me");
    expect(screen.getByRole("button", { name: "Save preset" })).toBeEnabled();
    expect(currentValue()).toEqual(INITIAL);
  });
});
