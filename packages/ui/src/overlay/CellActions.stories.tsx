import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { UiChatDots, UiSparkles } from "../icons";
import { CellActionButton, CellActions } from "./CellActions";

const meta: Meta<typeof CellActions> = {
  title: "Overlay/CellActions",
  component: CellActions,
  parameters: {
    docs: {
      description: {
        component:
          "Muted inline actions paired with an accessible right-click menu on the owning cell.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CellActions>;

export const InlineAndContextMenu: Story = {
  render: () => {
    const [cell, setCell] = useState<HTMLDivElement | null>(null);
    const onComment = fn();
    const onAskAI = fn();
    return (
      <div
        ref={setCell}
        tabIndex={0}
        className="inline-flex items-center rounded border border-border px-3 py-2 text-sm"
      >
        Revenue 120
        <CellActions
          contextTarget={cell}
          menuLabel="Cell actions"
          menuItems={[
            { label: "Add comment", icon: UiChatDots, onSelect: onComment },
            { label: "Ask AI", icon: UiSparkles, onSelect: onAskAI },
          ]}
        >
          <CellActionButton label="Ask AI" icon={UiSparkles} onSelect={onAskAI} />
          <CellActionButton label="Add comment" icon={UiChatDots} onSelect={onComment} />
        </CellActions>
      </div>
    );
  },
};

export const ExistingCommentBadge: Story = {
  render: () => {
    const [cell, setCell] = useState<HTMLDivElement | null>(null);
    return (
      <div
        ref={setCell}
        tabIndex={0}
        className="inline-flex items-center rounded border border-border px-3 py-2 text-sm"
      >
        Cash 100
        <CellActions
          contextTarget={cell}
          menuLabel="Cell actions"
          menuItems={[
            { label: "Open 2 comments", icon: UiChatDots, onSelect: fn() },
            { label: "Ask AI", icon: UiSparkles, onSelect: fn() },
          ]}
        >
          <CellActionButton label="Ask AI" icon={UiSparkles} onSelect={fn()} />
          <button
            type="button"
            aria-label="2 comments"
            className="inline-flex h-5 items-center gap-1 rounded-full bg-primary/10 px-1.5 text-[9px] font-medium text-primary/70"
          >
            <span className="size-1.5 rounded-full bg-blue-500" />2
          </button>
        </CellActions>
      </div>
    );
  },
};
