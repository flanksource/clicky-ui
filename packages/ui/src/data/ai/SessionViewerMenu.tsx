import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { Icon, type StaticIconComponent } from "../Icon";
import {
  UiCheck,
  UiDesktop,
  UiDotsVertical,
  UiListDashes,
  UiListFlat,
  UiMoon,
  UiResizeVertical,
  UiRows,
  UiSun,
} from "../../icons";
import { type Density } from "../../hooks/use-density";
import { CATEGORY_LABELS, type SessionCategory, type SessionFilters } from "./session-categories";

export type SessionThemeOverride = "light" | "dark";

interface SegmentedOption<T> {
  value: T | undefined;
  icon: StaticIconComponent;
  label: string;
}

const DENSITY_OPTIONS: Array<SegmentedOption<Density>> = [
  { value: undefined, icon: UiResizeVertical, label: "Use page density" },
  { value: "compact", icon: UiRows, label: "Compact" },
  { value: "comfortable", icon: UiListFlat, label: "Comfortable" },
  { value: "spacious", icon: UiListDashes, label: "Spacious" },
];

const THEME_OPTIONS: Array<SegmentedOption<SessionThemeOverride>> = [
  { value: undefined, icon: UiDesktop, label: "Use page theme" },
  { value: "light", icon: UiSun, label: "Light" },
  { value: "dark", icon: UiMoon, label: "Dark" },
];

export interface SessionViewerMenuProps {
  density: Density | undefined;
  onDensityChange: (density: Density | undefined) => void;
  theme: SessionThemeOverride | undefined;
  onThemeChange: (theme: SessionThemeOverride | undefined) => void;
  filters: SessionFilters;
  hiddenCategories: ReadonlySet<SessionCategory>;
  hiddenTools: ReadonlySet<string>;
  hiddenSources: ReadonlySet<string>;
  onToggleCategory: (category: SessionCategory) => void;
  onToggleTool: (tool: string) => void;
  onToggleSource: (source: string) => void;
  showThinking: boolean;
  onToggleThinking: () => void;
  hasThinking: boolean;
}

/** The SessionViewer's "3-dot" menu: density and theme overrides as one-line
 *  segmented icon rows, plus visibility toggles for the captain category /
 *  tool / source facets present in the session. */
export function SessionViewerMenu({
  density,
  onDensityChange,
  theme,
  onThemeChange,
  filters,
  hiddenCategories,
  hiddenTools,
  hiddenSources,
  onToggleCategory,
  onToggleTool,
  onToggleSource,
  showThinking,
  onToggleThinking,
  hasThinking,
}: SessionViewerMenuProps) {
  return (
    <DropdownMenu
      icon={UiDotsVertical}
      hideChevron
      variant="ghost"
      size="icon"
      align="right"
      title="Session options"
      menuLabel="Session options"
      menuClassName="min-w-[12rem] max-h-[70vh] overflow-auto px-1"
    >
      {() => (
        <div className="text-popover-foreground">
          <SegmentedRow
            label="Density"
            options={DENSITY_OPTIONS}
            value={density}
            onChange={onDensityChange}
          />
          <SegmentedRow
            label="Theme"
            options={THEME_OPTIONS}
            value={theme}
            onChange={onThemeChange}
          />

          {filters.categories.length > 0 && (
            <Section heading="Categories">
              {filters.categories.map((category) => (
                <CheckRow
                  key={category}
                  label={CATEGORY_LABELS[category]}
                  checked={!hiddenCategories.has(category)}
                  onToggle={() => onToggleCategory(category)}
                />
              ))}
            </Section>
          )}

          {filters.tools.length > 0 && (
            <Section heading="Tools">
              {filters.tools.map((tool) => (
                <CheckRow
                  key={tool.key}
                  label={tool.label}
                  checked={!hiddenTools.has(tool.key)}
                  onToggle={() => onToggleTool(tool.key)}
                />
              ))}
            </Section>
          )}

          {filters.sources.length > 1 && (
            <Section heading="Source">
              {filters.sources.map((source) => (
                <CheckRow
                  key={source}
                  label={source}
                  checked={!hiddenSources.has(source)}
                  onToggle={() => onToggleSource(source)}
                />
              ))}
            </Section>
          )}

          {hasThinking && (
            <Section>
              <CheckRow label="Reasoning" checked={showThinking} onToggle={onToggleThinking} />
            </Section>
          )}
        </div>
      )}
    </DropdownMenu>
  );
}

// One line per setting: a dim label on the left, a bordered segmented group of
// icon-only radio buttons on the right. Labels ride on aria-label/title so
// menuitemradio queries (and tooltips) still see "Compact", "Dark", etc.
function SegmentedRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<SegmentedOption<T>>;
  value: T | undefined;
  onChange: (value: T | undefined) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.label}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              aria-label={option.label}
              title={option.label}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded transition-colors focus:outline-none",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground focus:text-foreground",
              )}
            >
              <Icon icon={option.icon} className="text-xs" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Section({ heading, children }: { heading?: string; children: ReactNode }) {
  return (
    <div className="mt-1 border-t border-border pt-0.5">
      {heading && (
        <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">{heading}</div>
      )}
      {children}
    </div>
  );
}

const ROW_CLASS =
  "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none";

function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      className={cn(ROW_CLASS, !checked && "text-muted-foreground")}
      onClick={onToggle}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
        )}
      >
        {checked && <Icon icon={UiCheck} className="text-[0.6rem]" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}
