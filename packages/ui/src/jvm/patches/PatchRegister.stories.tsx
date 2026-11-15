import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import type { JvmPatch } from "../protocol/types";
import { PatchRegister } from "./PatchRegister";

const NOW = Date.parse("2026-11-15T08:00:00Z");

const PATCHES: JvmPatch[] = [
  { class: "com.example.orders.OrderService", loader: "app", patched: true, leaseExpiresAt: NOW + 120_000 },
  { class: "com.example.payments.PaymentGateway", loader: "app", patched: true },
  { class: "com.example.legacy.ReportJob", loader: "gone", patched: false, error: "class is no longer loaded" },
  { class: "com.example.rules.Rule42", loader: "~janino", patched: true, leaseExpiresAt: NOW + 30_000 },
];

function Demo({ patches, canMutate, failures }: { patches: JvmPatch[]; canMutate: boolean; failures: { key: string; className: string; message: string }[] }) {
  const [current, setCurrent] = useState(patches);
  return (
    <div className="h-[420px] p-3">
      <PatchRegister
        patches={current}
        now={NOW}
        canMutate={canMutate}
        failures={failures}
        onRestore={(patch) => setCurrent((rows) => rows.filter((row) => row !== patch))}
        onRestoreAll={(restorable) => setCurrent((rows) => rows.filter((row) => !restorable.includes(row)))}
        onRenew={(patch) => setCurrent((rows) => rows.map((row) => (row === patch ? { ...row, leaseExpiresAt: NOW + 120_000 } : row)))}
        emptyHint="Patch a class from the class browser and it appears here."
        renderClassLink={(patch) => (
          <a className="truncate font-mono text-xs text-primary hover:underline" href={`#/classes/${patch.class}`}>
            {patch.class}
          </a>
        )}
      />
    </div>
  );
}

const meta = {
  title: "JVM/PatchRegister",
  component: Demo,
  parameters: { layout: "fullscreen" },
  args: { patches: PATCHES, canMutate: true, failures: [] },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Register: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("3 classes patched")).toBeInTheDocument();
    await expect(canvas.getByText(/1 class has no lease/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Restore com.example.orders.OrderService" }));
    await expect(canvas.getByText("2 classes patched")).toBeInTheDocument();
  },
};

export const RestoreAll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Restore all (2)" }));
    await expect(canvas.getByText("0 classes patched")).toBeInTheDocument();
  },
};

export const WritesDisabled: Story = {
  args: { canMutate: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Restore all (2)" })).toBeDisabled();
  },
};

export const RestoreFailed: Story = {
  args: { failures: [{ key: "app:com.example.payments.PaymentGateway", className: "com.example.payments.PaymentGateway", message: "redefinition rejected: schema change" }] },
};

export const Empty: Story = {
  args: { patches: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("This JVM is running its original bytecode.")).toBeInTheDocument();
  },
};
