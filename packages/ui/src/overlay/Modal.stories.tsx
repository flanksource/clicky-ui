import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Modal } from "./Modal";

const meta: Meta<typeof Modal> = {
  title: "Overlay/Modal",
  component: Modal,
  args: {
    open: true,
    title: "Confirm action",
    size: "md",
    closeOnBackdrop: true,
    closeOnEsc: true,
    hideClose: false,
    expandable: true,
    onClose: () => undefined,
    children: <p className="text-sm">Are you sure you want to proceed?</p>,
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Width/height preset for the dialog panel.",
      table: { category: "Layout", defaultValue: { summary: "md" } },
    },
    title: { control: "text", table: { category: "Layout" } },
    open: {
      control: "boolean",
      description: "Controls whether the modal is mounted.",
      table: { category: "State" },
    },
    closeOnBackdrop: {
      control: "boolean",
      description: "Close when the backdrop is clicked.",
      table: { category: "Behavior", defaultValue: { summary: "true" } },
    },
    closeOnEsc: {
      control: "boolean",
      description: "Close when Escape is pressed.",
      table: { category: "Behavior", defaultValue: { summary: "true" } },
    },
    hideClose: {
      control: "boolean",
      description: "Hide the header close button.",
      table: { category: "Behavior" },
    },
    expandable: {
      control: "boolean",
      description: "Show the expand/restore-to-fullscreen button.",
      table: { category: "Behavior", defaultValue: { summary: "true" } },
    },
    onClose: { control: false, table: { category: "Events" } },
    children: { control: false, table: { category: "Content" } },
    footer: { control: false, table: { category: "Content" } },
    headerSlot: { control: false, table: { category: "Content" } },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Centered modal overlay with an optional header, footer, backdrop/Escape closing, focus restoration, and built-in expand-to-fullscreen behavior.",
          "",
          "**When to use**",
          "- Confirmations, short forms, and row-detail panels that should trap focus.",
          '- Prefer `size="sm"` for confirmations and `lg`/`xl` for detail content; users can expand to fullscreen when `expandable` is on.',
          "",
          "**Behavior**",
          "- Closes on backdrop click (`closeOnBackdrop`) and Escape (`closeOnEsc`), both on by default.",
          "- Restores focus to the previously-focused element on close.",
          "- When `title` is a string it becomes the dialog's accessible label.",
          "",
          "**Usage**",
          "```tsx",
          "const [open, setOpen] = useState(false);",
          '<Modal open={open} onClose={() => setOpen(false)} title="Delete item" size="sm"',
          "  footer={<button onClick={() => setOpen(false)}>Cancel</button>}>",
          "  <p>This action cannot be undone.</p>",
          "</Modal>",
          "```",
          "",
          "The **Playground** story renders the modal open inline so the controls drive it directly; the other stories show the trigger-button pattern you'll use in real apps.",
        ].join("\n"),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The modal is rendered open inside the story canvas so every prop in the controls panel takes effect immediately. Toggle `expandable`, `hideClose`, and `size` to see the header and panel respond.",
      },
    },
  },
  render: (args) => (
    <Modal {...args}>
      {args.children ?? (
        <p className="text-sm">Are you sure you want to proceed?</p>
      )}
    </Modal>
  ),
};

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground"
          onClick={() => setOpen(true)}
        >
          Open modal
        </button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm action"
        >
          <p className="text-sm">Are you sure you want to proceed?</p>
        </Modal>
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground"
          onClick={() => setOpen(true)}
        >
          Open modal with footer
        </button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Delete item"
          size="sm"
          footer={
            <div className="flex justify-end gap-density-2">
              <button
                className="px-3 py-1 text-sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 text-sm rounded bg-red-500 text-white"
                onClick={() => setOpen(false)}
              >
                Delete
              </button>
            </div>
          }
        >
          <p className="text-sm">This action cannot be undone.</p>
        </Modal>
      </>
    );
  },
};

export const Expandable: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground"
          onClick={() => setOpen(true)}
        >
          Open expandable modal
        </button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Row detail"
          size="lg"
        >
          <p className="text-sm">
            Use the expand icon in the header to toggle between the configured
            size and fullscreen.
          </p>
        </Modal>
      </>
    );
  },
};
