import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "./Icon";

const meta: Meta<typeof Icon> = {
  title: "Data/Icon",
  component: Icon,
  parameters: {
    docs: {
      description: {
        component:
          'Thin wrapper over the `iconify-icon` web component. Add `<script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script>` to your host HTML, or install `iconify-icon` as a runtime dep.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Check: Story = {
  args: { name: "codicon:check", className: "text-green-600 text-xl" },
};
export const Error: Story = { args: { name: "codicon:error", className: "text-red-600 text-xl" } };
export const Spinner: Story = {
  args: { name: "svg-spinners:ring-resize", className: "text-blue-500 text-2xl" },
};
