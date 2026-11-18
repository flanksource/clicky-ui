import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { fakeJvmClient } from "../fixtures/fake-client";
import type { JvmStatus } from "../protocol/types";
import { ExpressionSurface, type ExpressionSurfaceState } from "./ExpressionSurface";
import { JvmProvider } from "./JvmProvider";

type Args = { status: JvmStatus; initial: ExpressionSurfaceState };

function Demo({ status, initial }: Args) {
  const [client] = useState(() => fakeJvmClient({ status }));
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  const [state, setState] = useState(initial);
  return (
    <QueryClientProvider client={queryClient}>
      <JvmProvider client={client} scope="story">
        <div className="h-[640px]">
          <ExpressionSurface state={state} onStateChange={setState} presets={[{ label: "Order cache", expression: "@com.example.orders.Inventory@cache().keySet()", language: "ognl" }]} />
        </div>
      </JvmProvider>
    </QueryClientProvider>
  );
}

const meta = {
  title: "JVM/ExpressionSurface",
  component: Demo,
  parameters: { layout: "fullscreen" },
  args: { status: { allowMutation: true }, initial: {} },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OgnlPreset: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^System properties/ }));
    await userEvent.click(await canvas.findByRole("checkbox", { name: "Allow running code in this JVM" }));
    await userEvent.click(canvas.getByRole("button", { name: "Run" }));
    await expect(await canvas.findByText("java.version")).toBeInTheDocument();
  },
};

export const GroovyScript: Story = {
  args: { initial: { language: "groovy", expression: "println 'Inspecting order'\norder.items.size()" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("checkbox", { name: "Allow running code in this JVM" }));
    await userEvent.click(canvas.getByRole("button", { name: "Run" }));
    await expect(await canvas.findByRole("region", { name: "Standard output" })).toHaveTextContent("Inspecting order ORD-1042");
  },
};

export const EvaluationError: Story = {
  args: { initial: { expression: "#root.throw" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("checkbox", { name: "Allow running code in this JVM" }));
    await userEvent.click(canvas.getByRole("button", { name: "Run" }));
    await expect(await canvas.findByText("Evaluation failed")).toBeInTheDocument();
  },
};

export const MutationsDisabled: Story = {
  args: { status: { allowMutation: false }, initial: { expression: "@java.lang.System@getProperties()" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(/Runtime changes are disabled/)).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Run" })).toBeDisabled();
  },
};
