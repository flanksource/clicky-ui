import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { fakeJvmClient } from "../fixtures/fake-client";
import { JvmProvider } from "./JvmProvider";
import { RuntimeSurface } from "./RuntimeSurface";

function Demo() {
  const [client] = useState(() => fakeJvmClient());
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return (
    <QueryClientProvider client={queryClient}>
      <JvmProvider client={client} scope="story">
        <div className="h-[720px]">
          <RuntimeSurface />
        </div>
      </JvmProvider>
    </QueryClientProvider>
  );
}

const meta = {
  title: "JVM/RuntimeSurface",
  component: Demo,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Runtime: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("G1 Old Generation")).toBeInTheDocument();
    await expect(canvas.getByText(/Snapshot captured at/)).toBeInTheDocument();
  },
};
