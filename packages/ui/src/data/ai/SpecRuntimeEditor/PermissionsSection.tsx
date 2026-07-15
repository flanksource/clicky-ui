import { useEffect, useMemo, useState } from "react";
import { SegmentedControl, type SegmentedOption } from "../../../components";
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
  UiListDashes,
  UiLock,
  UiMagicWand,
  UiPlugsConnected,
  UiPuzzle,
  UiShield,
  UiTerminal,
} from "../../../icons";
import {
  SPEC_PERMISSION_MODES,
  type AISpecRuntimeValue,
  type SpecPermissionMode,
} from "../SpecRuntimeEditor.model";
import { PERMISSION_MODE_ICONS } from "../agent-action-icons";
import {
  PolicyTree,
  type PolicyOption,
  type PolicyTreeEntry,
} from "../PolicyTree";
import { CheckboxField, SpecField, SpecInput, SpecSelect } from "./fields";
import {
  entryModeOptions,
  permissionAddPlaceholder,
  type PermissionDomain,
  type PermissionListEntry,
  type PermissionListMode,
} from "./permissions-model";
import {
  SPEC_PERMISSION_PRESET_STORAGE_KEY,
  SPEC_RUNTIME_PRESETS,
  activeSpecPreset,
  applyPermissionPresetSnapshot,
  applySpecPreset,
  buildPermissionPresetSnapshot,
  savedPresetMatches,
  type SavedPermissionPreset,
  type SpecRuntimePresetId,
} from "./presets";
import { withMemory, withPermissions } from "./update";

const CUSTOM_PRESET_ID = "__custom";

const PRESET_ICONS: Record<SpecRuntimePresetId, StaticIconComponent> = {
  edit: UiEdit,
  plan: UiListDashes,
  readonly: UiLock,
};

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

export function PermissionsSection({
  value,
  onChange,
  entries,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  entries: PermissionListEntry[];
  onApplyEntries: (
    entries: PermissionListEntry[],
    mode: PermissionListMode,
  ) => void;
  onAddEntry: (domain: PermissionDomain, id: string) => void;
}) {
  return (
    <PermissionPresetSelector
      value={value}
      entries={entries}
      onChange={onChange}
    />
  );
}

export function PermissionsAdvanced({
  value,
  onChange,
  entries,
  onApplyEntries,
  onAddEntry,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  entries: PermissionListEntry[];
  onApplyEntries: (
    entries: PermissionListEntry[],
    mode: PermissionListMode,
  ) => void;
  onAddEntry: (domain: PermissionDomain, id: string) => void;
}) {
  return (
    <div className="grid gap-density-3">
      <SpecField label="Mode">
        <SpecSelect
          ariaLabel="Permission mode"
          icon={PERMISSION_MODE_ICONS[value.permissions?.mode || "default"].icon}
          value={value.permissions?.mode || "default"}
          onChange={(mode) =>
            onChange(
              withPermissions(value, { mode: mode as SpecPermissionMode }),
            )
          }
        >
          {SPEC_PERMISSION_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </SpecSelect>
      </SpecField>
      <div className="grid gap-density-2 sm:grid-cols-2 md:grid-cols-3">
        <CheckboxField
          label="Skip project"
          checked={value.memory?.skipProject}
          onChange={(skipProject) =>
            onChange(withMemory(value, { skipProject }))
          }
        />
        <CheckboxField
          label="Skip user"
          checked={value.memory?.skipUser}
          onChange={(skipUser) => onChange(withMemory(value, { skipUser }))}
        />
        <CheckboxField
          label="Skip hooks"
          checked={value.memory?.skipHooks}
          onChange={(skipHooks) => onChange(withMemory(value, { skipHooks }))}
        />
        <CheckboxField
          label="Skip memory"
          checked={value.memory?.skipMemory}
          onChange={(skipMemory) => onChange(withMemory(value, { skipMemory }))}
        />
        <CheckboxField
          label="Bare"
          checked={value.memory?.bare}
          onChange={(bare) => onChange(withMemory(value, { bare }))}
        />
      </div>
      <PermissionPolicyList
        entries={entries}
        emptyLabel="No tools, MCP servers, plugins, or skills configured"
        onApply={onApplyEntries}
        onAdd={onAddEntry}
      />
    </div>
  );
}

function PermissionPresetSelector({
  value,
  entries,
  onChange,
}: {
  value: AISpecRuntimeValue;
  entries: PermissionListEntry[];
  onChange: (value: AISpecRuntimeValue) => void;
}) {
  const [savedPresets, setSavedPresets] = useState<SavedPermissionPreset[]>([]);
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    setSavedPresets(readSavedPermissionPresets());
  }, []);

  const activeBuiltIn = activeSpecPreset(value, entries);
  const activeSaved = savedPresets.find((preset) =>
    savedPresetMatches(value, entries, preset),
  );
  const activeId = activeBuiltIn ?? activeSaved?.id ?? CUSTOM_PRESET_ID;

  const options = useMemo(() => {
    const builtIns: SegmentedOption<string>[] = SPEC_RUNTIME_PRESETS.map(
      (preset) => ({
        id: preset.id,
        label: preset.label,
        description: preset.description,
        icon: PRESET_ICONS[preset.id],
      }),
    );
    const saved: SegmentedOption<string>[] = savedPresets.map((preset) => ({
      id: preset.id,
      label: preset.label,
      description: "Saved",
      icon: UiShield,
    }));
    const custom: SegmentedOption<string>[] =
      activeId === CUSTOM_PRESET_ID
        ? [
            {
              id: CUSTOM_PRESET_ID,
              label: "Custom",
              description: "Manual tree",
              icon: UiShield,
            },
          ]
        : [];
    return [...builtIns, ...saved, ...custom];
  }, [activeId, savedPresets]);

  const applyPreset = (id: string) => {
    if (id === CUSTOM_PRESET_ID) return;
    if (isBuiltInPresetId(id)) {
      onChange(applySpecPreset(value, id, entries));
      return;
    }
    const saved = savedPresets.find((preset) => preset.id === id);
    if (saved) onChange(applyPermissionPresetSnapshot(value, saved.snapshot));
  };

  const savePreset = () => {
    const label = presetName.trim();
    if (!label) return;
    const snapshot = buildPermissionPresetSnapshot(value, entries);
    const now = new Date().toISOString();
    const next: SavedPermissionPreset[] = [
      ...savedPresets.filter((preset) => preset.label !== label),
      {
        id: `local:${slugify(label)}:${Date.now().toString(36)}`,
        label,
        snapshot,
        updatedAt: now,
      },
    ];
    writeSavedPermissionPresets(next);
    setSavedPresets(next);
    setPresetName("");
  };

  const updateActiveSaved = () => {
    if (!activeSaved) return;
    const next = savedPresets.map((preset) =>
      preset.id === activeSaved.id
        ? {
            ...preset,
            snapshot: buildPermissionPresetSnapshot(value, entries),
            updatedAt: new Date().toISOString(),
          }
        : preset,
    );
    writeSavedPermissionPresets(next);
    setSavedPresets(next);
  };

  const deleteActiveSaved = () => {
    if (!activeSaved) return;
    const next = savedPresets.filter((preset) => preset.id !== activeSaved.id);
    writeSavedPermissionPresets(next);
    setSavedPresets(next);
  };

  return (
    <div className="grid gap-density-3">
      <SegmentedControl
        aria-label="Permission preset"
        value={activeId}
        options={options}
        onChange={applyPreset}
        size="lg"
        wrap
        className="w-full"
      />
      <div className="grid gap-density-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <SpecInput
          value={presetName}
          onChange={setPresetName}
          placeholder="Preset name"
          ariaLabel="Permission preset name"
          icon={UiShield}
        />
        <button
          type="button"
          onClick={savePreset}
          disabled={!presetName.trim()}
          className="inline-flex h-control-h items-center justify-center gap-1 rounded-md border border-border bg-background px-density-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon icon={UiAdd} className="size-3.5" />
          Save
        </button>
        {activeSaved && (
          <span className="inline-flex gap-density-2">
            <button
              type="button"
              onClick={updateActiveSaved}
              className="inline-flex h-control-h items-center justify-center rounded-md border border-border bg-background px-density-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Update
            </button>
            <button
              type="button"
              onClick={deleteActiveSaved}
              className="inline-flex h-control-h items-center justify-center rounded-md border border-border bg-background px-density-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Delete
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

function PermissionPolicyList({
  entries,
  emptyLabel,
  onApply,
  onAdd,
}: {
  entries: PermissionListEntry[];
  emptyLabel: string;
  onApply: (entries: PermissionListEntry[], mode: PermissionListMode) => void;
  onAdd: (domain: PermissionDomain, id: string) => void;
}) {
  const [addDomain, setAddDomain] = useState<PermissionDomain>("tools");
  const [addValue, setAddValue] = useState("");
  const policyEntries = useMemo(
    () => entries.map(permissionPolicyEntry),
    [entries],
  );
  const submitAdd = () => {
    onAdd(addDomain, addValue);
    setAddValue("");
  };

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
          >
            <option value="tools">Tool</option>
            <option value="mcp">MCP</option>
            <option value="plugins">Plugin</option>
            <option value="skills">Skill</option>
          </SpecSelect>
          <SpecInput
            value={addValue}
            onChange={setAddValue}
            placeholder={permissionAddPlaceholder(addDomain)}
            ariaLabel="Permission identifier"
          />
          <button
            type="button"
            onClick={submitAdd}
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

function readSavedPermissionPresets(): SavedPermissionPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SPEC_PERMISSION_PRESET_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedPermissionPreset);
  } catch {
    return [];
  }
}

function writeSavedPermissionPresets(presets: SavedPermissionPreset[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    SPEC_PERMISSION_PRESET_STORAGE_KEY,
    JSON.stringify(presets),
  );
}

function isSavedPermissionPreset(
  value: unknown,
): value is SavedPermissionPreset {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SavedPermissionPreset>;
  return (
    typeof item.id === "string" &&
    typeof item.label === "string" &&
    typeof item.updatedAt === "string" &&
    !!item.snapshot &&
    typeof item.snapshot === "object" &&
    !!item.snapshot.permissions
  );
}

function isBuiltInPresetId(id: string): id is SpecRuntimePresetId {
  return id === "edit" || id === "plan" || id === "readonly";
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "preset";
}
