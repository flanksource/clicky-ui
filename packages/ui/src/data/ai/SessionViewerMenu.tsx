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

const DENSITY_OPTIONS: Array<{ value: Density; icon: StaticIconComponent; label: string }> = [
  { value: "compact", icon: UiRows, label: "Compact" },
  { value: "comfortable", icon: UiListFlat, label: "Comfortable" },
  { value: "spacious", icon: UiListDashes, label: "Spacious" },
];

const THEME_OPTIONS: Array<{ value: SessionThemeOverride; icon: StaticIconComponent; label: string }> = [
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

/** The SessionViewer's "3-dot" menu: a density override (matching DataTable's
 *  pattern) plus visibility toggles for the captain category / tool / source
 *  facets present in the session. */
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
      menuClassName="min-w-[14rem] max-h-[70vh] overflow-auto px-1"
    >
      {() => (
        <div className="text-popover-foreground">
          <MenuHeading>Density</MenuHeading>
          <RadioRow
            icon={UiResizeVertical}
            label="Use page density"
            active={density === undefined}
            onSelect={() => onDensityChange(undefined)}
          />
          {DENSITY_OPTIONS.map((option) => (
            <RadioRow
              key={option.value}
              icon={option.icon}
              label={option.label}
              active={density === option.value}
              onSelect={() => onDensityChange(option.value)}
            />
          ))}

          <Section heading="Theme">
            <RadioRow
              icon={UiDesktop}
              label="Use page theme"
              active={theme === undefined}
              onSelect={() => onThemeChange(undefined)}
            />
            {THEME_OPTIONS.map((option) => (
              <RadioRow
                key={option.value}
                icon={option.icon}
                label={option.label}
                active={theme === option.value}
                onSelect={() => onThemeChange(option.value)}
              />
            ))}
          </Section>

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
            <Section heading="Other">
              <CheckRow label="Reasoning" checked={showThinking} onToggle={onToggleThinking} />
            </Section>
          )}
        </div>
      )}
    </DropdownMenu>
  );
}

function MenuHeading({ children }: { children: ReactNode }) {
  return <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{children}</div>;
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="mt-1 border-t border-border pt-1">
      <MenuHeading>{heading}</MenuHeading>
      {children}
    </div>
  );
}

const ROW_CLASS =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:outline-none";

function RadioRow({
  icon,
  label,
  active,
  onSelect,
}: {
  icon: StaticIconComponent;
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      className={cn(ROW_CLASS, active && "text-foreground")}
      onClick={onSelect}
    >
      <Icon icon={icon} className="text-sm text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {active ? (
        <Icon icon={UiCheck} className="text-sm text-foreground" />
      ) : (
        <span className="inline-block h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

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
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
        )}
      >
        {checked && <Icon icon={UiCheck} className="text-[0.7rem]" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}
