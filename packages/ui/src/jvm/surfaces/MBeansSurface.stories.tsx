import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { fakeJvmClient } from "../fixtures/fake-client";
import { CACHE_MBEAN } from "../fixtures/mbeans";
import type { JvmStatus } from "../protocol/types";
import { JvmProvider } from "./JvmProvider";
import { MBeansSurface, type MBeansSurfaceState } from "./MBeansSurface";

type Args = { status: JvmStatus; initial: MBeansSurfaceState };

function Demo({ status, initial }: Args) {
  const [client] = useState(() => fakeJvmClient({ status }));
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  const [state, setState] = useState(initial);
  return (
    <QueryClientProvider client={queryClient}>
      <JvmProvider client={client} scope="story">
        <div className="h-[640px]">
          <MBeansSurface state={state} onStateChange={setState} />
        </div>
      </JvmProvider>
    </QueryClientProvider>
  );
}

const meta = {
  title: "JVM/MBeansSurface",
  component: Demo,
  parameters: { layout: "fullscreen" },
  args: { status: { allowMutation: true }, initial: { mbean: CACHE_MBEAN.objectName } },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Attributes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByTitle("1204")).toBeInTheDocument();
  },
};

export const Operations: Story = {
  args: { initial: { mbean: CACHE_MBEAN.objectName, view: "operations" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const run = await canvas.findByRole("button", { name: "Run clear()" });
    await expect(run).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Allow MBean changes" }));
    await expect(run).toBeEnabled();
  },
};

export const MutationsDisabled: Story = {
  args: { status: { allowMutation: false } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText(/Runtime changes are disabled/)).toBeInTheDocument();
  },
};

export const Filtered: Story = {
  args: { initial: { q: "java.lang" } },
};
