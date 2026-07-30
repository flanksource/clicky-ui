import { SecretKeySelector } from "../../../components/SecretKeySelector";
import { SegmentedControl } from "../../../components/SegmentedControl";
import {
  UiClock,
  UiFolder,
  UiFolderGit,
  UiGitBranch,
  UiLink,
  UiPlug,
  UiStack,
  UiTag,
} from "../../../icons";
import {
  SPEC_STASH_MODES,
  SPEC_WORKTREE_MODES,
  type AISpecRuntimeValue,
  type SpecCheckoutMode,
  type SpecStashMode,
  type SpecWorktreeMode,
} from "../SpecRuntimeEditor.model";
import { secretValueFromString, stringFromSecretValue } from "./env-model";
import {
  CheckboxField,
  Disclosure,
  NumberField,
  SpecField,
  SpecInput,
} from "./fields";
import type { SpecRuntimeSecretSelectorConfig } from "./types";
import {
  checkoutMode,
  stashMode,
  withCheckout,
  withCheckoutMode,
  withDirty,
  withSetup,
  withStashMode,
  withWorktree,
  withWorktreeMode,
  worktreeMode,
} from "./update";

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
      mode === "none" ? "None" : mode.charAt(0).toUpperCase() + mode.slice(1),
  }));

export function WorkspaceSection({
  value,
  onChange,
  secretSelector,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
}) {
  const checkout = checkoutMode(value);
  const worktree = worktreeMode(value);
  return (
    <div className="grid gap-density-3">
      <div className="grid gap-density-2 md:grid-cols-2">
        <SpecField label="Directory">
          <SpecInput
            value={value.setup?.cwd}
            onChange={(cwd) => onChange(withSetup(value, { cwd }))}
            icon={UiFolder}
            mono
          />
        </SpecField>
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

      <div className="space-y-density-2">
        <SpecField label="Stash">
          <SegmentedControl
            aria-label="Stash mode"
            size="sm"
            value={stashMode(value)}
            onChange={(stash) => onChange(withStashMode(value, stash))}
            options={STASH_OPTIONS}
          />
        </SpecField>
        <div className="grid gap-density-2 md:grid-cols-2">
          <SpecField label="Since">
            <SpecInput
              value={value.setup?.checkout?.dirty?.since}
              onChange={(since) => onChange(withDirty(value, { since }))}
              icon={UiClock}
              mono
            />
          </SpecField>
        </div>
      </div>
    </div>
  );
}
