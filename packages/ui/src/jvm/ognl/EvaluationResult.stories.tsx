import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { EVALUATION_GRAPH } from "../fixtures/classes";
import { EvaluationResult } from "./EvaluationResult";

const meta = {
  title: "JVM/EvaluationResult",
  component: EvaluationResult,
  decorators: [
    (Story) => (
      <div className="max-w-3xl p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EvaluationResult>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const ObjectGraphResult: Story = {
  args: { evaluation: { value: { id: "ORD-1042", total: 129.5 }, graph: EVALUATION_GRAPH, elapsedMs: 12 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("@com.example.orders.model.Order")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("radio", { name: "Raw" }));
    await expect(canvas.getByRole("region", { name: "Raw result" })).toHaveTextContent("ORD-1042");
  },
};

export const PlainValue: Story = {
  args: { evaluation: { value: { "java.version": "21.0.5", "os.name": "Linux", "user.timezone": "UTC" } } },
};

export const GroovyWithOutput: Story = {
  args: {
    evaluation: { value: 7, graph: EVALUATION_GRAPH, stdout: "Inspecting order ORD-1042\n3 line items\n", stderr: "WARNING: slow query (480 ms)\n", elapsedMs: 1840 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", { name: "Standard output" })).toHaveTextContent("3 line items");
    await expect(canvas.getByRole("region", { name: "Standard error" })).toHaveTextContent("slow query");
    await expect(canvas.getByText("1.8 s")).toBeInTheDocument();
  },
};

export const NoValue: Story = {
  args: { evaluation: { stdout: "done\n", elapsedMs: 3 } },
};

export const Running: Story = {
  args: { pending: true },
};

export const Failed: Story = {
  args: { error: new Error('ognl.OgnlException: source is null for getProperty(null, "throw")') },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Evaluation failed")).toBeInTheDocument();
  },
};

export const UnreadableGraph: Story = {
  args: { evaluation: { graph: { label: "missing id" } } },
};
