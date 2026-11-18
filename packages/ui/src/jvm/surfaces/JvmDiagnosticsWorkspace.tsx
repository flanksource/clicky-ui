import type { ReactNode } from "react";
import type { StaticIconComponent } from "../../data/Icon";
import { Tabs } from "../../layout/Tabs";
import { cn } from "../../lib/utils";

export type JvmDiagnosticsSection = {
  id: string;
  label: string;
  icon?: StaticIconComponent;
  /** Rendered only while the section is active, so its queries stop when it is hidden. */
  render: () => ReactNode;
};

export type JvmDiagnosticsWorkspaceProps = {
  sections: JvmDiagnosticsSection[];
  /** Active section id; unknown ids fall back to the first section. */
  active: string;
  onActiveChange: (id: string) => void;
  /** Above the tabs, e.g. a title and `JvmStatusBar`. */
  header?: ReactNode;
  className?: string;
};

/**
 * The full diagnostics screen for one JVM: a header, one tab per section and
 * the active section filling the remaining height. Sections are host-supplied,
 * so an app picks the built-in surfaces it supports and adds its own.
 */
export function JvmDiagnosticsWorkspace({ sections, active, onActiveChange, header, className }: JvmDiagnosticsWorkspaceProps) {
  if (sections.length === 0) throw new Error("JvmDiagnosticsWorkspace needs at least one section");
  const current = sections.find((section) => section.id === active) ?? sections[0]!;
  return (
    <div className={cn("flex h-full min-h-0 min-w-0 flex-col gap-2", className)}>
      {header}
      <Tabs
        tabs={sections.map(({ id, label, icon }) => ({ id, label, ...(icon ? { icon } : {}) }))}
        value={current.id}
        onChange={onActiveChange}
      />
      <div role="tabpanel" aria-label={current.label} className="min-h-0 flex-1">
        {current.render()}
      </div>
    </div>
  );
}
