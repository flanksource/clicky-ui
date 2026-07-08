import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/button";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Modal } from "../../overlay/Modal";
import { UiCheck, UiFileCode } from "../../icons";
import { Badge } from "../Badge";
import { Icon } from "../Icon";
import { SpecRuntimeEditor } from "../ai/SpecRuntimeEditor";
import type { SpecSectionId } from "../ai/SpecRuntimeEditor/types";
import type {
  FixtureEditorSize,
  FixtureFrontmatterEditorOptions,
} from "./types";
import {
  applyFixtureFrontmatterRaw,
  applyFixtureFrontmatterState,
  fixtureFrontmatterState,
  parseFixtureFrontmatter,
  type FixtureFrontmatterState,
} from "./fixture-frontmatter";

export type FixtureFrontmatterDialogProps = {
  open: boolean;
  markdown: string;
  onChange: (markdown: string) => void;
  onClose: () => void;
  size: FixtureEditorSize;
  options?: FixtureFrontmatterEditorOptions | undefined;
};

const EMPTY_STATE: FixtureFrontmatterState = {
  runtime: {},
  aiExtras: {},
};

type VerificationModelMode = "same" | "different";

const VERIFICATION_MODEL_OPTIONS: Array<{
  id: VerificationModelMode;
  label: string;
}> = [
  { id: "same", label: "Use same model" },
  { id: "different", label: "Use different model for verification" },
];

const DEFAULT_SECTIONS: readonly SpecSectionId[] = ["model", "prompt"];
const VERIFICATION_MODEL_SECTIONS: readonly SpecSectionId[] = [
  "model",
  "prompt",
  "environment",
];
const VERIFICATION_INHERIT_SECTIONS: readonly SpecSectionId[] = [
  "prompt",
  "environment",
];
const COLLAPSED_VERIFICATION_SECTIONS: readonly SpecSectionId[] = [
  "environment",
];

export function FixtureFrontmatterDialog({
  open,
  markdown,
  onChange,
  onClose,
  options,
}: FixtureFrontmatterDialogProps) {
  const parsed = useMemo(() => parseFixtureFrontmatter(markdown), [markdown]);
  const initialState = useMemo(
    () => (parsed.ok ? fixtureFrontmatterState(parsed.frontmatter) : EMPTY_STATE),
    [parsed],
  );
  const isVerification = options?.mode === "verification";
  const initialVerificationModelMode = useMemo<VerificationModelMode>(
    () => (hasRuntimeModelOverride(initialState.runtime) ? "different" : "same"),
    [initialState.runtime],
  );
  const [draft, setDraft] = useState<FixtureFrontmatterState>(initialState);
  const [rawDraft, setRawDraft] = useState(parsed.raw);
  const [verificationModelMode, setVerificationModelMode] =
    useState<VerificationModelMode>(initialVerificationModelMode);

  useEffect(() => {
    if (!open) return;
    setDraft(initialState);
    setRawDraft(parsed.raw);
    setVerificationModelMode(initialVerificationModelMode);
  }, [initialState, initialVerificationModelMode, open, parsed.raw]);

  const dirty = parsed.ok
    ? JSON.stringify(draft) !== JSON.stringify(initialState) ||
      (isVerification &&
        verificationModelMode !== initialVerificationModelMode)
    : rawDraft !== parsed.raw;

  const save = () => {
    const next = parsed.ok
      ? applyFixtureFrontmatterState(markdown, draft, {
          inheritModel: isVerification && verificationModelMode === "same",
        })
      : applyFixtureFrontmatterRaw(markdown, rawDraft);
    onChange(next);
    onClose();
  };

  const sections =
    isVerification && verificationModelMode === "same"
      ? VERIFICATION_INHERIT_SECTIONS
      : isVerification
        ? VERIFICATION_MODEL_SECTIONS
        : DEFAULT_SECTIONS;
  const verificationModelSelector = isVerification ? (
    <div className="pb-density-3">
      <SegmentedControl
        aria-label="Verification model"
        value={verificationModelMode}
        options={VERIFICATION_MODEL_OPTIONS}
        onChange={(mode) =>
          setVerificationModelMode(mode as VerificationModelMode)
        }
        size="lg"
        wrap
        className="w-full"
      />
    </div>
  ) : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      confirmClose={dirty}
      title="Fixture frontmatter"
      size="2xl"
      className="h-[92vh]"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {parsed.ok ? "ai / env" : "YAML source"}
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={save}>
              <Icon icon={UiCheck} className="size-4" />
              Save frontmatter
            </Button>
          </div>
        </div>
      }
    >
      {parsed.ok ? (
        <div className="min-h-0">
          <SpecRuntimeEditor
            value={draft.runtime}
            onChange={(runtime) => setDraft((current) => ({ ...current, runtime }))}
            models={options?.models}
            families={options?.families}
            tools={options?.tools}
            permissionCatalog={options?.permissionCatalog}
            secretSelector={options?.secretSelector}
            cliOptions={options?.cliOptions}
            sections={sections}
            showHeader={false}
            {...(verificationModelSelector
              ? { beforeSections: verificationModelSelector }
              : {})}
            defaultCollapsedSections={
              isVerification ? COLLAPSED_VERIFICATION_SECTIONS : undefined
            }
          />
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="status" status="error" size="xs" clickToCopy={false}>
              YAML error
            </Badge>
            <span className="text-xs text-muted-foreground">{parsed.error}</span>
          </div>
          <label className="grid gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Icon icon={UiFileCode} className="size-4" />
              Frontmatter source
            </span>
            <textarea
              aria-label="Frontmatter source"
              value={rawDraft}
              onChange={(event) => setRawDraft(event.currentTarget.value)}
              spellCheck={false}
              className="min-h-80 w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-xs leading-5 text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>
      )}
    </Modal>
  );
}

function hasRuntimeModelOverride(value: FixtureFrontmatterState["runtime"]) {
  return Boolean(
    value.model ||
      value.backend ||
      value.id ||
      value.effort ||
      value.temperature != null ||
      value.noCache ||
      value.budget,
  );
}
