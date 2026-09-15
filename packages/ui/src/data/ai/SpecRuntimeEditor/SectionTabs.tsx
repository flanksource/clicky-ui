import { useState, type ReactNode } from "react";
import { Tabs } from "../../../layout/Tabs";
import type { SpecRuntimeTab, SpecSectionMeta } from "./types";

// Groups the editor's visible sections behind a tab strip. Filtering already
// happened upstream, so a section tab whose sections were all dropped for the
// selected runtime is hidden rather than rendered empty.
export function SectionTabs({
  tabs,
  sections,
  activeTab,
  onActiveTabChange,
  renderSection,
}: {
  tabs: readonly SpecRuntimeTab[];
  sections: SpecSectionMeta[];
  activeTab?: string | undefined;
  onActiveTabChange?: ((id: string) => void) | undefined;
  renderSection: (section: SpecSectionMeta, options: { bare: boolean }) => ReactNode;
}) {
  assertTabs(tabs);
  const [selected, setSelected] = useState<string>();
  const panels = tabs
    .map((tab) => ({
      tab,
      sections: sections.filter((section) => tab.sections?.includes(section.id)),
    }))
    .filter((panel) => panel.tab.content !== undefined || panel.sections.length > 0);
  const requested = activeTab ?? selected;
  const current = panels.find((panel) => panel.tab.id === requested) ?? panels[0];
  if (!current) return null;

  return (
    <div className="grid grid-cols-1 gap-density-3">
      <Tabs
        tabs={panels.map(({ tab }) => ({
          id: tab.id,
          label: tab.label,
          ...(tab.icon ? { icon: tab.icon } : {}),
        }))}
        value={current.tab.id}
        onChange={(id) => {
          setSelected(id);
          onActiveTabChange?.(id);
        }}
        className="flex-wrap"
      />
      <div role="tabpanel" aria-label={current.tab.label}>
        {current.tab.content ??
          current.sections.map((section) =>
            renderSection(section, { bare: current.sections.length === 1 }),
          )}
      </div>
    </div>
  );
}

function assertTabs(tabs: readonly SpecRuntimeTab[]) {
  const seen = new Set<string>();
  for (const tab of tabs) {
    if (seen.has(tab.id)) {
      throw new Error(`SpecRuntimeEditor: duplicate tab id ${JSON.stringify(tab.id)}`);
    }
    seen.add(tab.id);
    if ((tab.sections === undefined) === (tab.content === undefined)) {
      throw new Error(
        `SpecRuntimeEditor: tab ${JSON.stringify(tab.id)} needs exactly one of sections or content`,
      );
    }
  }
}
