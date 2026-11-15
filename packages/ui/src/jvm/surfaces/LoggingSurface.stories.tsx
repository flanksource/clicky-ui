import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { fakeJvmClient } from "../fixtures/fake-client";
import type { JvmStatus } from "../protocol/types";
import { JvmProvider } from "./JvmProvider";
import { LoggingSurface, type LoggingSurfaceState } from "./LoggingSurface";

type Args = { status: JvmStatus; initial: LoggingSurfaceState };

function Demo({ status, initial }: Args) {
  const [client] = useState(() => fakeJvmClient({ status }));
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  const [state, setState] = useState(initial);
  return (
    <QueryClientProvider client={queryClient}>
      <JvmProvider client={client} scope="story">
        <div className="h-[520px]">
          <LoggingSurface state={state} onStateChange={setState} />
        </div>
      </JvmProvider>
    </QueryClientProvider>
  );
}

const meta = {
  title: "JVM/LoggingSurface",
  component: Demo,
  parameters: { layout: "fullscreen" },
  args: { status: { allowMutation: true }, initial: {} },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loggers: Story = {
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText("com.example.orders.OrderService")).toBeInTheDocument();
  },
};

export const EditLevel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const edit = await canvas.findByRole("button", { name: "Edit level of com.example" });
    await expect(edit).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Allow logger changes" }));
    await expect(edit).toBeEnabled();
  },
};

export const Filtered: Story = {
  args: { initial: { q: "catalina" } },
};

export const MutationsDisabled: Story = {
  args: { status: { allowMutation: false } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText(/Runtime changes are disabled/)).toBeInTheDocument();
  },
};
