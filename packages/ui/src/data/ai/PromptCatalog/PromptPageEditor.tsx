import {
  SegmentedControl,
  type SegmentedOption,
} from "../../../components/SegmentedControl";
import { UiEdit, UiFileCode } from "../../../icons";
import type { ChatModel } from "../../chat/types";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import { SpecRuntimeEditor } from "../SpecRuntimeEditor";
import type { SpecSectionId } from "../SpecRuntimeEditor/types";
import {
  isValidPromptSpecDetail,
  type PromptSpecDetail,
} from "../PromptPicker/types";
import {
  draftFor,
  isDraftDirty,
  type PromptDraft,
  type PromptEditMode,
} from "./prompt-page-model";

const MODE_OPTIONS: SegmentedOption<PromptEditMode>[] = [
  { id: "structured", label: "Structured", icon: UiEdit },
  { id: "raw", label: "Raw", icon: UiFileCode },
];

const SECTIONS: readonly SpecSectionId[] = [
  "prompt",
  "model",
  "permissions",
  "environment",
  "cli",
];

const COLLAPSED_SECTIONS: readonly SpecSectionId[] = [
  "model",
  "permissions",
  "environment",
];

const TEXTAREA =
  "w-full resize-y rounded-md border border-border bg-background p-2 font-mono text-xs leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export type PromptPageEditorProps = {
  detail: PromptSpecDetail;
  draft: PromptDraft;
  onChange: (draft: PromptDraft) => void;
  readOnly: boolean;
  models?: ChatModel[] | undefined;
  families?: SpecRuntimeFamily[] | undefined;
  effectiveBackend?: string | undefined;
  effectiveModel?: string | undefined;
};

export function PromptPageEditor({
  detail,
  draft,
  onChange,
  readOnly,
  models,
  families,
  effectiveBackend,
  effectiveModel,
}: PromptPageEditorProps) {
  const dirty = isDraftDirty(draft, detail);
  const canStructure = isValidPromptSpecDetail(detail);
  const modeOptions = MODE_OPTIONS.map((option) => ({
    ...option,
    disabled: dirty && option.id !== draft.mode,
  }));

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {canStructure ? (
        <div className="flex items-center gap-2">
          <SegmentedControl
            size="sm"
            value={draft.mode}
            options={modeOptions}
            onChange={(mode) => {
              if (mode !== draft.mode) onChange(draftFor(detail, mode));
            }}
            aria-label="Editor mode"
          />
          {dirty ? (
            <span className="text-xs text-muted-foreground">
              Save or reload before switching views.
            </span>
          ) : null}
        </div>
      ) : null}
      {detail.parseError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          This document&apos;s frontmatter could not be parsed:{" "}
          {detail.parseError}. Fix the raw source and save; the structured view
          returns once it parses.
        </div>
      ) : null}
      {draft.mode === "raw" || !draft.value ? (
        <textarea
          aria-label="Prompt source"
          className={`${TEXTAREA} min-h-[24rem] flex-1`}
          value={draft.raw}
          readOnly={readOnly}
          spellCheck={false}
          onChange={(event) =>
            onChange({ ...draft, raw: event.currentTarget.value })
          }
        />
      ) : (
        <SpecRuntimeEditor
          value={draft.value}
          onChange={(value) => onChange({ ...draft, value })}
          models={models}
          families={families}
          {...(effectiveBackend ? { effectiveBackend } : {})}
          {...(effectiveModel ? { effectiveModel } : {})}
          sections={SECTIONS}
          defaultCollapsedSections={COLLAPSED_SECTIONS}
          promptVariant="document"
          readOnly={readOnly}
          showHeader={false}
          className="min-h-0 flex-1"
        />
      )}
    </div>
  );
}
