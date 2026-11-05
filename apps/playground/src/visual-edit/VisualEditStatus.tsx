import { ActionError, Button, cn } from "@flanksource/clicky-ui";
import { UiLinkExternal, UiPalette } from "@flanksource/clicky-ui/icons";
import type { VisualEditCandidate } from "../../plugins/visual-edits-contract";
import type { LiveOverrideSupport } from "./react-override";
import type { SavedVisualEdit, VisualEditFailure } from "./useVisualEdits";

export type SourceTarget = { file: string; line: number };

export type VisualEditStatusProps = {
  rect: DOMRect;
  zIndex: number;
  busy: boolean;
  saving: boolean;
  live: LiveOverrideSupport;
  lastSaved: SavedVisualEdit | null;
  styleSaved: boolean;
  nodeCount: number;
  /** Every editable node is outlined, not just the hovered and selected ones. */
  showAll: boolean;
  onToggleShowAll: () => void;
  diagram: boolean;
  notice: string | null;
  selected: { label: string; target: SourceTarget } | null;
  failure: VisualEditFailure | null;
  candidates: VisualEditCandidate[];
  onOpenSource: (target: SourceTarget) => void;
  onDismissFailure: () => void;
  onChoose: (candidateId: string) => void;
  onCancelChoice: () => void;
};

function OpenSource({ target, label, onOpenSource }: { target: SourceTarget; label: string; onOpenSource: (target: SourceTarget) => void }) {
  return (
    <Button type="button" size="sm" variant="outline" aria-label={`Open source of ${label}`} onClick={() => onOpenSource(target)}>
      <UiLinkExternal />
      Open source
    </Button>
  );
}

export function VisualEditStatus(props: VisualEditStatusProps) {
  const { live, lastSaved, failure, candidates, selected } = props;
  return (
    <div
      className="pointer-events-none fixed flex flex-col items-start p-2"
      style={{ left: props.rect.left, bottom: window.innerHeight - props.rect.bottom, width: props.rect.width, zIndex: props.zIndex }}
    >
      <div
        aria-busy={props.busy ? true : undefined}
        className={cn(
          "pointer-events-auto flex max-w-[min(100%,48rem)] flex-col gap-2 rounded-md border border-border bg-background p-2 text-xs text-foreground shadow-md",
          failure || candidates.length > 0 ? "w-[min(100%,36rem)]" : "w-fit",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1 font-semibold"><UiPalette className="size-4" />Design mode</span>
          {live.supported ? (
            <span className="text-muted-foreground">Live preview on</span>
          ) : (
            <span className="text-muted-foreground">Live preview off: {live.reason}</span>
          )}
          {!live.supported && lastSaved ? (
            <span role="status">Saved — reload to see it</span>
          ) : null}
          {props.saving ? <span role="status">Saving…</span> : null}
          {props.styleSaved ? <span className="text-muted-foreground">Arrows re-measure on reload</span> : null}
          {props.nodeCount === 0 ? (
            <span role="status">{`No editable nodes on ${props.diagram ? "this diagram" : "this page"}`}</span>
          ) : (
            <Button
              type="button"
              size="sm"
              variant={props.showAll ? "default" : "outline"}
              aria-pressed={props.showAll}
              title="Outline every element Design mode can edit"
              onClick={props.onToggleShowAll}
            >
              {`Show editable (${props.nodeCount})`}
            </Button>
          )}
          {props.notice ? <span role="status">{props.notice}</span> : null}
          {selected ? (
            <span className="flex items-center gap-2">
              <span>Selected {selected.label} · {selected.target.file}:{selected.target.line}</span>
              <OpenSource target={selected.target} label={selected.label} onOpenSource={props.onOpenSource} />
            </span>
          ) : null}
        </div>
        {failure ? (
          <ActionError
            error={failure.error}
            title={failure.title}
            context={failure.location ? [["Source", `${failure.location.file}:${failure.location.line}`]] : []}
            actions={
              <>
                {failure.location ? (
                  <OpenSource target={failure.location} label={failure.location.file} onOpenSource={props.onOpenSource} />
                ) : null}
                <Button type="button" size="sm" variant="ghost" onClick={props.onDismissFailure}>Dismiss</Button>
              </>
            }
          />
        ) : null}
        {candidates.length > 0 ? (
          <div role="group" aria-label="Ambiguous text" className="flex flex-col gap-1">
            <div className="font-semibold">This text appears in {candidates.length} places. Choose the one to edit.</div>
            {candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => props.onChoose(candidate.id)}>
                  Choose {candidate.file}:{candidate.line}
                </Button>
                <code className="truncate text-muted-foreground">{candidate.context}</code>
              </div>
            ))}
            <div><Button type="button" size="sm" variant="ghost" onClick={props.onCancelChoice}>Cancel</Button></div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
