import { useEffect, useState } from "react";
import { UiCheck, UiEdit, UiFileText } from "../../icons";
import { Button } from "../../components/button";
import { MdxEditorField } from "../../components/MdxEditorField";
import { Icon } from "../Icon";
import { Markdown } from "../Markdown";
import type { SessionPlan } from "./SessionViewer.unified";

export function SessionPlanPanel({
  plan,
  onChange,
}: {
  plan: SessionPlan | undefined;
  onChange?: (content: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(plan?.content ?? "");

  useEffect(() => setContent(plan?.content ?? ""), [plan?.content]);

  if (!plan) {
    return (
      <div className="rounded-md border border-dashed border-border p-density-6 text-center text-sm text-muted-foreground">
        No plan metadata.
      </div>
    );
  }

  const updateContent = (next: string) => {
    setContent(next);
    onChange?.(next);
  };

  return (
    <section>
      <header className="flex min-w-0 items-center gap-density-2 border-b border-border px-density-1 pb-density-2">
        <Icon
          icon={UiFileText}
          className="size-4 shrink-0 text-muted-foreground"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-xs text-foreground">
            {plan.path || plan.slug || "Session plan"}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {plan.events?.length ?? 0} events
            {plan.explicit ? " · explicit" : ""}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={editing ? "Done editing plan" : "Edit plan"}
          onClick={() => setEditing((value) => !value)}
        >
          <Icon icon={editing ? UiCheck : UiEdit} />
          {editing ? "Done" : "Edit"}
        </Button>
      </header>
      {editing ? (
        <div className="pt-density-3">
          <MdxEditorField
            value={content}
            onChange={updateContent}
            aria-label="Plan markdown"
            toolbar
            headings
            lists
            links
            codeBlocks
            codeMirror
            className="min-h-80"
          />
        </div>
      ) : content ? (
        <Markdown text={content} className="px-density-1 py-density-4" />
      ) : (
        <div className="p-density-6 text-center text-sm text-muted-foreground">
          The plan is empty.
        </div>
      )}
    </section>
  );
}
