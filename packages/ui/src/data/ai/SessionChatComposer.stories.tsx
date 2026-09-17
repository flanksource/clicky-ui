import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  SessionChatComposer,
  type SessionChatCapabilities,
} from "./SessionChatComposer";
import type { SpecPermissionMode } from "./SpecRuntimeEditor.model";

const CAPABILITIES: SessionChatCapabilities = {
  interrupt: true,
  steer: false,
  followUp: true,
  resume: true,
  setPermissionMode: true,
};

const PERMISSION_MODES: SpecPermissionMode[] = ["default", "acceptEdits", "plan", "auto"];

function InteractivePickerStory() {
  const [permissionMode, setPermissionMode] =
    useState<SpecPermissionMode>("default");
  return (
    <div className="max-w-xl space-y-2">
      <p className="text-xs text-muted-foreground">
        Current mode:{" "}
        <span className="font-mono" data-testid="current-mode">
          {permissionMode}
        </span>
      </p>
      <SessionChatComposer
        status="idle"
        capabilities={CAPABILITIES}
        onSubmit={fn()}
        permissionMode={permissionMode}
        permissionModes={PERMISSION_MODES}
        onPermissionModeChange={setPermissionMode}
      />
    </div>
  );
}

const meta = {
  title: "AI/SessionChatComposer",
  component: SessionChatComposer,
  tags: ["autodocs"],
  args: {
    status: "idle",
    capabilities: CAPABILITIES,
    onSubmit: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "The follow-up composer shown under a session transcript. When the host supplies `permissionMode`/`permissionModes`, it renders a compact permission-mode picker in the prompt toolbar, ahead of any host-supplied toolbar content.",
      },
    },
  },
} satisfies Meta<typeof SessionChatComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPermissionModePicker: Story = {
  render: () => <InteractivePickerStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const picker = canvas.getByRole("combobox", { name: "Permission mode" });
    await expect(picker).toHaveValue("default");
    await userEvent.selectOptions(picker, "auto");
    await expect(picker).toHaveValue("auto");
    await expect(canvas.getByTestId("current-mode")).toHaveTextContent("auto");
  },
};

export const ReadOnlyPicker: Story = {
  args: {
    permissionMode: "acceptEdits",
    permissionModes: PERMISSION_MODES,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const picker = canvas.getByRole("combobox", { name: "Permission mode" });
    await expect(picker).toBeDisabled();
    await expect(picker).toHaveValue("acceptEdits");
  },
};

export const PickerAlongsideHostToolbar: Story = {
  args: {
    permissionMode: "plan",
    permissionModes: PERMISSION_MODES,
    onPermissionModeChange: fn(),
    toolbar: (
      <span className="text-xs text-muted-foreground">Claude Sonnet</span>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("combobox", { name: "Permission mode" }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Claude Sonnet")).toBeInTheDocument();
  },
};
