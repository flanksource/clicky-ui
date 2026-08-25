import { SecretKeySelector } from "../../../components/SecretKeySelector";
import { SegmentedControl } from "../../../components/SegmentedControl";
import {
  UiFolder,
  UiFolderGit,
  UiGitBranch,
  UiLink,
  UiPlug,
  UiStack,
  UiTag,
} from "../../../icons";
import {
  SPEC_CLONE_MODES,
  SPEC_WORKTREE_MODES,
  type AISpecRuntimeValue,
  type SpecCheckoutMode,
  type SpecCloneMode,
  type SpecWorktreeMode,
} from "../SpecRuntimeEditor.model";
import { secretValueFromString, stringFromSecretValue } from "./env-model";
import {
  CheckboxField,
  Disclosure,
  NumberField,
  SpecField,
  SpecInput,
  SpecSelect,
} from "./fields";
import type { SpecRuntimeSecretSelectorConfig } from "./types";
import {
  checkoutMode,
  withCheckout,
  withCheckoutMode,
  withSetup,
  withWorktree,
  withWorktreeMode,
  worktreeMode,
} from "./update";
import {
  SUPPORT_ALL_RUNTIME_FIELDS,
  type RuntimeFieldSupport,
} from "../../runtime/runtime-field-support";

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
export function WorkspaceSection({
  value,
  onChange,
  secretSelector,
  variant = "run",
  supports = SUPPORT_ALL_RUNTIME_FIELDS,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  variant?: "run" | "preset" | undefined;
  supports?: RuntimeFieldSupport | undefined;
}) {
  const checkout = checkoutMode(value);
  const worktree = worktreeMode(value);
  if (variant === "preset") {
    const cloneOptions = [
      { value: "", label: "Inherit" },
      ...SPEC_CLONE_MODES.map((mode) => ({
        value: mode,
        label: mode === "clone" ? "Clone" : "Skip",
      })),
    ];
    return (
      <div className="grid gap-density-3">
        <div className="space-y-density-2">
          <SpecField label="Git checkout behavior">
            <SegmentedControl
              aria-label="Checkout source"
              size="sm"
              value={checkout}
              onChange={(mode) => onChange(withCheckoutMode(value, mode))}
              options={CHECKOUT_OPTIONS}
            />
          </SpecField>
          <div className="grid gap-density-2 md:grid-cols-2">
            <NumberField
              label="Clone depth"
              value={value.setup?.checkout?.depth}
              onChange={(depth) =>
                onChange(withCheckout(value, { depth: depth ?? 0 }))
              }
              icon={UiStack}
              min={0}
              step={1}
              integer
            />
          </div>
        </div>
        <div className="space-y-density-2">
          <SpecField label="Worktree behavior">
            <SegmentedControl
              aria-label="Worktree mode"
              size="sm"
              value={worktree}
              onChange={(mode) => onChange(withWorktreeMode(value, mode))}
              options={WORKTREE_OPTIONS}
            />
          </SpecField>
          <div className="grid gap-density-2 md:grid-cols-2">
            <SpecField label="Uncommitted files" composite>
              <SpecSelect
                ariaLabel="Uncommitted files"
                value={value.setup?.checkout?.worktree?.uncommitted ?? ""}
                onChange={(uncommitted) =>
                  onChange(
                    withWorktree(value, {
                      uncommitted: uncommitted as SpecCloneMode | "",
                    }),
                  )
                }
                options={cloneOptions}
              />
            </SpecField>
            <SpecField label="Ignored files" composite>
              <SpecSelect
                ariaLabel="Ignored files"
                value={value.setup?.checkout?.worktree?.ignored ?? ""}
                onChange={(ignored) =>
                  onChange(
                    withWorktree(value, {
                      ignored: ignored as SpecCloneMode | "",
                    }),
                  )
                }
                options={cloneOptions}
              />
            </SpecField>
          </div>
          <div className="max-w-64">
            <CheckboxField
              label="Keep worktree after run"
              checked={value.setup?.checkout?.worktree?.keep}
              onChange={(keep) => onChange(withWorktree(value, { keep }))}
            />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-density-3">
      <div className="grid gap-density-2 md:grid-cols-2">
        {supports("setup.cwd") && (
          <SpecField label="Directory">
            <SpecInput
              value={value.setup?.cwd}
              onChange={(cwd) => onChange(withSetup(value, { cwd }))}
              icon={UiFolder}
              mono
            />
          </SpecField>
        )}
        <SpecField label="Base dir">
          <SpecInput
            value={value.setup?.baseDir}
            onChange={(baseDir) => onChange(withSetup(value, { baseDir }))}
            icon={UiFolder}
            mono
          />
        </SpecField>
      </div>

      <div className="space-y-density-2">
        <SpecField label="Git checkout">
          <SegmentedControl
            aria-label="Checkout source"
            size="sm"
            value={checkout}
            onChange={(mode) => onChange(withCheckoutMode(value, mode))}
            options={CHECKOUT_OPTIONS}
          />
        </SpecField>
        {checkout !== "none" && (
          <>
            <div className="grid gap-density-2 md:grid-cols-[minmax(0,1fr)_9rem_6rem]">
              {checkout === "local" ? (
                <SpecField label="Local path">
                  <SpecInput
                    value={value.setup?.checkout?.path}
                    onChange={(path) => onChange(withCheckout(value, { path }))}
                    placeholder="/repo"
                    icon={UiFolderGit}
                    mono
                  />
                </SpecField>
              ) : (
                <SpecField label="Git URL">
                  <SpecInput
                    value={value.setup?.checkout?.url}
                    onChange={(url) => onChange(withCheckout(value, { url }))}
                    placeholder="https://github.com/org/repo.git"
                    icon={UiLink}
                    mono
                  />
                </SpecField>
              )}
              <SpecField label="Ref">
                <SpecInput
                  value={value.setup?.checkout?.ref}
                  onChange={(ref) => onChange(withCheckout(value, { ref }))}
                  placeholder="main"
                  icon={UiGitBranch}
                  mono
                />
              </SpecField>
              <NumberField
                label="Depth"
                value={value.setup?.checkout?.depth}
                onChange={(depth) =>
                  onChange(withCheckout(value, { depth: depth ?? 0 }))
                }
                icon={UiStack}
                min={0}
                step={1}
                integer
              />
            </div>
            {checkout !== "local" && (
              <Disclosure label="Advanced" hint="connection">
                <SpecField label="Connection">
                  {secretSelector ? (
                    <SecretKeySelector
                      value={secretValueFromString(
                        value.setup?.checkout?.connection,
                      )}
                      onChange={(next) =>
                        onChange(
                          withCheckout(value, {
                            connection: stringFromSecretValue(next),
                          }),
                        )
                      }
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
                      value={value.setup?.checkout?.connection}
                      onChange={(connection) =>
                        onChange(withCheckout(value, { connection }))
                      }
                      placeholder="github"
                      icon={UiPlug}
                      mono
                    />
                  )}
                </SpecField>
              </Disclosure>
            )}
          </>
        )}
      </div>

      <div className="space-y-density-2">
        <SpecField label="Worktree">
          <SegmentedControl
            aria-label="Worktree mode"
            size="sm"
            value={worktree}
            onChange={(mode) => onChange(withWorktreeMode(value, mode))}
            options={WORKTREE_OPTIONS}
          />
        </SpecField>
        {worktree !== "none" && (
          <>
            <div className="grid gap-density-2 md:grid-cols-3">
              {worktree === "new" && (
                <>
                  <SpecField label="Worktree prefix">
                    <SpecInput
                      value={value.setup?.checkout?.worktree?.prefix}
                      onChange={(prefix) =>
                        onChange(withWorktree(value, { prefix }))
                      }
                      placeholder="ai"
                      icon={UiTag}
                      mono
                    />
                  </SpecField>
                  <SpecField label="Worktree base">
                    <SpecInput
                      value={value.setup?.checkout?.worktree?.base}
                      onChange={(base) =>
                        onChange(withWorktree(value, { base }))
                      }
                      icon={UiGitBranch}
                      mono
                    />
                  </SpecField>
                </>
              )}
              <SpecField label="Worktree path">
                <SpecInput
                  value={value.setup?.checkout?.worktree?.path}
                  onChange={(path) => onChange(withWorktree(value, { path }))}
                  icon={UiFolder}
                  mono
                />
              </SpecField>
            </div>
            {worktree === "new" && (
              <div className="grid gap-density-2 sm:grid-cols-[minmax(10rem,16rem)]">
                <CheckboxField
                  label="Keep worktree"
                  checked={value.setup?.checkout?.worktree?.keep}
                  onChange={(keep) => onChange(withWorktree(value, { keep }))}
                />
              </div>
            )}
          </>
        )}
      </div>

      <SpecField
        label="Report changes since"
        hint="merge-base used only to report changed files"
      >
        <SpecInput
          ariaLabel="Report changes since"
          value={value.setup?.checkout?.since}
          onChange={(since) => onChange(withCheckout(value, { since }))}
          placeholder="origin/main"
          icon={UiGitBranch}
          mono
        />
      </SpecField>
    </div>
  );
}
