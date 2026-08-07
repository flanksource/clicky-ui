import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ErrorWrapper } from "./ErrorWrapper";

const STORY_ERROR = new Error("The dashboard request failed with HTTP 502", {
  cause: "upstream service unavailable",
});
STORY_ERROR.stack = [
  "Error: The dashboard request failed with HTTP 502",
  "    at loadDashboard (src/pages/Dashboard.tsx:84:15)",
  "    at Dashboard (src/pages/Dashboard.tsx:27:3)",
].join("\n");

function BrokenDashboard(): never {
  throw STORY_ERROR;
}

function mockClipboard(writeText: (text: string) => Promise<void>): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  return () => {
    if (descriptor) {
      Object.defineProperty(navigator, "clipboard", descriptor);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  };
}

const meta = {
  title: "Components/ErrorWrapper",
  component: ErrorWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Full-page React error boundary with normalized diagnostics and a support-ready copy action.",
      },
    },
  },
  argTypes: {
    children: { control: false },
    onError: { control: false },
  },
} satisfies Meta<typeof ErrorWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ErrorWrapper>
      <BrokenDashboard />
    </ErrorWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toBeInTheDocument();
    await expect(
      canvas.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
  },
};

export const CopySuccess: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const restoreClipboard = mockClipboard(() => Promise.resolve());
    try {
      await userEvent.click(
        canvas.getByRole("button", { name: "Copy error details" }),
      );
      await expect(
        canvas.getByRole("button", { name: "Copied" }),
      ).toBeInTheDocument();
      await expect(
        canvas.getByText("Error details copied to clipboard."),
      ).toBeInTheDocument();
    } finally {
      restoreClipboard();
    }
  },
};

export const ClipboardFailure: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const restoreClipboard = mockClipboard(() =>
      Promise.reject(new Error("Clipboard access denied")),
    );
    try {
      await userEvent.click(
        canvas.getByRole("button", { name: "Copy error details" }),
      );
      await expect(
        canvas.getByText(
          "Clipboard access failed. Expand the error details to copy individual values.",
        ),
      ).toBeInTheDocument();
    } finally {
      restoreClipboard();
    }
  },
};
