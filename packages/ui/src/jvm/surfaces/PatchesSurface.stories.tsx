import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { fakeJvmClient } from "../fixtures/fake-client";
import type { JvmStatus } from "../protocol/types";
import { JvmProvider } from "./JvmProvider";
import { PatchesSurface } from "./PatchesSurface";

type Args = { status: JvmStatus; patched: boolean };

function Demo({ status, patched }: Args) {
  const [client] = useState(() => fakeJvmClient({ status, patched }));
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return (
    <QueryClientProvider client={queryClient}>
      <JvmProvider client={client} scope="story">
        <div className="h-[420px]">
          <PatchesSurface emptyHint="Patch a class from the class browser and it appears here." />
        </div>
      </JvmProvider>
    </QueryClientProvider>
  );
}

const meta = {
  title: "JVM/PatchesSurface",
  component: Demo,
  parameters: { layout: "fullscreen" },
  args: { status: { allowMutation: true }, patched: true },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Register: Story = {
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText("com.example.orders.OrderService")).toBeInTheDocument();
  },
};

export const RestoreAfterConsent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const restore = await canvas.findByRole("button", { name: "Restore com.example.orders.OrderService" });
    await expect(restore).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Allow patch changes" }));
    await userEvent.click(restore);
    await expect(await canvas.findByText("This JVM is running its original bytecode.")).toBeInTheDocument();
  },
};

export const MutationsDisabled: Story = {
  args: { status: { allowMutation: false } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText(/Runtime changes are disabled/)).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { patched: false },
};
