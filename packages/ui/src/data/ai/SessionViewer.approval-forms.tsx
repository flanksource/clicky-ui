import { useMemo, useState } from "react";
import { JsonSchemaForm } from "../../components/JsonSchemaForm";
import type { JsonSchemaObject } from "../../components/json-schema-form-types";
import { UiExternalLink } from "../../icons";
import { Icon } from "../Icon";
import {
  grantEntries,
  grantFromSelection,
  type ApprovalRequest,
  type ElicitationApproval,
} from "./approval-request";
import { useDecision, type DecisionHandler } from "./SessionViewer.decision";
import { DecisionActions, DecisionError } from "./SessionViewer.decision-controls";
import type { SessionEvent } from "./SessionViewer.model";

const PANEL = "mt-2 space-y-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-density-3";

interface KindControlsProps {
  event: SessionEvent;
  request: ApprovalRequest;
  onDecision: DecisionHandler;
}

/** A permissions request lists exactly what it asks for; each entry can be
 *  unticked, and the ticked subset is sent back as `grants`. */
export function PermissionsControls({ event, request, onDecision }: KindControlsProps) {
  const entries = useMemo(() => grantEntries(request.permissions ?? {}), [request]);
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(entries.map((entry) => entry.key)),
  );
  const { busy, error, decide } = useDecision(event, onDecision);
  const toggle = (key: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  return (
    <div className={PANEL}>
      {entries.length === 0 ? (
        <div role="alert" className="text-xs text-rose-600">
          This permissions request lists no grantable filesystem or network entries.
        </div>
      ) : (
        <ul className="space-y-1">
          {entries.map((entry) => (
            <li key={entry.key}>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(entry.key)}
                  onChange={() => toggle(entry.key)}
                />
                <span className="min-w-0 break-all font-mono text-xs">{entry.label}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <DecisionActions
        request={request}
        busy={busy}
        allowLabel="Allow selected"
        allowDisabled={selected.size === 0}
        allowFields={() => ({ grants: grantFromSelection(entries, selected) })}
        decide={decide}
      />
      <DecisionError message={error} />
    </div>
  );
}

function requiredFields(schema: Record<string, unknown>): string[] {
  const required = schema["required"];
  return Array.isArray(required)
    ? required.filter((name): name is string => typeof name === "string")
    : [];
}

function isFilled(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}

/** Form-mode elicitation: the server's flat schema rendered by JsonSchemaForm.
 *  Submit sends the entered values as `content`; Decline and Cancel send none. */
export function ElicitationFormControls({
  event,
  request,
  elicitation,
  onDecision,
}: KindControlsProps & { elicitation: ElicitationApproval }) {
  const [value, setValue] = useState<Record<string, unknown>>({});
  const { busy, error, decide } = useDecision(event, onDecision);
  const schema = elicitation.schema;
  const missing = schema ? requiredFields(schema).filter((name) => !isFilled(value[name])) : [];
  return (
    <div className={PANEL}>
      {schema ? (
        <JsonSchemaForm
          // The elicitation schema is untyped server JSON: a flat object of
          // primitive properties, which is what JsonSchemaForm renders.
          schema={{ type: "object", ...schema } as JsonSchemaObject}
          value={value}
          onChange={setValue}
          idPrefix={`elicit-${event.id}`}
          size="sm"
        />
      ) : (
        <div role="alert" className="text-xs text-rose-600">
          This form elicitation from {elicitation.server} carries no schema, so it cannot be filled in.
        </div>
      )}
      <DecisionActions
        request={request}
        busy={busy}
        allowLabel="Submit"
        allowDisabled={!schema || missing.length > 0}
        allowFields={() => ({
          content: Object.fromEntries(Object.entries(value).filter(([, entry]) => isFilled(entry))),
        })}
        denyLabel="Decline"
        decide={decide}
      />
      <DecisionError message={error} />
    </div>
  );
}

function safeHttpUrl(raw: string): string | undefined {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** URL-mode elicitation: the person finishes at the link, then answers Done
 *  (allow, no content), Decline (deny) or Cancel (deny + interrupt). */
export function ElicitationUrlControls({
  event,
  request,
  elicitation,
  onDecision,
}: KindControlsProps & { elicitation: ElicitationApproval }) {
  const { busy, error, decide } = useDecision(event, onDecision);
  const raw = elicitation.url ?? "";
  const href = safeHttpUrl(raw);
  return (
    <div className={PANEL}>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full items-center gap-1 break-all text-sm text-primary underline"
        >
          <Icon icon={UiExternalLink} className="size-3.5 shrink-0" />
          {href}
        </a>
      ) : (
        <div role="alert" className="break-all text-xs text-rose-600">
          Not linked because it is not an http(s) url: {raw || "(no url)"}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Finish at the link, then choose Done.
      </p>
      <DecisionActions
        request={request}
        busy={busy}
        allowLabel="Done"
        denyLabel="Decline"
        decide={decide}
      />
      <DecisionError message={error} />
    </div>
  );
}
