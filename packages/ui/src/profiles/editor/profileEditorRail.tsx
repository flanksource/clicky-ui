import { useState, type ReactNode } from "react";
import {
  UiBraces,
  UiChevronDown,
  UiChevronRight,
  UiColumns,
  UiDatabaseZap,
  UiFileCode,
  UiFunnelData,
  UiSliders,
} from "../../icons";
import {
  profileEditorSections,
  type ProfileEditorSection,
  type ProfileSectionStatus,
} from "./profileEditorModel";

const collectionSections = new Set<ProfileEditorSection>([
  "columns",
  "parameters",
  "processors",
]);

export type ProfileEditorRailCollections = Partial<
  Record<ProfileEditorSection, ReactNode>
>;

/** Section navigation whose collection sections can reveal their item lists. */
export function ProfileEditorRail({
  value,
  status,
  collections = {},
  onChange,
}: {
  value: ProfileEditorSection;
  status: Record<ProfileEditorSection, ProfileSectionStatus>;
  collections?: ProfileEditorRailCollections;
  onChange: (section: ProfileEditorSection) => void;
}) {
  const [expanded, setExpanded] = useState<Set<ProfileEditorSection>>(
    () => new Set(),
  );

  return (
    <nav className="w-full overflow-auto p-1.5" aria-label="Profile sections">
      {profileEditorSections.map((section) => {
        const active = section.id === value;
        const collection = collectionSections.has(section.id);
        const open = collection && expanded.has(section.id);
        const { badge, attention } = status[section.id];
        return (
          <div key={section.id}>
            <button
              type="button"
              aria-current={active ? "page" : undefined}
              aria-expanded={collection ? open : undefined}
              className={`flex w-full items-center gap-1.5 rounded-md px-1.5 py-1.5 text-left transition-colors ${
                active ? "bg-muted/80 text-foreground" : "hover:bg-muted/50"
              }`}
              onClick={() => {
                onChange(section.id);
                if (!collection) return;
                setExpanded((current) => {
                  const next = new Set(current);
                  if (next.has(section.id)) next.delete(section.id);
                  else next.add(section.id);
                  return next;
                });
              }}
            >
              <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                {collection ? (
                  open ? (
                    <UiChevronDown aria-hidden="true" className="size-3.5" />
                  ) : (
                    <UiChevronRight aria-hidden="true" className="size-3.5" />
                  )
                ) : null}
              </span>
              <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
                {iconForSection(section.id)}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-sm ${
                    active
                      ? "font-medium text-foreground"
                      : "text-foreground/80"
                  }`}
                >
                  {section.label}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {section.hint}
                </span>
              </span>
              {attention ? (
                <span
                  className="size-1.5 shrink-0 rounded-full bg-warning"
                  title="Needs attention"
                />
              ) : null}
              {badge ? (
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {badge}
                </span>
              ) : null}
            </button>
            {open && collections[section.id] ? (
              <div
                data-profile-tree-group={section.id}
                className="relative ml-3.5 border-l border-border/80 pb-1 pl-4 pt-1 [&_[data-profile-tree-item]]:before:absolute [&_[data-profile-tree-item]]:before:-left-4 [&_[data-profile-tree-item]]:before:top-1/2 [&_[data-profile-tree-item]]:before:h-px [&_[data-profile-tree-item]]:before:w-4 [&_[data-profile-tree-item]]:before:bg-border [&_[data-profile-tree-item]]:before:content-['']"
              >
                {collections[section.id]}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

function iconForSection(section: ProfileEditorSection): ReactNode {
  switch (section) {
    case "general":
      return <UiSliders className="size-4" />;
    case "source":
      return <UiDatabaseZap className="size-4" />;
    case "columns":
      return <UiColumns className="size-4" />;
    case "parameters":
      return <UiBraces className="size-4" />;
    case "processors":
      return <UiFunnelData className="size-4" />;
    case "raw":
      return <UiFileCode className="size-4" />;
  }
}
