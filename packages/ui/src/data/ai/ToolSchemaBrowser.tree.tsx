import {
  ListMenu,
  ListMenuHeader,
  ListMenuItem,
  ListMenuSection,
} from "../../components/ListMenu";
import { cn } from "../../lib/utils";
import {
  UiEye,
  UiGlobe,
  UiRepeat,
  UiWarningTriangle,
  UiWrench,
} from "../../icons";
import { Icon } from "../Icon";
import type { PermissionRule } from "../chat/tool-policy";
import type { ToolMeta, ToolPolicy } from "../chat/types";
import { ToolDirectoryHeader } from "./ToolSchemaBrowser.directory-header";
import {
  directoryPermissionRule,
  directoryPolicyToggle,
  type ToolSchemaViewMode,
  type ToolSection,
} from "./ToolSchemaBrowser.model";
import { nextMode } from "./ToolPreferences.model";
import { ModeBadge } from "./ToolPreferencesList";

export type ToolPolicyTreeProps = {
  sections: ToolSection[];
  view: ToolSchemaViewMode;
  value: Record<string, ToolPolicy> | undefined;
  /** Enables click-to-toggle on tools and directories. */
  onRule?: ((rule: PermissionRule) => void) | undefined;
  isOpen: (key: string) => boolean;
  onToggle: (key: string) => void;
  activeName?: string | undefined;
  /** Row clicks select a tool; without it rows only show their policy. */
  onSelect?: ((name: string) => void) | undefined;
  emptyLabel?: string | undefined;
  className?: string | undefined;
};

/** Directory tree of tools where every badge is a click-to-toggle policy. */
export function ToolPolicyTree({
  sections,
  view,
  value,
  onRule,
  isOpen,
  onToggle,
  activeName,
  onSelect,
  emptyLabel = "No matching tools",
  className,
}: ToolPolicyTreeProps) {
  const cycleDirectory = (tools: ToolMeta[], depth: "section" | "child") => {
    if (!onRule) return undefined;
    const { next } = directoryPolicyToggle(tools, value ?? {});
    return () =>
      onRule(directoryPermissionRule({ tools, view, depth, policy: next }));
  };
  return (
    <ListMenu className={cn("divide-y-0", className)}>
      {sections.map((section) => {
        const sectionKey = `p:${section.label}`;
        const sectionOpen = isOpen(sectionKey);
        const sectionTools = section.children.flatMap((child) => child.tools);
        return (
          <ListMenuSection key={sectionKey}>
            <ListMenuHeader className="px-0 py-0">
              <ToolDirectoryHeader
                label={section.label}
                count={section.count}
                open={sectionOpen}
                variant="section"
                mode={directoryPolicyToggle(sectionTools, value ?? {}).badge}
                onToggle={() => onToggle(sectionKey)}
                onCycle={cycleDirectory(sectionTools, "section")}
              />
            </ListMenuHeader>
            {sectionOpen &&
              section.children.map((child) => {
                const childKey = `s:${section.label}///${child.label}`;
                const childOpen = isOpen(childKey);
                return (
                  <div key={childKey}>
                    <div className="flex items-center border-b border-border bg-background pl-2">
                      <ToolDirectoryHeader
                        label={child.label}
                        count={child.tools.length}
                        open={childOpen}
                        variant="child"
                        mode={
                          directoryPolicyToggle(child.tools, value ?? {}).badge
                        }
                        onToggle={() => onToggle(childKey)}
                        onCycle={cycleDirectory(child.tools, "child")}
                      />
                    </div>
                    {childOpen &&
                      child.tools.map((tool) => (
                        <ToolPolicyRow
                          key={tool.name}
                          tool={tool}
                          active={activeName === tool.name}
                          policy={value?.[tool.name]}
                          onSelect={
                            onSelect ? () => onSelect(tool.name) : undefined
                          }
                          onCycle={
                            onRule
                              ? (policy) =>
                                  onRule({
                                    name: tool.name,
                                    policy: nextMode(policy),
                                  })
                              : undefined
                          }
                        />
                      ))}
                  </div>
                );
              })}
          </ListMenuSection>
        );
      })}
      {sections.length === 0 && (
        <div className="px-3 py-8 text-center text-xs text-muted-foreground">
          {emptyLabel}
        </div>
      )}
    </ListMenu>
  );
}

function ToolPolicyRow({
  tool,
  active,
  policy,
  onSelect,
  onCycle,
}: {
  tool: ToolMeta;
  active: boolean;
  policy: ToolPolicy | undefined;
  onSelect: (() => void) | undefined;
  onCycle: ((policy: ToolPolicy) => void) | undefined;
}) {
  const label = tool.label || tool.name;
  const mode = policy ?? tool.defaultPermission ?? "auto";
  return (
    <ListMenuItem
      active={active}
      interactive={onSelect !== undefined}
      title={tool.name}
      className="flex items-center gap-2 py-1 pl-6 pr-2"
    >
      <button
        type="button"
        aria-label={label}
        aria-pressed={onSelect ? active : undefined}
        disabled={!onSelect}
        onClick={onSelect}
        className="grid min-w-0 flex-1 grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-2 text-left disabled:cursor-default"
      >
        {tool.icon ? (
          <Icon name={tool.icon} className="size-3.5 text-muted-foreground" />
        ) : (
          <Icon icon={UiWrench} className="size-3.5 text-muted-foreground" />
        )}
        <span
          className={cn(
            "min-w-0 truncate text-xs font-medium",
            mode === "deny" && "text-muted-foreground line-through",
          )}
        >
          {label}
        </span>
        <span className="flex items-center gap-1">
          <ToolHintIcons tool={tool} />
        </span>
      </button>
      {onCycle ? (
        <button
          type="button"
          aria-label={`Toggle ${label}`}
          onClick={() => onCycle(mode)}
          className="shrink-0 rounded hover:ring-1 hover:ring-border"
        >
          <ModeBadge mode={mode} />
        </button>
      ) : (
        <ModeBadge mode={mode} />
      )}
    </ListMenuItem>
  );
}

function ToolHintIcons({ tool }: { tool: ToolMeta }) {
  const hints = [
    [
      tool.annotations?.readOnlyHint,
      "Read only tool",
      UiEye,
      "text-emerald-600",
    ],
    [
      tool.annotations?.destructiveHint,
      "Destructive tool",
      UiWarningTriangle,
      "text-red-600",
    ],
    [
      tool.annotations?.idempotentHint,
      "Idempotent tool",
      UiRepeat,
      "text-sky-600",
    ],
    [
      tool.annotations?.openWorldHint,
      "Open world tool",
      UiGlobe,
      "text-violet-600",
    ],
  ] as const;
  return hints.flatMap(([enabled, hint, icon, className]) =>
    enabled
      ? [
          <span key={hint} role="img" aria-label={hint} title={hint}>
            <Icon icon={icon} className={cn("size-3", className)} />
          </span>,
        ]
      : [],
  );
}
