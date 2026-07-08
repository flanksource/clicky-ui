import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/button";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { UiRobotAi } from "../../../icons";
import { cn } from "../../../lib/utils";
import { Modal } from "../../../overlay/Modal";
import { providerIcon, type ProviderGlyph } from "../../chat/provider-icons";
import type { ChatModel } from "../../chat/types";
import { SpecRuntimeEditor } from "../SpecRuntimeEditor";
import type { SpecSectionId } from "../SpecRuntimeEditor/types";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import type { SpecRuntimeFamily } from "../runtime-mode";
import {
  promptPreviewText,
  promptRuntimeValueToPayload,
  specToPromptRuntimeValue,
} from "./prompt-runtime";
import type {
  PromptPickerValue,
  PromptSpecDetail,
  PromptSpecSavePayload,
} from "./types";

export type PromptPickerFieldProps = {
  value?: PromptPickerValue | undefined;
  onChange: (value: PromptPickerValue | undefined) => void;
  title: string;
  description?: string | undefined;
  loadDetail: () => Promise<PromptSpecDetail>;
  saveDetail: (payload: PromptSpecSavePayload) => Promise<PromptSpecDetail>;
  models?: ChatModel[] | undefined;
  families?: SpecRuntimeFamily[] | undefined;
  sections?: readonly SpecSectionId[] | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
};

export type SpecEditorDialogProps = {
  open: boolean;
  title: string;
  detail: PromptSpecDetail;
  saveDetail: (payload: PromptSpecSavePayload) => Promise<PromptSpecDetail>;
  onClose: () => void;
  onSaved: (detail: PromptSpecDetail) => void;
  models?: ChatModel[] | undefined;
  families?: SpecRuntimeFamily[] | undefined;
  sections?: readonly SpecSectionId[] | undefined;
};

const DEFAULT_SECTIONS: readonly SpecSectionId[] = [
  "model",
  "prompt",
  "workspace",
  "permissions",
  "environment",
  "cli",
];

const SOURCE_OPTIONS: Array<{ id: "inline" | "file"; label: string }> = [
  { id: "inline", label: "Inline" },
  { id: "file", label: "File" },
];

const DefaultModelIcon: ProviderGlyph = ({ className }) => (
  <UiRobotAi className={className} />
);

export function PromptPickerField({
  value: _value,
  onChange,
  title,
  description,
  loadDetail,
  saveDetail,
  models,
  families,
  sections,
  className,
  disabled,
}: PromptPickerFieldProps) {
  const [detail, setDetail] = useState<PromptSpecDetail | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const load = useCallback(() => {
    setError("");
    void loadDetail()
      .then(setDetail)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "failed to load prompt");
      });
  }, [loadDetail]);

  useEffect(() => {
    load();
  }, [load]);

  const model = useMemo(() => modelDisplay(detail, models), [detail, models]);
  const prompt = promptPreviewText(detail);
  const rowTitle = [title, description, prompt].filter(Boolean).join("\n");
  const isDisabled = disabled || !detail || Boolean(error);

  const onSaved = (next: PromptSpecDetail) => {
    setDetail(next);
    if (next.source === "default") {
      onChange(undefined);
    } else {
      onChange(next.source === "file" ? { file: next.path ?? "" } : { inline: next.raw });
    }
    setEditing(false);
  };

  const Glyph = model.icon;

  return (
    <div className={cn("w-full min-w-0 max-w-full overflow-hidden", className)}>
      <button
        type="button"
        className={cn(
          "flex h-9 w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-md border border-border bg-background px-2 text-left text-sm transition-colors",
          "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-60",
          error && "border-destructive/40 text-destructive",
        )}
        title={error || rowTitle}
        aria-label={`Edit prompt ${title}`}
        disabled={isDisabled}
        onClick={() => setEditing(true)}
      >
        <Glyph className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 max-w-[40%] flex-none truncate font-medium text-foreground">
          {error ? "Prompt error" : model.label}
        </span>
        <span className="h-4 w-px shrink-0 bg-border" aria-hidden="true" />
        <span className="min-w-0 basis-0 flex-1 truncate text-muted-foreground">
          {error || (detail ? prompt : "Loading prompt...")}
        </span>
      </button>

      {editing && detail && (
        <SpecEditorDialog
          open={editing}
          title={title}
          detail={detail}
          saveDetail={saveDetail}
          onClose={() => setEditing(false)}
          onSaved={onSaved}
          models={models}
          families={families}
          sections={sections}
        />
      )}
    </div>
  );
}

export function SpecEditorDialog({
  open,
  title,
  detail,
  saveDetail,
  onClose,
  onSaved,
  models,
  families,
  sections = DEFAULT_SECTIONS,
}: SpecEditorDialogProps) {
  const [value, setValue] = useState<AISpecRuntimeValue>(() =>
    specToPromptRuntimeValue(detail.spec, detail.body),
  );
  const [source, setSource] = useState<"inline" | "file">(
    detail.source === "file" ? "file" : "inline",
  );
  const [path, setPath] = useState(detail.path ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValue(specToPromptRuntimeValue(detail.spec, detail.body));
    setSource(detail.source === "file" ? "file" : "inline");
    setPath(detail.path ?? "");
    setError("");
  }, [detail, open]);

  if (!open) return null;

  const dirty =
    JSON.stringify(value) !== JSON.stringify(specToPromptRuntimeValue(detail.spec, detail.body)) ||
    source !== (detail.source === "file" ? "file" : "inline") ||
    path !== (detail.path ?? "");

  async function save() {
    setSaving(true);
    setError("");
    const { spec, body } = promptRuntimeValueToPayload(value);
    try {
      const next = await saveDetail({
        source,
        path: source === "file" ? path : undefined,
        spec,
        body,
        baseRaw: detail.raw,
      });
      onSaved(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "save failed");
    } finally {
      setSaving(false);
    }
  }

  async function resetDefault() {
    setSaving(true);
    setError("");
    try {
      const next = await saveDetail({ source: "default", baseRaw: detail.raw });
      onSaved(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "reset failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      confirmClose={dirty}
      title={`Edit prompt · ${title}`}
      size="2xl"
      className="h-[92vh]"
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {error ? (
              <span className="whitespace-pre-wrap text-sm text-destructive">{error}</span>
            ) : detail.source !== "default" ? (
              <Button type="button" variant="ghost" size="sm" onClick={resetDefault} disabled={saving}>
                Reset to default
              </Button>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={save}
              disabled={saving || (source === "file" && path.trim() === "")}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Save to</span>
          <SegmentedControl
            size="sm"
            value={source}
            options={SOURCE_OPTIONS}
            onChange={setSource}
            aria-label="Save location"
          />
          {source === "file" && (
            <input
              type="text"
              className="flex-1 rounded-md border border-border bg-background p-1.5 font-mono text-xs"
              value={path}
              placeholder="./prompts/my-prompt.prompt"
              spellCheck={false}
              onChange={(event) => setPath(event.currentTarget.value)}
            />
          )}
        </div>

        <SpecRuntimeEditor
          value={value}
          onChange={setValue}
          models={models}
          families={families}
          sections={sections}
          showHeader={false}
        />
      </div>
    </Modal>
  );
}

function modelDisplay(
  detail: PromptSpecDetail | null,
  models: ChatModel[] | undefined,
): { label: string; icon: ProviderGlyph } {
  const modelValue = detail?.spec?.model;
  const modelID = typeof modelValue === "string" && modelValue.trim() ? modelValue.trim() : "";
  const matched = models?.find((model) => model.id === modelID || model.label === modelID);
  const provider = matched?.provider ?? inferProvider(modelID);
  return {
    label: matched?.label ?? (modelID || "Default model"),
    icon: providerIcon(provider) ?? DefaultModelIcon,
  };
}

function inferProvider(modelID: string): string | undefined {
  const model = modelID.toLowerCase();
  if (!model) return undefined;
  if (model.includes("claude") || model.includes("anthropic")) return "anthropic";
  if (model.includes("gemini") || model.includes("google")) return "gemini";
  if (
    model.includes("openai") ||
    model.includes("gpt") ||
    model.includes("codex") ||
    /^o\d/.test(model)
  ) {
    return "openai";
  }
  return undefined;
}
