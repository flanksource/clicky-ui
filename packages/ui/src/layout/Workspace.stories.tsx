import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  UiFileCode,
  UiFolder,
  UiListTree,
  UiSigma,
  UiStack,
  UiTerminal,
} from "../icons";
import { Workspace, type WorkspacePaneSpec } from "./Workspace";

const meta: Meta<typeof Workspace> = {
  title: "Layout/Workspace",
  component: Workspace,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "VS Code-style workspace with labeled, collapsible, and resizable panes in left, center, right, and center-aligned bottom locations.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Workspace>;

function Content({ children }: { children: string }) {
  return (
    <div className="h-full bg-background p-density-3 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

const panes: WorkspacePaneSpec[] = [
  {
    id: "explorer",
    label: "Explorer",
    icon: <UiFolder />,
    location: "left",
    width: 280,
    content: <Content>Files and folders</Content>,
  },
  {
    id: "outline",
    label: "Outline",
    icon: <UiListTree />,
    location: "left",
    width: 280,
    height: 180,
    content: <Content>Document symbols</Content>,
  },
  {
    id: "editor",
    label: "Editor",
    icon: <UiFileCode />,
    location: "center",
    content: <Content>Primary editor surface</Content>,
  },
  {
    id: "variables",
    label: "Variables",
    icon: <UiSigma />,
    location: "right",
    width: 320,
    content: <Content>Local variables</Content>,
  },
  {
    id: "watch",
    label: "Watch",
    icon: <UiStack />,
    location: "right",
    width: 320,
    height: 160,
    content: <Content>Watch expressions</Content>,
  },
  {
    id: "terminal",
    label: "Terminal",
    icon: <UiTerminal />,
    location: "bottom",
    height: 220,
    content: <Content>Terminal output</Content>,
  },
];

export const IdeLayout: Story = {
  render: () => (
    <div className="h-[640px]">
      <Workspace
        panes={panes}
        storageKey="workspace-story"
        slots={{
          topRightActions: (
            <button type="button" className="px-1 text-xs">
              Layout
            </button>
          ),
        }}
      />
    </div>
  ),
};

export const FixedExplorer: Story = {
  render: () => (
    <div className="h-[520px]">
      <Workspace
        panes={panes.map((pane) =>
          pane.id === "explorer"
            ? { ...pane, collapsible: false, resizable: false }
            : pane,
        )}
      />
    </div>
  ),
};
