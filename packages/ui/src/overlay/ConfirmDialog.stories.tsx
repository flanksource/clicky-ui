import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../components/button";
import { ConfirmDialog } from "./ConfirmDialog";
import { useConfirm, useConfirmMemory } from "./useConfirm";

const REMEMBER_KEY = "storybook:run-against-staging";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Overlay/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    open: true,
    title: "Run against staging?",
    message: "Evaluates the expression once per sample (5 runs).",
    warning: "Custom SQL functions may change data or consume a generated value.",
    confirmLabel: "Run",
    cancelLabel: "Cancel",
    variant: "default",
    remember: { key: REMEMBER_KEY, label: "Remember my choice for staging" },
    onConfirm: () => undefined,
    onCancel: () => undefined,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "destructive"],
      table: { category: "Layout", defaultValue: { summary: "default" } },
    },
    onConfirm: { control: false, table: { category: "Events" } },
    onCancel: { control: false, table: { category: "Events" } },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "A small `Modal` asking the user to confirm an action, with an optional warning banner and an optional **Remember my choice** checkbox.",
          "",
          "**Behavior**",
          "- Escape and the close button cancel.",
          "- Only a confirmation is remembered (localStorage key `clicky-ui:confirm:<remember.key>`); a cancel never is.",
          "- Where localStorage is unavailable the checkbox is hidden and the prompt always shows.",
          "",
          "**Usage**",
          "```tsx",
          "const { confirm, dialog } = useConfirm();",
          "const { remembered, forget } = useConfirmMemory(key);",
          "if (await confirm({ title: 'Run?', warning: '…', remember: { key } })) run();",
          "return <>{remembered && <button onClick={forget}>Ask again</button>}{dialog}</>;",
          "```",
        ].join("\n"),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Playground: Story = {};

export const PromiseHook: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`useConfirm` returns a promise-based `confirm` and the dialog to render. Once the choice is remembered the promise resolves without a prompt, and `useConfirmMemory` drives the banner that offers to ask again.",
      },
    },
  },
  render: () => {
    const { confirm, dialog } = useConfirm();
    const { remembered, forget } = useConfirmMemory(REMEMBER_KEY);
    const [runs, setRuns] = useState(0);
    return (
      <div className="space-y-3">
        {remembered ? (
          <p className="text-sm">
            Runs skip confirmation.{" "}
            <button type="button" className="underline" onClick={forget}>
              Ask again
            </button>
          </p>
        ) : null}
        <Button
          onClick={async () => {
            const confirmed = await confirm({
              title: "Run against staging?",
              warning: "Custom SQL functions may change data or consume a generated value.",
              confirmLabel: "Run",
              remember: { key: REMEMBER_KEY, label: "Remember my choice for staging" },
            });
            if (confirmed) setRuns((count) => count + 1);
          }}
        >
          Run
        </Button>
        <p className="text-sm text-muted-foreground">Runs: {runs}</p>
        {dialog}
      </div>
    );
  },
};
