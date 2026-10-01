import { InputField } from "../../components/InputField";
import { UiGitBranch, UiGitCommit } from "../../icons";
import { Icon } from "../Icon";
import type { ChatModel } from "../chat/types";
import type { RuntimeBarAction } from "../runtime/RuntimeBarActions";
import {
  SEGMENT_CAPTION_CLASS,
  SEGMENT_KEY_CLASS,
  SegmentItemLabel,
} from "../runtime/RuntimeBarSegment";
import type { SpecRuntimeFamily } from "../runtime/runtime-mode";
import { UNSPECIFIED_LABEL, unspecifiedHint } from "../runtime/unspecified";
import { permissionField } from "./PromptRunEditor/runtimeActions";
import type {
  AISpecRuntimeValue,
  SpecCommitPhase,
  SpecWorktreeMode,
} from "./SpecRuntimeEditor.model";
import {
  commitPhase,
  withCommitPhase,
  withWorktree,
  withWorktreeMode,
} from "./SpecRuntimeEditor/update";

const SOURCE_OPTIONS: { value: SpecWorktreeMode; label: string }[] = [
  { value: "new", label: "New worktree" },
  { value: "existing", label: "Existing worktree" },
  { value: "none", label: "HEAD" },
];
const COMMIT_OPTIONS: { value: SpecCommitPhase | "none"; label: string }[] = [
  { value: "none", label: "Never" },
  { value: "turn", label: "Every turn" },
  { value: "agent", label: "After the loop" },
  { value: "run", label: "End of run" },
];

export function runtimeSpecFields({
  value,
  onChange,
  families,
  models = [],
  effectiveMode,
  effectiveModel,
}: {
  value: AISpecRuntimeValue;
  onChange: (next: AISpecRuntimeValue) => void;
  families: SpecRuntimeFamily[];
  models?: ChatModel[];
  effectiveMode?: string | undefined;
  effectiveModel?: string | undefined;
}): RuntimeBarAction[] {
  const permission = permissionField({
    spec: value,
    families,
    models,
    effectiveMode,
    effectiveModel,
    onChange,
  });
  return [
    ...(permission ? [{ ...permission, label: "Permission mode" }] : []),
    sourceField({ value, onChange }),
    commitField({ value, onChange }),
  ];
}

function sourceField({
  value,
  onChange,
}: {
  value: AISpecRuntimeValue;
  onChange: (next: AISpecRuntimeValue) => void;
}): RuntimeBarAction {
  const mode = value.setup?.checkout?.worktree?.mode;
  const label =
    SOURCE_OPTIONS.find((option) => option.value === mode)?.label ??
    UNSPECIFIED_LABEL;
  return {
    id: "setup.checkout.worktree.mode",
    label: "Source",
    title: `Source — ${label}`,
    icon: UiGitBranch,
    isSet: Boolean(mode),
    caption: (
      <>
        <span className={SEGMENT_KEY_CLASS}>Source</span>
        <Icon
          icon={UiGitBranch}
          className="size-4 shrink-0 text-muted-foreground"
        />
        <span className={SEGMENT_CAPTION_CLASS}>{label}</span>
      </>
    ),
    ...(mode === "existing" || mode === "new"
      ? {
          header: (
            <div className="grid gap-1">
              <span className={SEGMENT_KEY_CLASS}>Worktree path</span>
              <InputField
                aria-label="Worktree path"
                value={value.setup?.checkout?.worktree?.path ?? ""}
                invalid={
                  mode === "existing" &&
                  !value.setup?.checkout?.worktree?.path?.trim()
                }
                onChange={(path) => onChange(withWorktree(value, { path }))}
                inputClassName="font-mono text-xs"
              />
            </div>
          ),
        }
      : {}),
    items: [
      {
        label: (
          <SegmentItemLabel
            text={UNSPECIFIED_LABEL}
            hint={unspecifiedHint()}
            selected={!mode}
          />
        ),
        onSelect: () => onChange(withWorktree(value, { mode: "" })),
      },
      ...SOURCE_OPTIONS.map((option) => ({
        label: (
          <SegmentItemLabel
            text={option.label}
            selected={mode === option.value}
          />
        ),
        onSelect: () => onChange(withWorktreeMode(value, option.value)),
      })),
    ],
  };
}

function commitField({
  value,
  onChange,
}: {
  value: AISpecRuntimeValue;
  onChange: (next: AISpecRuntimeValue) => void;
}): RuntimeBarAction {
  const isSet = value.workflow?.commits !== undefined;
  const phase = commitPhase(value);
  const label = isSet
    ? COMMIT_OPTIONS.find((option) => option.value === phase)!.label
    : UNSPECIFIED_LABEL;
  return {
    id: "workflow.commits",
    label: "Commit",
    title: `Commit — ${label}`,
    icon: UiGitCommit,
    isSet,
    caption: (
      <>
        <span className={SEGMENT_KEY_CLASS}>Commit</span>
        <Icon
          icon={UiGitCommit}
          className="size-4 shrink-0 text-muted-foreground"
        />
        <span className={SEGMENT_CAPTION_CLASS}>{label}</span>
      </>
    ),
    items: [
      {
        label: (
          <SegmentItemLabel
            text={UNSPECIFIED_LABEL}
            hint={unspecifiedHint()}
            selected={!isSet}
          />
        ),
        onSelect: () => {
          const workflow = { ...value.workflow };
          delete workflow.commits;
          const next: AISpecRuntimeValue = { ...value, workflow };
          if (Object.keys(workflow).length === 0) delete next.workflow;
          onChange(next);
        },
      },
      ...COMMIT_OPTIONS.map((option) => ({
        label: (
          <SegmentItemLabel
            text={option.label}
            selected={isSet && phase === option.value}
          />
        ),
        onSelect: () => onChange(withCommitPhase(value, option.value)),
      })),
    ],
  };
}
