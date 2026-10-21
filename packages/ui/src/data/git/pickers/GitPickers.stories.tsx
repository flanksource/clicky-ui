import type { Meta, StoryObj } from "@storybook/react-vite";
import { GitPickersDemo } from "./GitPickersDemo";

const meta = { title: "Data/GitPickers", component: GitPickersDemo, parameters: { layout: "padded" } } satisfies Meta<typeof GitPickersDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Controlled: Story = {};
export const Compact: Story = { globals: { viewport: { value: "mobile1" } } };
