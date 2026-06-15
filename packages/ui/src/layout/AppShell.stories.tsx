import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AppShell } from "./AppShell";
import { Tabs } from "./Tabs";
import { Panel } from "./Panel";
import { Button } from "../components/button";

const meta: Meta<typeof AppShell> = {
  title: "Layout/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Top-bar application shell: a sticky header with brand, nav, a centered search slot and a right-aligned actions cluster, plus an optional toolbar row. The content area fills the remaining height and scrolls independently. Counterpart to the sidebar-oriented AppLayout.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {
  render: () => {
    const [tab, setTab] = useState("prs");
    return (
      <div className="h-[480px]">
        <AppShell
          brand={
            <>
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-bold">
                g
              </span>
              <span className="font-bold tracking-tight">gavel</span>
            </>
          }
          nav={
            <Tabs
              tabs={[
                { id: "prs", label: "Pull requests" },
                { id: "activity", label: "Activity" },
              ]}
              value={tab}
              onChange={setTab}
            />
          }
          search={
            <input
              aria-label="search"
              placeholder="Search…"
              className="w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none"
            />
          }
          actions={
            <>
              <Button variant="ghost" size="sm">
                Light/Dark
              </Button>
              <Button size="sm">New</Button>
            </>
          }
          toolbar={
            <>
              <span className="text-sm text-muted-foreground">Filters go here</span>
              <div className="flex-1" />
              <Button variant="outline" size="sm">
                Export
              </Button>
            </>
          }
        >
          <div className="h-full overflow-y-auto p-density-4">
            <Panel title="Content" count={2}>
              <p className="text-sm">The routed content area scrolls here.</p>
            </Panel>
          </div>
        </AppShell>
      </div>
    );
  },
};

export const NoToolbar: Story = {
  render: () => (
    <div className="h-[320px]">
      <AppShell
        brand={<span className="font-bold">gavel</span>}
        actions={<Button size="sm">Action</Button>}
      >
        <div className="p-density-4 text-sm text-muted-foreground">No toolbar row.</div>
      </AppShell>
    </div>
  ),
};
