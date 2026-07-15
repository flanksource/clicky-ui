import { useMemo, useState, type ReactNode } from "react";
import { SegmentedControl } from "../../components/SegmentedControl";
import {
  SecretKeySelector,
  type KeyPreview,
  type SecretKeyValue,
  type SecretKind,
  type SecretResource,
} from "../../components/SecretKeySelector";
import { Icon, type StaticIconComponent } from "../Icon";
import {
  UiCheck,
  UiFileText,
  UiGitBranch,
  UiInfo,
  UiRobotAi,
  UiShield,
  UiTerminal,
} from "../../icons";
import { Tabs } from "../../layout/Tabs";
import { cn } from "../../lib/utils";
import { HoverCard } from "../../overlay/HoverCard";
import { EffortSelector, ModelSelector } from "../chat/ModelSelector";
import type { ChatBudgetConfig, ChatModel, ToolMeta } from "../chat/types";
import {
  SPEC_PERMISSION_MODES,
  SPEC_STASH_MODES,
  SPEC_WORKTREE_MODES,
  SPEC_VERIFY_SCOPES,
  type AISpecRuntimeMCPPermissions,
  type AISpecRuntimePermissionCatalog,
  type AISpecRuntimePermissionCatalogItem,
  type AISpecRuntimeEnvVar,
  type AISpecRuntimeMemory,
  type AISpecRuntimePermissions,
  type AISpecRuntimePrompt,
  type AISpecRuntimeResourcePolicies,
  type AISpecRuntimeSetup,
  type AISpecRuntimeToolPolicies,
  type AISpecRuntimeValue,
  type SpecCheckoutMode,
  type SpecPermissionMode,
  type SpecResourceMode,
  type SpecStashMode,
  type SpecToolPolicy,
  type SpecVerifyScope,
  type SpecWorktreeMode,
  normalizeMCPPermissions,
  normalizeResourcePolicies,
  normalizeToolPolicies,
} from "./SpecRuntimeEditor.model";

export type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";

export type SpecRuntimeSecretSelectorConfig = {
  loadResources: (kind: SecretKind) => Promise<SecretResource[]>;
  loadKeyPreview: (kind: SecretKind, name: string) => Promise<KeyPreview[]>;
  strict?: boolean | undefined;
  allowLiteral?: boolean | undefined;
};

export type SpecRuntimeEditorProps = {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  models?: ChatModel[] | undefined;
  tools?: ToolMeta[] | undefined;
  permissionCatalog?: AISpecRuntimePermissionCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  className?: string | undefined;
  title?: ReactNode | undefined;
};

const REASONING_EFFORTS = ["low", "medium", "high", "xhigh"];
const PRESET_OPTIONS = ["edit", "bare"];
const CHECKOUT_OPTIONS: Array<{ id: SpecCheckoutMode; label: string }> = [
  { id: "none", label: "None" },
  { id: "remote", label: "Remote" },
  { id: "local", label: "Local" },
];
const WORKTREE_OPTIONS: Array<{ id: SpecWorktreeMode; label: string }> =
  SPEC_WORKTREE_MODES.map((mode) => ({
    id: mode,
    label: mode === "none" ? "None" : mode === "new" ? "New" : "Existing",
  }));
const STASH_OPTIONS: Array<{ id: SpecStashMode; label: string }> =
  SPEC_STASH_MODES.map((mode) => ({
    id: mode,
    label:
      mode === "none"
        ? "None"
        : mode === "all"
          ? "All"
          : mode.charAt(0).toUpperCase() + mode.slice(1),
  }));
const VERIFY_OPTIONS: Array<{ id: SpecVerifyScope; label: string }> =
  SPEC_VERIFY_SCOPES.map((scope) => ({
    id: scope,
    label: scope === "all" ? "All files" : "Changed files",
  }));
const TOOL_POLICY_CYCLE: SpecToolPolicy[] = ["auto", "ask", "allow", "deny"];
const RESOURCE_MODE_CYCLE: SpecResourceMode[] = ["enabled", "disabled"];
const TOOL_POLICY_LABEL: Record<SpecToolPolicy, string> = {
  auto: "Auto",
  ask: "Ask",
  allow: "Allow",
  deny: "Deny",
};
const RESOURCE_MODE_LABEL: Record<SpecResourceMode, string> = {
  enabled: "Enabled",
  disabled: "Disabled",
};
type SpecRuntimeEditorTab =
  | "model"
  | "prompt"
  | "git"
  | "permissions"
  | "setup"
  | "verify";
const SPEC_RUNTIME_TABS: Array<{
  id: SpecRuntimeEditorTab;
  label: string;
  icon: StaticIconComponent;
}> = [
  { id: "model", label: "Model", icon: UiRobotAi },
  { id: "prompt", label: "Prompt", icon: UiFileText },
  { id: "git", label: "Git", icon: UiGitBranch },
  { id: "permissions", label: "Permissions", icon: UiShield },
  { id: "setup", label: "Setup", icon: UiTerminal },
  { id: "verify", label: "Verify", icon: UiCheck },
];

export function SpecRuntimeEditor({
  value,
  onChange,
  models = [],
  tools = [],
  permissionCatalog,
  secretSelector,
  className,
  title = "Runtime Spec",
}: SpecRuntimeEditorProps) {
  const updateRoot = (patch: Partial<AISpecRuntimeValue>) =>
    onChange({ ...value, ...patch });
  const updateOptionalRoot = (key: keyof AISpecRuntimeValue, next: unknown) => {
    const updated = { ...value } as Record<string, unknown>;
    if (next === undefined || next === "") {
      delete updated[key];
    } else {
      updated[key] = next;
    }
    onChange(updated as AISpecRuntimeValue);
  };
  const updatePrompt = (patch: Partial<AISpecRuntimePrompt>) =>
    updateRoot({ prompt: { ...value.prompt, ...patch } });
  const updateBudget = (budget: NonNullable<AISpecRuntimeValue["budget"]>) =>
    updateRoot({ budget });
  const updateMemory = (patch: Partial<AISpecRuntimeMemory>) =>
    updateRoot({ memory: { ...value.memory, ...patch } });
  const updatePermissions = (patch: Partial<AISpecRuntimePermissions>) =>
    updateRoot({ permissions: { ...value.permissions, ...patch } });
  const updateSetup = (patch: Partial<AISpecRuntimeSetup>) =>
    updateRoot({ setup: { ...value.setup, ...patch } });
  const updateCheckout = (patch: NonNullable<AISpecRuntimeSetup["checkout"]>) =>
    updateSetup({ checkout: { ...value.setup?.checkout, ...patch } });
  const updateCheckoutWorktree = (
    patch: NonNullable<NonNullable<AISpecRuntimeSetup["checkout"]>["worktree"]>,
  ) =>
    updateCheckout({
      worktree: { ...value.setup?.checkout?.worktree, ...patch },
    });
  const updateCheckoutDirty = (
    patch: NonNullable<NonNullable<AISpecRuntimeSetup["checkout"]>["dirty"]>,
  ) =>
    updateCheckout({
      dirty: { ...value.setup?.checkout?.dirty, ...patch },
    });
  const updateWorkflow = (patch: NonNullable<AISpecRuntimeValue["workflow"]>) =>
    updateRoot({ workflow: { ...value.workflow, ...patch } });
  const updateVerify = (
    patch: NonNullable<NonNullable<AISpecRuntimeValue["workflow"]>["verify"]>,
  ) => updateWorkflow({ verify: { ...value.workflow?.verify, ...patch } });
  const updateFinalize = (
    patch: NonNullable<NonNullable<AISpecRuntimeValue["workflow"]>["finalize"]>,
  ) => updateWorkflow({ finalize: { ...value.workflow?.finalize, ...patch } });
  const setPreset = (preset: string, checked: boolean) => {
    const current = new Set(value.permissions?.presets ?? []);
    if (checked) {
      current.add(preset);
    } else {
      current.delete(preset);
    }
    updatePermissions({ presets: Array.from(current) });
  };
  const checkoutMode: SpecCheckoutMode =
    value.setup?.checkout?.mode === "remote"
      ? "remote"
      : value.setup?.checkout?.mode === "local" || value.setup?.checkout?.path
        ? "local"
        : "none";
  const worktreeMode: SpecWorktreeMode =
    value.setup?.checkout?.worktree?.mode === "existing"
      ? "existing"
      : value.setup?.checkout?.worktree?.mode === "new"
        ? "new"
        : "none";
  const rawStashMode = value.setup?.checkout?.dirty?.stash;
  const stashMode: SpecStashMode =
    rawStashMode === "untracked" ||
    rawStashMode === "unstaged" ||
    rawStashMode === "staged" ||
    rawStashMode === "all"
      ? rawStashMode
      : "none";
  const catalog = useMemo(
    () => buildPermissionCatalog(permissionCatalog, tools),
    [permissionCatalog, tools],
  );
  const toolPolicies = normalizeToolPolicies(value.permissions?.tools);
  const mcpPermissions = normalizeMCPPermissions(value.permissions?.mcp);
  const pluginModes = normalizeResourcePolicies(value.permissions?.plugins);
  const skillModes = normalizeResourcePolicies(
    value.permissions?.skills,
    value.memory?.skills,
  );
  const permissionEntries = useMemo(
    () =>
      buildPermissionEntries(
        catalog,
        toolPolicies,
        mcpPermissions,
        pluginModes,
        skillModes,
      ),
    [catalog, toolPolicies, mcpPermissions, pluginModes, skillModes],
  );
  const applyPermissionEntries = (
    entries: PermissionListEntry[],
    mode: PermissionListEntry["mode"],
  ) => {
    const nextTools: AISpecRuntimeToolPolicies = { ...toolPolicies };
    let nextMCP = { ...mcpPermissions };
    const nextPlugins: AISpecRuntimeResourcePolicies = { ...pluginModes };
    const nextSkills: AISpecRuntimeResourcePolicies = { ...skillModes };
    let touchedSkills = false;

    for (const entry of entries) {
      if (entry.domain === "tools" && isSpecToolPolicy(mode)) {
        nextTools[entry.id] = mode;
      } else if (entry.domain === "mcp" && isSpecResourceMode(mode)) {
        nextMCP = withMCPMode(nextMCP, entry.id, mode);
      } else if (entry.domain === "plugins" && isSpecResourceMode(mode)) {
        nextPlugins[entry.id] = mode;
      } else if (entry.domain === "skills" && isSpecResourceMode(mode)) {
        nextSkills[entry.id] = mode;
        touchedSkills = true;
      }
    }

    updateRoot({
      permissions: {
        ...value.permissions,
        tools: nextTools,
        mcp: nextMCP,
        plugins: nextPlugins,
        skills: nextSkills,
      },
      ...(touchedSkills
        ? { memory: { ...value.memory, skills: [] } }
        : undefined),
    });
  };
  const addPermissionEntry = (domain: PermissionDomain, id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    const mode = domain === "tools" ? "auto" : "enabled";
    applyPermissionEntries(
      [
        {
          id: trimmed,
          label: trimmed,
          group: permissionDomainGroup(domain),
          domain,
          mode,
        } as PermissionListEntry,
      ],
      mode,
    );
  };
  const envRows = value.setup?.envVars;

  const [activeTab, setActiveTab] = useState<SpecRuntimeEditorTab>("model");

  return (
    <section
      className={cn("space-y-3 rounded-md border border-border p-3", className)}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <Tabs
        tabs={SPEC_RUNTIME_TABS.map((tab) => ({
          id: tab.id,
          label: <SpecRuntimeTabLabel icon={tab.icon} label={tab.label} />,
        }))}
        value={activeTab}
        onChange={(tab) => setActiveTab(tab as SpecRuntimeEditorTab)}
        variant="underline"
        className="flex-wrap"
      />

      {activeTab === "model" && (
        <SpecSection>
          <div className="grid gap-2">
            <div className="grid gap-2 md:grid-cols-3">
              <SpecField label="Model">
                {models.length > 0 ? (
                  <ModelSelector
                    models={models}
                    value={value.model}
                    onChange={(model) => updateRoot({ model })}
                    className="w-full max-w-md"
                  />
                ) : (
                  <SpecInput
                    value={value.model}
                    onChange={(model) => updateRoot({ model })}
                    placeholder="claude-sonnet-4-6"
                  />
                )}
              </SpecField>
              <SpecField label="Effort">
                <EffortSelector
                  efforts={REASONING_EFFORTS}
                  value={value.effort ?? ""}
                  onChange={(effort) => updateRoot({ effort })}
                  className="w-full max-w-md"
                />
              </SpecField>
              <NumberField
                label="Temperature"
                value={value.temperature}
                onChange={(temperature) =>
                  updateOptionalRoot("temperature", temperature)
                }
                min={0}
                max={2}
                step={0.1}
              />
            </div>
            <div className="grid gap-2 md:grid-cols-[8rem_8rem_8rem_8rem_auto]">
              <InlineBudgetField
                label="Max cost"
                value={value.budget?.cost}
                onChange={(cost) =>
                  updateBudgetValue(value.budget, updateBudget, "cost", cost)
                }
                step={0.01}
              />
              <InlineBudgetField
                label="Max tokens"
                value={value.budget?.maxTokens}
                onChange={(maxTokens) =>
                  updateBudgetValue(
                    value.budget,
                    updateBudget,
                    "maxTokens",
                    maxTokens,
                  )
                }
                step={1}
                integer
              />
              <SpecField label="Timeout">
                <SpecInput
                  value={value.budget?.timeout}
                  onChange={(timeout) =>
                    updateBudget({ ...value.budget, timeout })
                  }
                  placeholder="30m"
                />
              </SpecField>
              <NumberField
                label="Max turns"
                value={value.budget?.maxTurns}
                onChange={(maxTurns) => {
                  const budget = { ...value.budget };
                  if (maxTurns == null) {
                    delete budget.maxTurns;
                  } else {
                    budget.maxTurns = maxTurns;
                  }
                  updateBudget(budget);
                }}
                min={0}
                max={100}
                step={1}
                integer
              />
              <CheckboxField
                label="No cache"
                checked={value.noCache}
                onChange={(noCache) => updateRoot({ noCache })}
              />
            </div>
          </div>
        </SpecSection>
      )}

      {activeTab === "prompt" && (
        <SpecSection>
          <div className="grid gap-2">
            <TextareaField
              label="User override"
              value={value.prompt?.user}
              onChange={(user) => updatePrompt({ user })}
              minHeight={92}
            />
            <div className="grid gap-2 md:grid-cols-2">
              <TextareaField
                label="System"
                value={value.prompt?.system}
                onChange={(system) => updatePrompt({ system })}
                minHeight={92}
              />
              <TextareaField
                label="Append system"
                value={value.prompt?.appendSystem}
                onChange={(appendSystem) => updatePrompt({ appendSystem })}
                minHeight={92}
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <SpecField label="Source">
                <SpecInput
                  value={value.prompt?.source}
                  onChange={(source) => updatePrompt({ source })}
                  placeholder="prompt source label"
                />
              </SpecField>
              <KeyValueField
                label="Metadata"
                value={value.prompt?.metadata}
                onChange={(metadata) => updatePrompt({ metadata })}
              />
            </div>
          </div>
        </SpecSection>
      )}

      {activeTab === "git" && (
        <SpecSection>
          <div className="grid gap-2">
            <div className="grid gap-2 md:grid-cols-2">
              <SpecField label="Directory">
                <SpecInput
                  value={value.setup?.cwd}
                  onChange={(cwd) => updateSetup({ cwd })}
                  placeholder="."
                />
              </SpecField>
              <SpecField label="Base dir">
                <SpecInput
                  value={value.setup?.baseDir}
                  onChange={(baseDir) => updateSetup({ baseDir })}
                  placeholder=".captain/workspaces"
                />
              </SpecField>
            </div>

            <div className="space-y-2">
              <SpecField label="Git checkout">
                <SegmentedControl
                  aria-label="Checkout source"
                  size="sm"
                  value={checkoutMode}
                  onChange={(mode) =>
                    updateCheckout(
                      mode === "none"
                        ? {
                            mode,
                            url: "",
                            path: "",
                            connection: "",
                            ref: "",
                            depth: 0,
                          }
                        : mode === "local"
                          ? { mode, url: "", connection: "" }
                          : { mode, path: "" },
                    )
                  }
                  options={CHECKOUT_OPTIONS}
                />
              </SpecField>
              <div className="grid gap-2 md:grid-cols-3">
                <SpecField label="Local path">
                  <SpecInput
                    value={value.setup?.checkout?.path}
                    onChange={(path) => updateCheckout({ path })}
                    placeholder="/repo"
                  />
                </SpecField>
                <SpecField label="Git URL">
                  <SpecInput
                    value={value.setup?.checkout?.url}
                    onChange={(url) => updateCheckout({ url })}
                    placeholder="https://github.com/org/repo.git"
                  />
                </SpecField>
                <SpecField label="Connection">
                  <SpecInput
                    value={value.setup?.checkout?.connection}
                    onChange={(connection) => updateCheckout({ connection })}
                    placeholder="github"
                  />
                </SpecField>
                <SpecField label="Ref">
                  <SpecInput
                    value={value.setup?.checkout?.ref}
                    onChange={(ref) => updateCheckout({ ref })}
                    placeholder="main"
                  />
                </SpecField>
                <NumberField
                  label="Depth"
                  value={value.setup?.checkout?.depth}
                  onChange={(depth) => updateCheckout({ depth: depth ?? 0 })}
                  min={0}
                  step={1}
                  integer
                />
              </div>
            </div>

            <div className="space-y-2">
              <SpecField label="Worktree">
                <SegmentedControl
                  aria-label="Worktree mode"
                  size="sm"
                  value={worktreeMode}
                  onChange={(mode) =>
                    updateCheckoutWorktree(
                      mode === "none"
                        ? {
                            mode,
                            prefix: "",
                            base: "",
                            path: "",
                            keep: false,
                          }
                        : mode === "existing"
                          ? {
                              mode,
                              prefix: "",
                              base: "",
                              keep: false,
                            }
                          : { mode },
                    )
                  }
                  options={WORKTREE_OPTIONS}
                />
              </SpecField>
              <div className="grid gap-2 md:grid-cols-3">
                <SpecField label="Worktree prefix">
                  <SpecInput
                    value={value.setup?.checkout?.worktree?.prefix}
                    onChange={(prefix) => updateCheckoutWorktree({ prefix })}
                    placeholder="ai"
                  />
                </SpecField>
                <SpecField label="Worktree base">
                  <SpecInput
                    value={value.setup?.checkout?.worktree?.base}
                    onChange={(base) => updateCheckoutWorktree({ base })}
                    placeholder="main"
                  />
                </SpecField>
                <SpecField label="Worktree path">
                  <SpecInput
                    value={value.setup?.checkout?.worktree?.path}
                    onChange={(path) => updateCheckoutWorktree({ path })}
                    placeholder=".shell/worktrees/spec-runtime"
                  />
                </SpecField>
              </div>
              <div className="grid gap-2 sm:grid-cols-[minmax(10rem,16rem)]">
                <CheckboxField
                  label="Keep worktree"
                  checked={value.setup?.checkout?.worktree?.keep}
                  onChange={(keep) => updateCheckoutWorktree({ keep })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <SpecField label="Stash">
                <SegmentedControl
                  aria-label="Stash mode"
                  size="sm"
                  value={stashMode}
                  onChange={(stash) =>
                    updateCheckoutDirty(
                      stash === "none" ? { stash, since: "" } : { stash },
                    )
                  }
                  options={STASH_OPTIONS}
                />
              </SpecField>
              <SpecField label="Since">
                <SpecInput
                  value={value.setup?.checkout?.dirty?.since}
                  onChange={(since) => updateCheckoutDirty({ since })}
                  placeholder="origin/main"
                />
              </SpecField>
            </div>
          </div>
        </SpecSection>
      )}

      {activeTab === "setup" && (
        <SpecSection>
          <div className="grid gap-2">
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)]">
              <ListField
                label="Dotenv files"
                value={value.setup?.dotenv}
                onChange={(dotenv) => updateSetup({ dotenv })}
                placeholder=".env"
              />
            </div>
            <EnvVarRows
              value={envRows}
              onChange={(envVars) => updateSetup({ envVars })}
              secretSelector={secretSelector}
            />
          </div>
        </SpecSection>
      )}

      {activeTab === "permissions" && (
        <>
          <SpecSection>
            <div className="grid gap-2">
              <div className="grid gap-2 md:grid-cols-2">
                <SpecField label="Mode">
                  <SpecSelect
                    value={value.permissions?.mode || "default"}
                    onChange={(mode) =>
                      updatePermissions({ mode: mode as SpecPermissionMode })
                    }
                  >
                    {SPEC_PERMISSION_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </SpecSelect>
                </SpecField>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_OPTIONS.map((preset) => (
                    <CheckboxField
                      key={preset}
                      label={`Preset ${preset}`}
                      checked={value.permissions?.presets?.includes(preset)}
                      onChange={(checked) => setPreset(preset, checked)}
                    />
                  ))}
                </div>
              </div>
              <UnifiedPermissionPolicyList
                entries={permissionEntries}
                emptyLabel="No tools, MCP servers, plugins, or skills configured"
                onToggle={(entry) =>
                  applyPermissionEntries([entry], nextPermissionMode(entry))
                }
                onToggleGroup={(entries, mode) =>
                  applyPermissionEntries(entries, mode)
                }
                onAdd={addPermissionEntry}
              />
            </div>
          </SpecSection>

          <SpecSection title="Memory">
            <div className="grid gap-2">
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                <CheckboxField
                  label="Skip project"
                  checked={value.memory?.skipProject}
                  onChange={(skipProject) => updateMemory({ skipProject })}
                />
                <CheckboxField
                  label="Skip user"
                  checked={value.memory?.skipUser}
                  onChange={(skipUser) => updateMemory({ skipUser })}
                />
                <CheckboxField
                  label="Skip skills"
                  checked={value.memory?.skipSkills}
                  onChange={(skipSkills) => updateMemory({ skipSkills })}
                />
                <CheckboxField
                  label="Skip hooks"
                  checked={value.memory?.skipHooks}
                  onChange={(skipHooks) => updateMemory({ skipHooks })}
                />
                <CheckboxField
                  label="Skip memory"
                  checked={value.memory?.skipMemory}
                  onChange={(skipMemory) => updateMemory({ skipMemory })}
                />
                <CheckboxField
                  label="Bare"
                  checked={value.memory?.bare}
                  onChange={(bare) => updateMemory({ bare })}
                />
              </div>
            </div>
          </SpecSection>
        </>
      )}

      {activeTab === "verify" && (
        <>
          <SpecSection>
            <div className="grid gap-2 md:grid-cols-2">
              <ListField
                label="Verify commands"
                value={value.workflow?.verify?.commands}
                onChange={(commands) => updateVerify({ commands })}
                placeholder="go test ./..."
              />
              <div className="grid gap-2">
                <SpecField label="Scope">
                  <SegmentedControl
                    aria-label="Verification scope"
                    size="sm"
                    value={
                      (value.workflow?.verify?.scope ||
                        "all") as SpecVerifyScope
                    }
                    onChange={(scope) => updateVerify({ scope })}
                    options={VERIFY_OPTIONS}
                  />
                </SpecField>
                <NumberField
                  label="Max iterations"
                  value={value.workflow?.verify?.maxIterations}
                  onChange={(maxIterations) =>
                    updateVerify({ maxIterations: maxIterations ?? 0 })
                  }
                  min={0}
                  step={1}
                  integer
                />
                <CheckboxField
                  label="Gavel verification"
                  checked={value.workflow?.verify?.gavel}
                  onChange={(gavel) => updateVerify({ gavel })}
                />
              </div>
            </div>
          </SpecSection>

          <SpecSection title="Finalize">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <CheckboxField
                  label="Commit"
                  checked={value.workflow?.finalize?.commit}
                  onChange={(commit) => updateFinalize({ commit })}
                />
                <CheckboxField
                  label="Dry run"
                  checked={value.workflow?.finalize?.dryRun}
                  onChange={(dryRun) => updateFinalize({ dryRun })}
                />
              </div>
              <SpecField label="Commit message">
                <SpecInput
                  value={value.workflow?.finalize?.commitMessage}
                  onChange={(commitMessage) =>
                    updateFinalize({ commitMessage })
                  }
                  placeholder="Apply AI changes"
                />
              </SpecField>
            </div>
          </SpecSection>
        </>
      )}
    </section>
  );
}

function EnvVarRows({
  value,
  onChange,
  secretSelector,
}: {
  value?: AISpecRuntimeEnvVar[] | undefined;
  onChange: (value: AISpecRuntimeEnvVar[]) => void;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
}) {
  const rows = value && value.length > 0 ? value : [{ name: "", value: "" }];
  const updateRow = (index: number, patch: AISpecRuntimeEnvVar) => {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  };
  const updateSecret = (index: number, next: SecretKeyValue | undefined) => {
    const current = rows[index] ?? {};
    const updated: AISpecRuntimeEnvVar = { name: current.name ?? "" };
    if (next?.kind === "value") {
      updated.value = next.value;
    } else if (next) {
      updated.valueFrom = `${next.kind}://${next.name}/${next.key}`;
    }
    onChange(rows.map((row, rowIndex) => (rowIndex === index ? updated : row)));
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium text-muted-foreground">
          Environment variables
        </div>
        <SpecButton
          type="button"
          onClick={() => onChange([...rows, { name: "", value: "" }])}
        >
          Add
        </SpecButton>
      </div>
      <div className="overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-[minmax(6rem,1fr)_minmax(0,1fr)_auto] gap-2 border-b border-border bg-muted/40 px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground md:grid-cols-[minmax(8rem,12rem)_minmax(0,1fr)_auto]">
          <span>Name</span>
          <span>Value</span>
          <span className="sr-only">Actions</span>
        </div>
        <div className="divide-y divide-border">
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid gap-2 px-2 py-2 md:grid-cols-[minmax(8rem,12rem)_minmax(0,1fr)_auto]"
            >
              <SpecInput
                value={row.name}
                onChange={(name) => updateRow(index, { name })}
                placeholder="API_TOKEN"
                ariaLabel="Environment variable name"
              />
              <div className="min-w-0">
                {secretSelector ? (
                  <SecretKeySelector
                    value={secretValueFromEnvVar(row)}
                    onChange={(next) => updateSecret(index, next)}
                    loadResources={secretSelector.loadResources}
                    loadKeyPreview={secretSelector.loadKeyPreview}
                    {...(secretSelector.allowLiteral !== undefined
                      ? { allowLiteral: secretSelector.allowLiteral }
                      : {})}
                    {...(secretSelector.strict !== undefined
                      ? { strict: secretSelector.strict }
                      : {})}
                    className="min-w-0 flex-wrap"
                  />
                ) : (
                  <SpecInput
                    value={
                      typeof row.valueFrom === "string"
                        ? row.valueFrom
                        : row.value
                    }
                    onChange={(next) =>
                      updateRow(index, { value: next, valueFrom: "" })
                    }
                    placeholder="secret://name/key"
                    ariaLabel="Environment variable value"
                  />
                )}
              </div>
              <div className="flex items-center">
                <SpecButton
                  type="button"
                  onClick={() =>
                    onChange(rows.filter((_, rowIndex) => rowIndex !== index))
                  }
                >
                  Remove
                </SpecButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function secretValueFromEnvVar(
  value: AISpecRuntimeEnvVar,
): SecretKeyValue | undefined {
  if (typeof value.valueFrom === "string") {
    const valueFrom = value.valueFrom.trim();
    for (const kind of ["secret", "configmap"] as const) {
      const prefix = `${kind}://`;
      if (valueFrom.startsWith(prefix)) {
        const [name = "", key = ""] = valueFrom
          .slice(prefix.length)
          .split("/", 2);
        return { kind, name, key };
      }
    }
    return { kind: "value", value: valueFrom };
  }
  if (value.valueFrom?.secretKeyRef) {
    return {
      kind: "secret",
      name: value.valueFrom.secretKeyRef.name ?? "",
      key: value.valueFrom.secretKeyRef.key ?? "",
    };
  }
  if (value.valueFrom?.configMapKeyRef) {
    return {
      kind: "configmap",
      name: value.valueFrom.configMapKeyRef.name ?? "",
      key: value.valueFrom.configMapKeyRef.key ?? "",
    };
  }
  if (value.value !== undefined) return { kind: "value", value: value.value };
  return undefined;
}

type PermissionDomain = "tools" | "mcp" | "plugins" | "skills";
type PermissionListMode = SpecToolPolicy | SpecResourceMode;

type PermissionListEntry = {
  id: string;
  label: string;
  group: string;
  domain: PermissionDomain;
  mode: PermissionListMode;
  description?: string | undefined;
  source?: string | undefined;
  sourcePath?: string | undefined;
};

function UnifiedPermissionPolicyList({
  entries,
  emptyLabel,
  onToggle,
  onToggleGroup,
  onAdd,
}: {
  entries: PermissionListEntry[];
  emptyLabel: string;
  onToggle: (entry: PermissionListEntry) => void;
  onToggleGroup: (
    entries: PermissionListEntry[],
    mode: PermissionListMode,
  ) => void;
  onAdd: (domain: PermissionDomain, id: string) => void;
}) {
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const [addDomain, setAddDomain] = useState<PermissionDomain>("tools");
  const [addValue, setAddValue] = useState("");
  const groups = useMemo(() => groupPermissionEntries(entries), [entries]);
  const submitAdd = () => {
    onAdd(addDomain, addValue);
    setAddValue("");
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground">
        Tools preferences
      </div>
      <div className="overflow-hidden rounded-md border border-border">
        {groups.map(([group, groupEntries]) => {
          const collapsed = collapsedGroups[group] ?? false;
          const groupMode = permissionGroupMode(groupEntries);
          return (
            <div key={group} className="border-b border-border last:border-b-0">
              <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-1 border-b border-border bg-muted/50 px-1 py-0.5 sm:grid-cols-[1.5rem_minmax(0,1fr)_auto]">
                <button
                  type="button"
                  aria-label={`${collapsed ? "Expand" : "Collapse"} ${group}`}
                  title={`${collapsed ? "Expand" : "Collapse"} ${group}`}
                  className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
                  onClick={() =>
                    setCollapsedGroups((current) => ({
                      ...current,
                      [group]: !current[group],
                    }))
                  }
                >
                  {collapsed ? "+" : "-"}
                </button>
                <div className="flex min-w-0 items-center gap-2 px-1 py-1">
                  <span className="min-w-0 truncate text-[10px] font-semibold uppercase text-muted-foreground">
                    {group}
                  </span>
                  <span className="shrink-0 rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {groupEntries.length}
                  </span>
                </div>
                <PermissionGroupModeControls
                  entries={groupEntries}
                  group={group}
                  mode={groupMode}
                  onChange={(mode) => onToggleGroup(groupEntries, mode)}
                />
              </div>
              {!collapsed && (
                <div className="p-1">
                  {groupEntries.map((entry) => (
                    <button
                      key={`${entry.domain}:${entry.id}`}
                      type="button"
                      className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 rounded px-2 py-1 text-left hover:bg-accent"
                      title={entry.id}
                      onClick={() => onToggle(entry)}
                    >
                      <span
                        className={cn(
                          "min-w-0 truncate text-xs",
                          isDenyMode(entry.mode) &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {entry.label}
                      </span>
                      <span className="inline-flex size-5 items-center justify-center">
                        {(entry.description ||
                          entry.source ||
                          entry.sourcePath) && <PermissionInfo entry={entry} />}
                      </span>
                      <PermissionModeBadge mode={entry.mode} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {groups.length === 0 && (
          <div className="px-2 py-3 text-xs text-muted-foreground">
            {emptyLabel}
          </div>
        )}
        <div className="grid gap-2 border-t border-border bg-muted/20 p-2 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
          <select
            aria-label="Permission kind"
            value={addDomain}
            onChange={(event) =>
              setAddDomain(event.target.value as PermissionDomain)
            }
            className={controlClassName}
          >
            <option value="tools">Tool</option>
            <option value="mcp">MCP</option>
            <option value="plugins">Plugin</option>
            <option value="skills">Skill</option>
          </select>
          <SpecInput
            value={addValue}
            onChange={setAddValue}
            placeholder={permissionAddPlaceholder(addDomain)}
            ariaLabel="Permission identifier"
          />
          <SpecButton type="button" onClick={submitAdd}>
            Add
          </SpecButton>
        </div>
      </div>
    </div>
  );
}

function PermissionGroupModeControls({
  entries,
  group,
  mode,
  onChange,
}: {
  entries: PermissionListEntry[];
  group: string;
  mode: PermissionListMode | "mixed";
  onChange: (mode: PermissionListMode) => void;
}) {
  const options = permissionGroupModeOptions(entries);
  if (options.length === 0) {
    return (
      <span className="col-span-2 justify-self-start sm:col-span-1 sm:justify-self-end">
        <PermissionModeBadge mode={mode} />
      </span>
    );
  }
  return (
    <div className="col-span-2 inline-flex min-w-0 flex-wrap items-center gap-1 justify-self-start sm:col-span-1 sm:justify-self-end">
      {options.map((option) => {
        const active = mode === option;
        return (
          <button
            key={option}
            type="button"
            aria-label={`Set ${group} group to ${permissionModeLabel(option)}`}
            title={`Set ${group} group to ${permissionModeLabel(option)}`}
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
              active
                ? permissionModeBadgeClass(option)
                : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            onClick={() => onChange(option)}
          >
            {permissionModeLabel(option)}
          </button>
        );
      })}
    </div>
  );
}

function PermissionInfo({ entry }: { entry: PermissionListEntry }) {
  const lines = [
    entry.description,
    entry.source ? `Source: ${entry.source}` : undefined,
    entry.sourcePath,
  ].filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <HoverCard
      placement="top"
      delay={120}
      trigger={
        <span
          aria-label={`Info for ${entry.label}`}
          className="inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
          onClick={(event) => event.stopPropagation()}
        >
          <Icon icon={UiInfo} className="size-3.5" />
        </span>
      }
      cardClassName="max-w-xs whitespace-normal text-xs"
    >
      <div className="space-y-1">
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </HoverCard>
  );
}

function PermissionModeBadge({ mode }: { mode: PermissionListMode | "mixed" }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-medium",
        permissionModeBadgeClass(mode),
      )}
    >
      {permissionModeLabel(mode)}
    </span>
  );
}

function permissionModeLabel(mode: PermissionListMode | "mixed") {
  if (mode === "mixed") return "Mixed";
  return isSpecToolPolicy(mode)
    ? TOOL_POLICY_LABEL[mode]
    : RESOURCE_MODE_LABEL[mode];
}

function permissionModeBadgeClass(mode: PermissionListMode | "mixed") {
  if (mode === "auto" || mode === "allow" || mode === "enabled") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
  }
  if (mode === "ask") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
  }
  return "bg-muted text-muted-foreground";
}

function SpecRuntimeTabLabel({
  icon,
  label,
}: {
  icon: StaticIconComponent;
  label: string;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon
        icon={icon}
        className="size-3.5 text-slate-400 dark:text-slate-500"
      />
      <span>{label}</span>
    </span>
  );
}

function SpecSection({
  title,
  children,
}: {
  title?: string | undefined;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2 border-t border-border pt-3 first:border-t-0 first:pt-0">
      {title && (
        <div className="text-xs font-semibold uppercase text-muted-foreground">
          {title}
        </div>
      )}
      {children}
    </section>
  );
}

function SpecField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0 space-y-1 text-xs text-muted-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SpecInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value?: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  ariaLabel?: string | undefined;
}) {
  return (
    <input
      aria-label={ariaLabel}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={controlClassName}
    />
  );
}

function SpecSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={controlClassName}
    >
      {children}
    </select>
  );
}

function SpecButton({
  type,
  onClick,
  children,
}: {
  type: "button";
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="h-8 rounded-md border border-border bg-background px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  integer = false,
}: {
  label: string;
  value?: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  integer?: boolean | undefined;
}) {
  return (
    <SpecField label={label}>
      <input
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        onChange={(event) =>
          onChange(parseOptionalNumber(event.target.value, integer))
        }
        className={controlClassName}
      />
    </SpecField>
  );
}

function InlineBudgetField({
  label,
  value,
  onChange,
  step,
  integer = false,
}: {
  label: string;
  value?: number | undefined;
  onChange: (value: number | undefined) => void;
  step: number;
  integer?: boolean | undefined;
}) {
  return (
    <SpecField label={label}>
      <input
        type="number"
        min={0}
        step={step}
        value={value ?? ""}
        onChange={(event) =>
          onChange(parseOptionalNumber(event.target.value, integer))
        }
        className={controlClassName}
      />
    </SpecField>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  minHeight = 76,
  placeholder,
}: {
  label: string;
  value?: string | undefined;
  onChange: (value: string) => void;
  minHeight?: number | undefined;
  placeholder?: string | undefined;
}) {
  return (
    <SpecField label={label}>
      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        style={{ minHeight }}
        className="w-full max-w-2xl resize-y rounded-md border border-border bg-background px-2 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
      />
    </SpecField>
  );
}

function ListField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: string[] | undefined;
  onChange: (value: string[]) => void;
  placeholder?: string | undefined;
}) {
  return (
    <TextareaField
      label={label}
      value={listToText(value)}
      onChange={(next) => onChange(textToList(next))}
      minHeight={64}
      placeholder={placeholder}
    />
  );
}

function KeyValueField({
  label,
  value,
  onChange,
  placeholder = "key=value",
}: {
  label: string;
  value?: Record<string, string> | undefined;
  onChange: (value: Record<string, string>) => void;
  placeholder?: string | undefined;
}) {
  return (
    <TextareaField
      label={label}
      value={recordToText(value)}
      onChange={(next) => onChange(textToRecord(next))}
      minHeight={72}
      placeholder={placeholder}
    />
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean | undefined;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-8 items-center gap-2 rounded-md border border-border px-2 text-xs text-muted-foreground">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="min-w-0 truncate">{label}</span>
    </label>
  );
}

function listToText(value: string[] | undefined) {
  return value?.join("\n") ?? "";
}

function textToList(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function recordToText(value: Record<string, string> | undefined) {
  if (!value) return "";
  return Object.entries(value)
    .map(([key, val]) => `${key}=${val}`)
    .join("\n");
}

function textToRecord(value: string) {
  const out: Record<string, string> = {};
  for (const line of value.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [key, val = ""] = splitOnce(trimmed, "=");
    if (key.trim()) out[key.trim()] = val;
  }
  return out;
}

function updateBudgetValue(
  budget: ChatBudgetConfig | undefined,
  onChange: (budget: ChatBudgetConfig) => void,
  key: keyof ChatBudgetConfig,
  value: number | undefined,
) {
  const next: ChatBudgetConfig = { ...budget };
  if (value === undefined) {
    delete next[key];
  } else {
    next[key] = value;
  }
  onChange(next);
}

function buildPermissionCatalog(
  catalog: AISpecRuntimePermissionCatalog | undefined,
  tools: ToolMeta[],
): Required<AISpecRuntimePermissionCatalog> {
  return {
    tools:
      catalog?.tools ??
      tools.map((tool) => {
        const item: AISpecRuntimePermissionCatalogItem = {
          id: tool.name,
          label: tool.label || tool.name,
          defaultMode: toolDefaultPolicy(tool.defaultMode),
        };
        if (tool.group) item.group = tool.group;
        if (tool.description) item.description = tool.description;
        return item;
      }),
    mcp: catalog?.mcp ?? [],
    plugins: catalog?.plugins ?? [],
    skills: catalog?.skills ?? [],
  };
}

function buildPermissionEntries(
  catalog: Required<AISpecRuntimePermissionCatalog>,
  toolPolicies: AISpecRuntimeToolPolicies,
  mcp: AISpecRuntimeMCPPermissions,
  pluginModes: AISpecRuntimeResourcePolicies,
  skillModes: AISpecRuntimeResourcePolicies,
): PermissionListEntry[] {
  return [
    ...buildToolPermissionEntries(catalog.tools, toolPolicies),
    ...buildResourcePermissionEntries(
      "mcp",
      catalog.mcp,
      mcpPermissionModes(mcp),
      mcp.servers,
      mcp.disabled ? "disabled" : "enabled",
    ),
    ...buildResourcePermissionEntries("plugins", catalog.plugins, pluginModes),
    ...buildResourcePermissionEntries("skills", catalog.skills, skillModes),
  ];
}

function buildToolPermissionEntries(
  items: AISpecRuntimePermissionCatalogItem[],
  policies: AISpecRuntimeToolPolicies,
) {
  const entries: PermissionListEntry[] = [];
  const seen = new Set<string>();
  const add = (
    id: string,
    item: AISpecRuntimePermissionCatalogItem | undefined,
  ) => {
    const key = id.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    entries.push({
      id: key,
      label: item?.label || key,
      group: item?.group || "Tools",
      domain: "tools",
      mode: policies[key] ?? toolDefaultPolicy(item?.defaultMode),
      description: item?.description,
      source: item?.source,
      sourcePath: item?.sourcePath,
    });
  };
  for (const item of items) add(item.id, item);
  for (const id of Object.keys(policies)) add(id, undefined);
  return entries;
}

function buildResourcePermissionEntries(
  domain: Exclude<PermissionDomain, "tools">,
  items: AISpecRuntimePermissionCatalogItem[],
  modes: AISpecRuntimeResourcePolicies,
  extraIDs: string[] | undefined = undefined,
  defaultMode: SpecResourceMode = "enabled",
) {
  const entries: PermissionListEntry[] = [];
  const seen = new Set<string>();
  const add = (
    id: string,
    item: AISpecRuntimePermissionCatalogItem | undefined,
  ) => {
    const key = id.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    entries.push({
      id: key,
      label: item?.label || key,
      group: item?.group || permissionDomainGroup(domain),
      domain,
      mode: modes[key] ?? resourceDefaultMode(item?.defaultMode, defaultMode),
      description: item?.description,
      source: item?.source,
      sourcePath: item?.sourcePath,
    });
  };
  for (const item of items) add(item.id, item);
  for (const id of extraIDs ?? []) add(id, undefined);
  for (const id of Object.keys(modes)) add(id, undefined);
  return entries;
}

function groupPermissionEntries(entries: PermissionListEntry[]) {
  const groups = new Map<string, PermissionListEntry[]>();
  for (const entry of entries) {
    const group = entry.group || permissionDomainGroup(entry.domain);
    groups.set(group, [...(groups.get(group) ?? []), entry]);
  }
  return Array.from(groups.entries());
}

function permissionGroupMode(
  entries: PermissionListEntry[],
): PermissionListMode | "mixed" {
  const first = entries[0]?.mode;
  if (!first) return "mixed";
  return entries.every((entry) => entry.mode === first) ? first : "mixed";
}

function permissionGroupModeOptions(
  entries: PermissionListEntry[],
): readonly PermissionListMode[] {
  if (entries.length === 0) return [];
  const hasTools = entries.some((entry) => entry.domain === "tools");
  const hasResources = entries.some((entry) => entry.domain !== "tools");
  if (hasTools && hasResources) return [];
  return hasTools ? TOOL_POLICY_CYCLE : RESOURCE_MODE_CYCLE;
}

function nextPermissionMode(entry: PermissionListEntry): PermissionListMode {
  const cycle: readonly PermissionListMode[] =
    entry.domain === "tools" ? TOOL_POLICY_CYCLE : RESOURCE_MODE_CYCLE;
  const index = cycle.indexOf(entry.mode);
  if (index < 0) return cycle[0]!;
  return cycle[(index + 1) % cycle.length]!;
}

function withMCPMode(
  value: AISpecRuntimeMCPPermissions,
  id: string,
  mode: SpecResourceMode,
): AISpecRuntimeMCPPermissions {
  const next: AISpecRuntimeMCPPermissions = {
    ...normalizeMCPPermissions(value),
  };
  const servers = new Set(next.servers ?? []);
  if (mode === "enabled") servers.add(id);
  if (servers.size > 0) {
    next.servers = Array.from(servers);
  } else {
    delete next.servers;
  }
  next[id] = mode;
  return next;
}

function mcpPermissionModes(
  value: AISpecRuntimeMCPPermissions,
): AISpecRuntimeResourcePolicies {
  const out: AISpecRuntimeResourcePolicies = {};
  for (const [rawKey, rawValue] of Object.entries(value)) {
    const key = rawKey.trim();
    if (!key || key === "servers" || key === "disabled") continue;
    if (isSpecResourceMode(rawValue)) out[key] = rawValue;
  }
  return out;
}

function toolDefaultPolicy(value: unknown): SpecToolPolicy {
  if (isSpecToolPolicy(value)) return value;
  if (value === "enabled") return "auto";
  if (value === "disabled") return "deny";
  if (value === "ask") return "ask";
  return "auto";
}

function resourceDefaultMode(
  value: unknown,
  fallback: SpecResourceMode,
): SpecResourceMode {
  return isSpecResourceMode(value) ? value : fallback;
}

function permissionDomainGroup(domain: PermissionDomain) {
  switch (domain) {
    case "tools":
      return "Tools";
    case "mcp":
      return "MCP";
    case "plugins":
      return "Plugins";
    case "skills":
      return "Skills";
  }
}

function permissionAddPlaceholder(domain: PermissionDomain) {
  switch (domain) {
    case "tools":
      return "Tool name";
    case "mcp":
      return "server name";
    case "plugins":
      return "/path/to/plugin";
    case "skills":
      return "$CWD/.skills";
  }
}

function isDenyMode(mode: PermissionListMode) {
  return mode === "deny" || mode === "disabled";
}

function isSpecToolPolicy(value: unknown): value is SpecToolPolicy {
  return (
    value === "auto" || value === "ask" || value === "allow" || value === "deny"
  );
}

function isSpecResourceMode(value: unknown): value is SpecResourceMode {
  return value === "enabled" || value === "disabled";
}

function splitOnce(value: string, sep: string): [string, string?] {
  const idx = value.indexOf(sep);
  if (idx < 0) return [value];
  return [value.slice(0, idx), value.slice(idx + sep.length)];
}

function parseOptionalNumber(value: string, integer = false) {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return integer ? Math.max(0, Math.trunc(parsed)) : parsed;
}

const controlClassName =
  "h-8 w-full max-w-md rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring";
