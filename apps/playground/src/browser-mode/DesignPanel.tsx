import { useEffect, useRef, useState } from "react";
import { Button, InputField, JsonSchemaForm, Modal, useCommentContext, type JsonSchemaObject } from "@flanksource/clicky-ui";
import type { DesignEdit, DesignWriteResult, FrameMessage, JsonValue } from "@flanksource/page-runtime/schema";
import type { PageBridge } from "@flanksource/page-runtime/host";
import { parseEditableSource } from "@flanksource/page-runtime/markers";
import { designEdit } from "./design-edit";
import { isSvgEditableTag, svgSchemaFor } from "../visual-edit/svg-schemas";
import { styleEditBody } from "../visual-edit/style-edit-comment";
import type { StoredStyleEdit } from "../../plugins/comments-store";
import type { PlaygroundCommentCreateInput } from "../comments/useComments";

type Props = { page: string; target: Extract<FrameMessage, { type: "design-selection" }>; bridge: PageBridge; result: DesignWriteResult | null; error: string; onPending: (pending: boolean) => void; onOpenSource: (target: { file: string; line: number }) => void };

export function DesignPanel({ page, target, bridge, result, error, onPending, onOpenSource }: Props) {
  const context = useCommentContext();
  const tag = /^<([^\s>]+)/.exec(target.selection.element.html)?.[1];
  if (!tag) throw new Error("Design selection has no element tag");
  const svg = isSvgEditableTag(tag);
  const schema = svg ? svgSchemaFor(tag) as unknown as JsonSchemaObject : null;
  const [values, setValues] = useState<Record<string, JsonValue>>(target.props);
  const [localError, setLocalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [requested, setRequested] = useState(false);
  const lastEdit = useRef<DesignEdit | null>(null);
  useEffect(() => { if (error) setSaving(false); }, [error]);
  const restore = () => bridge.send({ type: "design-override", requestId: crypto.randomUUID(), source: target.source, props: Object.fromEntries([...new Set([...Object.keys(values), ...Object.keys(target.props)])].map(name => [name, target.props[name] ?? null])) });
  useEffect(() => {
    if (!result) return;
    setSaving(false);
    if (result.status !== "ambiguous" && result.status !== "applied") restore();
  }, [result]);
  const change = (next: Record<string, unknown>) => {
    try {
      const props: Record<string, JsonValue> = Object.fromEntries(Object.entries(next).map(([name, value]) => {
        if (value !== undefined && value !== null && typeof value !== "string" && typeof value !== "number") throw new Error(`Unsupported Design value for ${name}`);
        if (typeof value === "number" && !Number.isFinite(value)) throw new Error(`${name} must be finite`);
        return [name, value ?? null];
      }));
      const previous = values;
      setValues(props); setLocalError(""); setRequested(false);
      bridge.send({ type: "design-override", requestId: crypto.randomUUID(), source: target.source, props: { ...Object.fromEntries(Object.keys(previous).filter(name => !Object.hasOwn(props, name)).map(name => [name, null])), ...props } });
      onPending(true);
    } catch (cause) { setLocalError(String(cause)); }
  };
  const save = (options: { choose?: string; edit?: DesignEdit } = {}) => {
    try {
      const edit = options.edit ?? (options.choose ? lastEdit.current : designEdit({ baseline: target.props, values, svg }));
      if (!edit) throw new Error("No Design edit is awaiting a choice");
      lastEdit.current = edit; setLocalError(""); setSaving(true); onPending(true);
      bridge.send({ type: "design-write", requestId: crypto.randomUUID(), page, source: target.source, edit, ...(options.choose ? { choose: options.choose } : {}) });
    } catch (cause) { setSaving(false); setLocalError(String(cause)); }
  };
  const requestChange = async () => {
    try {
      if (result?.status !== "refused") throw new Error("There is no refused edit to request");
      if (!context.callbacks.onCreate) throw new Error("Comment creation is not configured");
      const scalar = (value: JsonValue | undefined) => typeof value === "string" || typeof value === "number" ? value : null;
      const styleEdit: StoredStyleEdit = { marker: target.source, tag, changes: Object.entries(values).filter(([name, value]) => target.props[name] !== value).map(([attribute, value]) => ({ attribute, from: scalar(target.props[attribute]), to: scalar(value) })), refusal: { reason: result.reason, file: result.file, line: result.line, column: result.column, message: result.error } };
      const input: PlaygroundCommentCreateInput = { anchor: target.selection.anchor, body: styleEditBody(styleEdit), styleEdit };
      await context.callbacks.onCreate(input); setRequested(true); context.focusAnchor(target.selection.anchor);
    } catch (cause) { setLocalError(String(cause)); }
  };
  return <aside aria-label="Frame Design" className="max-h-[45dvh] space-y-2 overflow-auto border-t border-border bg-background p-3" aria-busy={saving}>
    <div className="flex items-center gap-2"><p className="mr-auto text-sm font-medium">{target.selection.label}</p><Button size="sm" variant="outline" disabled={saving} onClick={() => { restore(); onPending(false); onOpenSource(parseEditableSource(target.source)); }}>Open source</Button></div>
    <p className="text-xs text-muted-foreground">{target.source}</p>
    {schema ? <JsonSchemaForm schema={schema} value={values} onChange={change} readOnly={saving} size="xs" applyDefaults={false} showPreferencesMenu={false} layout={{ mode: "inline", labelMaxWidth: "14ch", valueMaxWidth: "100%" }} /> : <div className="flex flex-wrap gap-3">{Object.entries(values).filter(([name, value]) => !name.startsWith("data-") && (typeof value === "string" || typeof value === "number")).map(([name, value]) => <label key={name} className="space-y-1 text-xs">{name}<InputField aria-label={name} value={String(value)} onChange={value => change({ ...values, [name]: typeof target.props[name] === "number" && value !== "" ? Number(value) : value })} /></label>)}</div>}
    {(error || localError) && <p role="alert" className="text-sm text-destructive">{localError || error}</p>}
    {result?.status === "ambiguous" && <div className="space-y-2"><p>Choose the source text to update:</p>{result.candidates.map(candidate => <Button key={candidate.id} variant="outline" disabled={saving} onClick={() => save({ choose: candidate.id })}>{candidate.file}:{candidate.line} {candidate.context}</Button>)}</div>}
    {result?.status === "refused" && !requested && <Button disabled={saving} onClick={() => { void requestChange(); }}>Request change</Button>}
    {requested && <p role="status">Change requested in feedback.</p>}
    <div className="flex gap-2"><Button disabled={saving} onClick={() => save()}>Save style</Button><Button variant="outline" disabled={saving} onClick={() => { restore(); setValues(target.props); setLocalError(""); onPending(false); }}>Discard style</Button><Button variant="destructive" disabled={saving} onClick={() => setDeleting(true)}>Delete element</Button></div>
    <Modal open={deleting} onClose={() => setDeleting(false)} title="Delete element" size="sm" footer={<Button variant="destructive" onClick={() => { setDeleting(false); save({ edit: { kind: "delete" } }); }}>Delete source</Button>}><p>Remove this element from {page} source? Every instance of this source call site will be removed.</p></Modal>
  </aside>;
}
