import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiBug, UiChevronDown, UiChevronUp, UiEyeClosed, UiFullscreen } from "../icons";
import { HoverCard } from "../overlay/HoverCard";
import { Modal } from "../overlay/Modal";
import { DebugGlyph } from "./json-schema-form-debug-glyph";
import { KIND_GLYPH } from "./json-schema-form-debug-glyph-map";
import { DebugKeywords } from "./json-schema-form-debug-keywords";
import type { FieldControl, JsonSchemaProperty } from "./json-schema-form-types";

export interface FieldDebugInfo {
  fieldKey: string;
  instancePath: string;
  field: FieldControl;
  prop: JsonSchemaProperty;
  hiddenReason: string | undefined;
}

const FOOTER_BUTTON = "inline-flex items-center gap-1 rounded px-1 text-[11px] text-sky-700 hover:bg-muted dark:text-sky-300";

// FieldDebugBadge is a field's debug-mode badge: an eye-slash when the form
// would hide it, a bug otherwise, whose hover card says where it comes from.
// A field whose details outgrow the card (a screen field with a dozen
// listeners, a long query) is clamped behind "Show more", and "Open in dialog"
// shows the full details in a modal. Both states live here, not in the card,
// because the card unmounts as soon as the pointer leaves it.
export function FieldDebugBadge(info: FieldDebugInfo) {
  const { fieldKey, instancePath, field, prop, hiddenReason } = info;
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const hidden = hiddenReason !== undefined;
  return (
    <>
      <HoverCard
        placement="right"
        trigger={
          <button
            type="button"
            aria-label={`Debug ${fieldKey}`}
            className={cn(
              "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-[11px]",
              hidden ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon icon={hidden ? UiEyeClosed : UiBug} />
          </button>
        }
      >
        <ClampedCard info={info} expanded={expanded} onToggle={() => setExpanded(!expanded)} onOpenDialog={() => setDialogOpen(true)} />
      </HoverCard>
      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} title={prop.title || fieldKey} subtitle={`${instancePath || "/"} · ${field.kind}`} size="lg">
        <div data-testid="json-schema-form-debug-card-body" data-clamped="false" className="text-xs">
          <FieldDebugDetails {...info} withHeading={false} />
        </div>
      </Modal>
    </>
  );
}

function ClampedCard({
  info,
  expanded,
  onToggle,
  onOpenDialog,
}: {
  info: FieldDebugInfo;
  expanded: boolean;
  onToggle: () => void;
  onOpenDialog: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [overflows, setOverflows] = useState(false);
  // Measured only while clamped: once expanded the body has no clamp to
  // overflow, and "Show less" must stay to put it back.
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (body && !expanded) setOverflows(body.scrollHeight > body.clientHeight + 1);
  }, [expanded, info.prop, info.field.value]);
  const clamped = !expanded;
  return (
    <div data-testid="json-schema-form-debug-card" className="max-w-md space-y-1 whitespace-normal text-xs">
      <div className="relative">
        <div
          ref={bodyRef}
          data-testid="json-schema-form-debug-card-body"
          data-clamped={String(clamped)}
          className={clamped ? "max-h-80 overflow-hidden" : "max-h-[70vh] overflow-y-auto"}
        >
          <FieldDebugDetails {...info} />
        </div>
        {clamped && overflows && <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background" />}
      </div>
      <div className="flex items-center gap-1 border-t border-border pt-1">
        {overflows && (
          <button type="button" aria-expanded={expanded} onClick={onToggle} className={FOOTER_BUTTON}>
            <Icon icon={expanded ? UiChevronUp : UiChevronDown} />
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
        <button type="button" onClick={onOpenDialog} className={cn(FOOTER_BUTTON, "ml-auto")}>
          <Icon icon={UiFullscreen} />
          Open in dialog
        </button>
      </div>
    </div>
  );
}

// FieldDebugDetails is the card's content. The dialog's own header already
// names the field, so it renders without the heading.
function FieldDebugDetails({ fieldKey, instancePath, field, prop, hiddenReason, withHeading = true }: FieldDebugInfo & { withHeading?: boolean }) {
  return (
    <div className="space-y-1.5">
      {withHeading && (
        <div className="flex items-start gap-1.5">
          <DebugGlyph glyph={KIND_GLYPH[field.kind]} className="mt-0.5 size-4" />
          <div className="min-w-0">
            <div className="font-medium">{prop.title || fieldKey}</div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {instancePath || "/"} · {field.kind}
            </div>
          </div>
        </div>
      )}
      {hiddenReason !== undefined && (
        <p className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
          <Icon icon={UiEyeClosed} /> {hiddenReason}
        </p>
      )}
      {prop.description && <p className="text-muted-foreground">{prop.description}</p>}
      <DebugKeywords prop={prop} value={field.value} />
    </div>
  );
}
