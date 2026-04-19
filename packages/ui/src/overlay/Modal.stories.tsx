import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Modal } from "./Modal";

const meta: Meta<typeof Modal> = {
  title: "Overlay/Modal",
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

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
        <Modal open={open} onClose={() => setOpen(false)} title="Confirm action">
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
              <button className="px-3 py-1 text-sm" onClick={() => setOpen(false)}>
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
