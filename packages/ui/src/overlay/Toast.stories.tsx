import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ToastProvider } from "./Toast";
import { useToast } from "./toast-context";
import { Button } from "../components/button";

const meta = {
  title: "Overlay/Toast",
  component: ToastProvider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Imperative toast notifications (the Gavel `PRDetail` confirmation toast). Wrap a subtree in `<ToastProvider>` and call `useToast().toast(...)`. Auto-dismisses.",
      },
    },
  },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function Triggers() {
  const { toast } = useToast();
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Button variant="secondary" onClick={() => toast("Comment posted")}>
        Neutral
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast({ message: "Approved — review submitted", tone: "success" })}
      >
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast({ message: "Cannot merge — resolve blockers first", tone: "danger" })}
      >
        Danger
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast({ message: "Merge queued", tone: "info", durationMs: 0 })}
      >
        Sticky (manual dismiss)
      </Button>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Triggers />
    </ToastProvider>
  ),
};

export const AppearsAndAutoDismisses: Story = {
  render: () => (
    <ToastProvider durationMs={800}>
      <Triggers />
    </ToastProvider>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("clicking a trigger shows a toast", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Success" }));
      // Toast renders in a portal on document.body, not inside canvasElement.
      await waitFor(() =>
        expect(within(document.body).getByText("Approved — review submitted")).toBeInTheDocument(),
      );
    });

    await step("toast auto-dismisses after its duration", async () => {
      await waitFor(
        () =>
          expect(within(document.body).queryByText("Approved — review submitted")).not.toBeInTheDocument(),
        { timeout: 3000 },
      );
    });
  },
};
