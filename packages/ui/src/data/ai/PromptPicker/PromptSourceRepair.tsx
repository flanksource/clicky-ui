import { useEffect, useState } from "react";
import { Button } from "../../../components/button";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { Modal } from "../../../overlay/Modal";
import type {
  InvalidPromptSpecDetail,
  PromptSpecDetail,
  PromptSpecSavePayload,
} from "./types";

export type PromptSourceRepairProps = {
  open: boolean;
  title: string;
  detail: InvalidPromptSpecDetail;
  saveDetail: (payload: PromptSpecSavePayload) => Promise<PromptSpecDetail>;
  onClose: () => void;
  onSaved: (detail: PromptSpecDetail) => void;
};

const SOURCE_OPTIONS: Array<{ id: "inline" | "file"; label: string }> = [
  { id: "inline", label: "Inline" },
  { id: "file", label: "File" },
];

// PromptSourceRepair edits the raw .prompt source of an override whose
// frontmatter failed to parse. It never parses the text locally — the draft is
// submitted verbatim and the authoritative backend parser returns the precise
// error, so a rejected save keeps the draft and dialog open for another attempt.
export function PromptSourceRepair({
  open,
  title,
  detail,
  saveDetail,
  onClose,
  onSaved,
}: PromptSourceRepairProps) {
  const [draft, setDraft] = useState(detail.raw);
  const [source, setSource] = useState<"inline" | "file">(
    detail.source === "file" ? "file" : "inline",
  );
  const [path, setPath] = useState(detail.path ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(detail.raw);
    setSource(detail.source === "file" ? "file" : "inline");
    setPath(detail.path ?? "");
    setError("");
  }, [detail, open]);

  if (!open) return null;

  const dirty =
    draft !== detail.raw ||
    source !== (detail.source === "file" ? "file" : "inline") ||
    path !== (detail.path ?? "");
  const shownError = error || detail.parseError;
  const canReset = detail.source !== "default";

  async function save() {
    setSaving(true);
    setError("");
    try {
      const next = await saveDetail({
        source,
        path: source === "file" ? path : undefined,
        raw: draft,
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
      title={`Repair prompt · ${title}`}
      size="2xl"
      className="h-[92vh]"
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {canReset ? (
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
      <div className="flex h-full min-h-0 flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          This prompt&apos;s frontmatter could not be parsed. Fix the raw source below and save to
          restore it; the structured editor returns once it parses cleanly.
        </p>

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

        <textarea
          className="min-h-0 w-full flex-1 resize-none rounded-md border border-border bg-background p-2 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={draft}
          spellCheck={false}
          aria-label="Prompt source"
          onChange={(event) => setDraft(event.currentTarget.value)}
        />

        {shownError ? (
          <span className="whitespace-pre-wrap text-sm text-destructive">{shownError}</span>
        ) : null}
      </div>
    </Modal>
  );
}
