import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CompileDiagnosticsList } from "./CompileDiagnosticsList";

const meta = {
  title: "JVM/CompileDiagnosticsList",
  component: CompileDiagnosticsList,
  decorators: [(Story) => <div className="w-[640px] border border-border"><Story /></div>],
} satisfies Meta<typeof CompileDiagnosticsList>;

export default meta;
type Story = StoryObj<typeof meta>;

const ERROR = { kind: "ERROR", line: 17, column: 9, message: "incompatible types: java.lang.String cannot be converted to double" };
const WARNING = { kind: "WARNING", line: 1, column: 1, message: "[deprecation] Order.load(String) in Order has been deprecated" };

export const CompilesCleanly: Story = { args: { compilation: { success: true, diagnostics: [] } } };

export const CompilesWithWarnings: Story = { args: { compilation: { success: true, diagnostics: [WARNING] } } };

export const Failed: Story = {
  args: { compilation: { success: false, diagnostics: [ERROR, WARNING, { ...ERROR, line: 21, message: "cannot find symbol: variable totl" }] }, onSelectDiagnostic: fn() },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /17:9/ }));
    await expect(args.onSelectDiagnostic).toHaveBeenCalledWith(ERROR);
  },
};

export const FailedWithoutDiagnostics: Story = { args: { compilation: { success: false, diagnostics: [] } } };

export const Applied: Story = {
  args: { compilation: { success: true, applied: true, diagnostics: [WARNING] }, appliedMessage: "Patch applied. The original bytecode is restored in 15 minutes." },
};
