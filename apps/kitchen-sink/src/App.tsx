import { DensityProvider, ThemeProvider } from "@flanksource/clicky-ui";
import { Sidebar } from "./Sidebar";
import { SwitchersDemo } from "./demos/SwitchersDemo";
import { ButtonDemo } from "./demos/ButtonDemo";
import { IconDemo } from "./demos/IconDemo";
import { BadgeDemo } from "./demos/BadgeDemo";
import { AvatarDemo } from "./demos/AvatarDemo";
import { ProgressBarDemo } from "./demos/ProgressBarDemo";
import { JsonViewDemo } from "./demos/JsonViewDemo";
import { AnsiHtmlDemo } from "./demos/AnsiHtmlDemo";
import { ClickyDemo } from "./demos/ClickyDemo";
import { LogViewerDemo } from "./demos/LogViewerDemo";
import { MarkdownDemo } from "./demos/MarkdownDemo";
import { FilterPillDemo } from "./demos/FilterPillDemo";
import { SortableHeaderDemo } from "./demos/SortableHeaderDemo";
import { TabButtonDemo } from "./demos/TabButtonDemo";
import { SectionDemo } from "./demos/SectionDemo";
import { SplitPaneDemo } from "./demos/SplitPaneDemo";
import { TreeDemo } from "./demos/TreeDemo";
import { TreeGroupHeaderDemo } from "./demos/TreeGroupHeaderDemo";
import { HoverCardDemo } from "./demos/HoverCardDemo";
import { ModalDemo } from "./demos/ModalDemo";
import { DiagnosticsDemo } from "./demos/DiagnosticsDemo";
import { HarPanelDemo } from "./demos/HarPanelDemo";

export function App() {
  return (
    <ThemeProvider>
      <DensityProvider>
        <div className="mx-auto flex max-w-6xl gap-density-6 p-density-4">
          <Sidebar />
          <main className="flex-1 min-w-0 space-y-density-6">
            <header className="space-y-density-2">
              <h1 className="text-2xl font-bold">Clicky UI — Kitchen Sink</h1>
              <p className="text-muted-foreground text-sm">
                Every exported component, one example per section. Preact-hosted via{" "}
                <code>preact/compat</code>.
              </p>
            </header>

            <SwitchersDemo />
            <ButtonDemo />
            <IconDemo />

            <BadgeDemo />
            <AvatarDemo />
            <ProgressBarDemo />
            <ClickyDemo />
            <JsonViewDemo />
            <AnsiHtmlDemo />
            <LogViewerDemo />
            <MarkdownDemo />

            <FilterPillDemo />
            <SortableHeaderDemo />
            <TabButtonDemo />

            <SectionDemo />
            <SplitPaneDemo />
            <TreeDemo />
            <TreeGroupHeaderDemo />

            <HoverCardDemo />
            <ModalDemo />

            <DiagnosticsDemo />
            <HarPanelDemo />
          </main>
        </div>
      </DensityProvider>
    </ThemeProvider>
  );
}
