import { useState } from "react";
import {
  Button,
  DropdownMenu,
  UiCopy,
  UiDownload,
  UiEdit,
  UiJson,
  UiMarkdown,
  UiMenu,
} from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

export function DropdownMenuDemo() {
  const [last, setLast] = useState<string>("—");
  return (
    <DemoSection
      id="dropdown-menu"
      title="DropdownMenu"
      description="Click-triggered menu with outside-click and Escape to close. Declarative items, a custom trigger, or a children render-prop."
    >
      <DemoRow label="Items">
        <DropdownMenu
          label="Download"
          icon={UiDownload}
          items={[
            { label: "JSON", icon: UiJson, onSelect: () => setLast("Download JSON") },
            { label: "Markdown", icon: UiMarkdown, onSelect: () => setLast("Download Markdown") },
          ]}
        />
      </DemoRow>
      <DemoRow label="Align left">
        <DropdownMenu
          label="Actions"
          align="left"
          items={[
            { label: "Rename", icon: UiEdit, onSelect: () => setLast("Rename") },
            { label: "Duplicate", icon: UiCopy, onSelect: () => setLast("Duplicate") },
            { label: "Delete", onSelect: () => setLast("Delete"), disabled: true },
          ]}
        />
      </DemoRow>
      <DemoRow label="Custom trigger">
        <DropdownMenu
          trigger={
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <UiMenu />
            </Button>
          }
          items={[
            { label: "Profile", onSelect: () => setLast("Profile") },
            { label: "Settings", onSelect: () => setLast("Settings") },
          ]}
        />
      </DemoRow>
      <DemoRow label="Custom content">
        <DropdownMenu label="Filters">
          {(close) => (
            <div className="px-3 py-2 text-xs">
              <p className="mb-2 text-muted-foreground">Custom content goes here.</p>
              <Button
                size="sm"
                onClick={() => {
                  setLast("Apply filters");
                  close();
                }}
              >
                Apply
              </Button>
            </div>
          )}
        </DropdownMenu>
      </DemoRow>
      <p className="text-xs text-muted-foreground">
        Last action: <span className="font-mono">{last}</span>
      </p>
    </DemoSection>
  );
}
