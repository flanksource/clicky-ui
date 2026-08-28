import { useEffect, useMemo, useState } from "react";
import { Icon, type StaticIconComponent } from "../../Icon";
import {
  UiAdd,
  UiEdit,
  UiFile,
  UiFilePlus,
  UiFileText,
  UiGavel,
  UiGlobe,
  UiHardDrive,
  UiKanban,
  UiMagicWand,
  UiPlugsConnected,
  UiPuzzle,
  UiShield,
  UiTerminal,
} from "../../../icons";
import {
  PolicyTree,
  type PolicyOption,
  type PolicyTreeEntry,
} from "../PolicyTree";
import { SpecInput, SpecSelect } from "./fields";
import {
  entryModeOptions,
  permissionAddPlaceholder,
  type PermissionDomain,
  type PermissionListEntry,
  type PermissionListMode,
} from "./permissions-model";

const POLICY_OPTIONS: Record<
  PermissionListMode,
  PolicyOption<PermissionListMode>
> = {
  auto: { id: "auto", label: "Auto", tone: "info" },
  ask: { id: "ask", label: "Ask", tone: "warning" },
  allow: { id: "allow", label: "Allow", tone: "success" },
  deny: { id: "deny", label: "Deny", tone: "danger" },
  enabled: { id: "enabled", label: "Enabled", tone: "success" },
  disabled: { id: "disabled", label: "Disabled", tone: "neutral" },
};

const DOMAIN_OPTIONS = [
  { value: "tools", label: "Tool" },
  { value: "mcp", label: "MCP" },
  { value: "plugins", label: "Plugin" },
  { value: "skills", label: "Skill" },
] as const;

const DOMAIN_LABELS: Record<PermissionDomain, string> = {
  tools: "tool",
  mcp: "MCP server",
  plugins: "plugin",
  skills: "skill",
};

export function PermissionPolicyList({
  entries,
  supportedDomains,
  emptyLabel,
  onApply,
  onAdd,
}: {
  entries: PermissionListEntry[];
  supportedDomains: readonly PermissionDomain[];
  emptyLabel: string;
  onApply: (entries: PermissionListEntry[], mode: PermissionListMode) => void;
  onAdd: (domain: PermissionDomain, id: string) => void;
}) {
  const firstDomain = supportedDomains[0];
  if (!firstDomain) throw new Error("PermissionPolicyList requires a domain");
  const [addDomain, setAddDomain] = useState<PermissionDomain>(firstDomain);
  const [addValue, setAddValue] = useState("");
  const policyEntries = useMemo(
    () => entries.map(permissionPolicyEntry),
    [entries],
  );
  useEffect(() => {
    if (!supportedDomains.includes(addDomain) && supportedDomains[0]) {
      setAddDomain(supportedDomains[0]);
    }
  }, [addDomain, supportedDomains]);

  return (
    <PolicyTree
      entries={policyEntries}
      emptyLabel={emptyLabel}
      onEntryModeChange={(entry, mode) => onApply([entry.data], mode)}
      onGroupModeChange={(groupEntries, mode) =>
        onApply(
          groupEntries.map((entry) => entry.data),
          mode,
        )
      }
      groupIcon={permissionGroupIcon}
      footer={
        <div className="grid gap-density-2 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
          <SpecSelect
            ariaLabel="Permission kind"
            value={addDomain}
            onChange={(domain) => setAddDomain(domain as PermissionDomain)}
            options={DOMAIN_OPTIONS.filter((option) =>
              supportedDomains.includes(option.value),
            )}
          />
          <SpecInput
            value={addValue}
            onChange={setAddValue}
            placeholder={permissionAddPlaceholder(addDomain)}
            ariaLabel="Permission identifier"
          />
          <button
            type="button"
            aria-label={
              supportedDomains.length === 1
                ? `Add ${DOMAIN_LABELS[firstDomain]}`
                : "Add permission"
            }
            onClick={() => {
              onAdd(addDomain, addValue);
              setAddValue("");
            }}
            className="inline-flex h-control-h items-center justify-center gap-1 rounded-md border border-border bg-background px-density-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Icon icon={UiAdd} className="size-3.5" />
            Add
          </button>
        </div>
      }
    />
  );
}

function permissionPolicyEntry(
  entry: PermissionListEntry,
): PolicyTreeEntry<PermissionListMode, PermissionListEntry> {
  const out: PolicyTreeEntry<PermissionListMode, PermissionListEntry> = {
    id: `${entry.domain}:${entry.id}`,
    label: entry.label,
    group: entry.group,
    mode: entry.mode,
    options: entryModeOptions(entry).map((mode) => POLICY_OPTIONS[mode]),
    data: entry,
    icon: permissionEntryIcon(entry),
  };
  if (entry.description) out.description = entry.description;
  if (entry.source) out.source = entry.source;
  if (entry.sourcePath) out.sourcePath = entry.sourcePath;
  return out;
}

function permissionEntryIcon(entry: PermissionListEntry): StaticIconComponent {
  if (entry.domain === "mcp") {
    const id = entry.id.toLowerCase();
    if (id.includes("filesystem") || id.includes("file")) return UiHardDrive;
    if (id.includes("gavel")) return UiGavel;
    if (id === "ado" || id.includes("kanban")) return UiKanban;
    return UiPlugsConnected;
  }
  if (entry.domain === "plugins") return UiPuzzle;
  if (entry.domain === "skills") return UiMagicWand;

  const id = entry.id.toLowerCase();
  if (id === "read" || id.includes("read")) return UiFileText;
  if (id === "edit" || id.includes("edit")) return UiEdit;
  if (id === "write" || id.includes("write")) return UiFilePlus;
  if (id.includes("bash") || id.includes("shell")) return UiTerminal;
  if (id.includes("web")) return UiGlobe;
  return UiFile;
}

function permissionGroupIcon(
  group: string,
  entries: PolicyTreeEntry<PermissionListMode, PermissionListEntry>[],
): StaticIconComponent {
  const normalized = group.toLowerCase();
  if (normalized.includes("file")) return UiFile;
  if (normalized.includes("shell")) return UiTerminal;
  if (normalized.includes("web")) return UiGlobe;
  if (normalized.includes("mcp")) return UiPlugsConnected;
  if (normalized.includes("plugin")) return UiPuzzle;
  if (normalized.includes("skill")) return UiMagicWand;
  const first = entries[0];
  return first ? permissionEntryIcon(first.data) : UiShield;
}
