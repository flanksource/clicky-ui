import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { PatchActions, type PatchActionsProps } from "./PatchActions";

function Demo(props: Omit<PatchActionsProps, "leaseSeconds" | "onLeaseSecondsChange">) {
  const [leaseSeconds, setLeaseSeconds] = useState(900);
  return <PatchActions {...props} leaseSeconds={leaseSeconds} onLeaseSecondsChange={setLeaseSeconds} />;
}

const meta = {
  title: "JVM/PatchActions",
  component: Demo,
  args: {
    editing: false,
    dirty: false,
    compiledCurrent: false,
    patched: false,
    busy: null,
    canEdit: true,
    mutationAllowed: true,
    onEdit: fn(),
    onCancel: fn(),
    onCompile: fn(),
    onApply: fn(),
    onRestore: fn(),
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reading: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit" }));
    await expect(args.onEdit).toHaveBeenCalled();
  },
};

export const ReadingPatched: Story = { args: { patched: true } };

export const RestoreNeedsConsent: Story = { args: { patched: true, mutationAllowed: false } };

export const EditBlocked: Story = { args: { canEdit: false, editDisabledReason: "This is a group of loaders; pick the loader that defines the class." } };

export const EditingUnchanged: Story = { args: { editing: true } };

export const EditingNotCompiled: Story = { args: { editing: true, dirty: true } };

export const EditingReadyToApply: Story = {
  args: { editing: true, dirty: true, compiledCurrent: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Restore original bytecode after" }), "300");
    await userEvent.click(canvas.getByRole("button", { name: "Apply patch" }));
    await expect(args.onApply).toHaveBeenCalled();
  },
};

export const EditingGateClosed: Story = { args: { editing: true, dirty: true, compiledCurrent: true, mutationAllowed: false } };

export const Compiling: Story = { args: { editing: true, dirty: true, busy: "compile" } };

export const Applying: Story = { args: { editing: true, dirty: true, compiledCurrent: true, busy: "patch" } };
