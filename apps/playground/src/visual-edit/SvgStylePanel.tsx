import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ActionError, Button, JsonSchemaForm, useFloatingZIndex, type JsonSchemaObject } from "@flanksource/clicky-ui";
import { UiClose, UiLinkExternal } from "@flanksource/clicky-ui/icons";
import type { StoredStyleEdit } from "../../plugins/comments-store";
import { EDITABLE_SOURCE_ATTRIBUTE, parseEditableSource } from "../../plugins/editable-source-marker";
import { liveOverrideSupport, readCallSiteProps } from "./react-override";
import { diffSvgAttributes, readSvgAttributes, type SvgFormValues } from "./svg-attributes";
import { svgSchemaFor } from "./svg-schemas";
import { useAnchoredPosition } from "./useAnchoredPosition";
import { useVisualEdits, type AttributeSnapshot } from "./useVisualEdits";
import type { SourceTarget } from "./VisualEditStatus";
import { SvgStyleOptions } from "./SvgStyleOptions";
import { useSvgPreviewCss } from "./useSvgPreviewCss";
import { svgPropertyClasses } from "./svg-style-values";
import { SvgTailwindField } from "./SvgTailwindField";
import { SvgDeleteButton } from "./SvgDeleteButton";

/** What a posted change request leaves behind: who it went to, if anyone, and how to reach its thread. */
export type StyleChangeRequest = { agent?: string; onFocusThread: () => void };

export type SvgStylePanelProps = {
  /** The SVG element being styled; it carries a `data-editable-source` marker. */
  element: Element;
  /** The page content; every instance of the element's call site below it previews together. */
  root: HTMLElement;
  page: string;
  onOpenSource: (target: SourceTarget) => void;
  /** Posts a refused edit as a comment for an agent. */
  requestStyleChange: (styleEdit: StoredStyleEdit) => Promise<StyleChangeRequest>;
  onClose: () => void;
  /** True while a preview is unsaved or a request is in flight. */
  onPendingChange?: (pending: boolean) => void;
};

const MAX_LABEL = 40;
/** Popups the form portals out of the panel; interacting with them is not an outside click. */
const PORTALED = '[role="listbox"],[role="option"],[role="menu"],[role="menuitem"],[role="dialog"],[data-slot="popover-content"]';

function labelOf(element: Element): string {
  const text = element.textContent?.replace(/\s+/g, " ").trim();
  if (!text) return `<${element.localName}>`;
  return text.length > MAX_LABEL ? `${text.slice(0, MAX_LABEL)}…` : text;
}

function sameAttributes(left: SvgFormValues, right: SvgFormValues): boolean {
  const names = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...names].every((name) => left[name] === right[name]);
}

/** Every element of the same call site that shows the same attributes: they preview and save as one. */
function instancesOf(root: HTMLElement, element: Element, markerValue: string, baseline: SvgFormValues): Element[] {
  const found = Array.from(root.querySelectorAll(`[${EDITABLE_SOURCE_ATTRIBUTE}]`)).filter(
    (other) =>
      other.getAttribute(EDITABLE_SOURCE_ATTRIBUTE) === markerValue &&
      other.localName === element.localName &&
      sameAttributes(readSvgAttributes(other), baseline),
  );
  return found.includes(element) ? found : [element, ...found];
}

/** A floating panel beside an SVG element: schema-driven fields previewed live, saved as literal JSX attributes. */
export function SvgStylePanel({ element, root, page, onOpenSource, requestStyleChange, onClose, onPendingChange }: SvgStylePanelProps) {
  const tag = element.localName;
  const markerValue = element.getAttribute(EDITABLE_SOURCE_ATTRIBUTE);
  if (markerValue === null) throw new Error(`<${tag}> has no ${EDITABLE_SOURCE_ATTRIBUTE}; it was not written in a page module`);
  const marker = useMemo(() => parseEditableSource(markerValue), [markerValue]);
  const schema = useMemo(() => {
    const original = svgSchemaFor(tag);
    const properties = Object.fromEntries(Object.entries(original.properties).filter(([name]) => name !== "children" || element.children.length === 0));
    return { ...original, properties: { ...properties, ...(properties.children ? { children: { ...properties.children, title: "Text content", "x-label-position": "top" } } : {}) } } as unknown as JsonSchemaObject;
  }, [tag, element]);
  const live = useMemo(liveOverrideSupport, []);
  const edits = useVisualEdits({ page, live: live.supported });
  const zIndex = useFloatingZIndex();
  const idPrefix = `svg-style-${useId().replace(/[^\w-]/g, "")}`;
  const panel = useRef<HTMLDivElement>(null);
  const position = useAnchoredPosition(element, panel);

  const [baseline, setBaseline] = useState<SvgFormValues>(() => readSvgAttributes(element));
  const [originalProps] = useState<Record<string, unknown>>(() => Object.keys(element).some(key => key.startsWith("__reactFiber$")) ? readCallSiteProps(element, markerValue) : { ...baseline });
  const [values, setValues] = useState<Record<string, unknown>>(baseline);
  const previewCss = useSvgPreviewCss(values.className);
  const [nodes] = useState(() => instancesOf(root, element, markerValue, baseline));
  /** The attributes whose preview is on screen and not yet saved, with the value shown. */
  const previewed = useRef(new Map<string, string | number | null>());
  const [localError, setLocalError] = useState<{ title: string; error: Error } | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState<StyleChangeRequest | null>(null);
  const [interactionNotice, setInteractionNotice] = useState<string | null>(null);

  const diff = useMemo(() => {
    const result = diffSvgAttributes(tag, baseline, values);
    for (const [property, value] of Object.entries(result.changes)) {
      if (value === null) continue;
      const classes = svgPropertyClasses({ classes: "className" in values ? values.className : baseline.className, property });
      const inline = (element as SVGElement).style.getPropertyValue(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`));
      if (classes.length || inline) {
        result.invalid[property] = `${property} is controlled by ${inline ? "an inline style; open source" : `${classes.join(" ")}; choose a utility or edit className`}`;
        delete result.changes[property];
      }
    }
    return result;
  }, [tag, baseline, values, element]);
  const changeNames = Object.keys(diff.changes);
  const invalidMessages = Object.values(diff.invalid);
  const busy = changeNames.length > 0 || invalidMessages.length > 0 || edits.pending || requesting;
  const busyRef = useRef(busy);
  busyRef.current = busy;

  const connected = useCallback(() => nodes.filter((node) => node.isConnected), [nodes]);

  /** Restores the baseline on every previewed attribute; returns the failure, if any. */
  const revertPreview = useCallback((): Error | null => {
    if (previewed.current.size === 0) return null;
    const target = Object.fromEntries([...previewed.current.keys()].map((name) => [name, originalProps[name] ?? null]));
    previewed.current = new Map();
    const present = connected();
    return present.length === 0 ? null : edits.previewAttributes(present, markerValue, target);
  }, [connected, edits.previewAttributes, markerValue, originalProps]);

  useEffect(() => {
    if (!live.supported) return;
    // An attribute that is mid-typing ("33.") keeps whatever is on screen until it is valid again.
    const settled = (name: string) => !(name in diff.invalid);
    const wanted = [...new Set([...previewed.current.keys(), ...changeNames])]
      .filter(settled)
      .map((name): [string, string | number | null] => [name, name in diff.changes ? diff.changes[name]! : baseline[name] ?? null]);
    const onScreen = (name: string) => previewed.current.has(name) ? previewed.current.get(name) : baseline[name] ?? null;
    const updates = wanted.filter(([name, value]) => value !== onScreen(name));
    if (updates.length === 0) return;
    for (const [name] of updates) {
      const change = diff.changes[name];
      if (change === undefined) previewed.current.delete(name);
      else previewed.current.set(name, change);
    }
    const failure = edits.previewAttributes(connected(), markerValue, Object.fromEntries(updates));
    setLocalError(failure ? { title: "Live preview failed", error: failure } : null);
  }, [diff, baseline, live.supported, connected, edits.previewAttributes, markerValue]);

  useEffect(() => {
    onPendingChange?.(busy);
  }, [busy, onPendingChange]);
  useEffect(() => () => onPendingChange?.(false), [onPendingChange]);

  useEffect(
    () => () => {
      const failure = revertPreview();
      // A panel being torn down has nowhere to show the error.
      if (failure) console.error("[playground] reverting the SVG style preview failed:", failure);
    },
    [revertPreview],
  );

  const dismiss = useCallback(() => {
    if (edits.pending || requesting) {
      setInteractionNotice("Wait for the current save or request to finish");
      return;
    }
    const failure = revertPreview();
    if (failure) {
      setLocalError({ title: "Revert failed", error: failure });
      return;
    }
    onClose();
  }, [onClose, revertPreview, edits.pending, requesting]);
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissRef.current();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || panel.current?.contains(target)) return;
      if (target instanceof Element && target.closest(PORTALED)) return;
      if (busyRef.current) {
        setInteractionNotice("Save or revert the current visual edit before selecting another element");
        return;
      }
      dismissRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  const save = async () => {
    setInteractionNotice(null);
    const saved = diff.changes;
    const previous: AttributeSnapshot = Object.fromEntries(Object.keys(saved).map((name) => [name, originalProps[name] ?? null]));
    setLocalError(null);
    setRequested(null);
    const outcome = await edits.commit({ markerValue, nodes: connected(), edit: { kind: "attributes", values: saved, ...(typeof baseline.children === "string" && "children" in saved ? { textFrom: baseline.children } : {}) }, previous });
    if (outcome !== "ambiguous") previewed.current = new Map();
    if (outcome === "applied") {
      Object.assign(originalProps, saved);
      setBaseline((current) => ({ ...current, ...saved }));
    }
  };

  const revert = () => {
    if (edits.candidates.length) edits.cancelAmbiguous();
    setInteractionNotice(null);
    const failure = revertPreview();
    setLocalError(failure ? { title: "Revert failed", error: failure } : null);
    setValues(baseline);
    setRequested(null);
    edits.dismissFailure();
  };

  const refusal = edits.failure?.refusal ?? null;
  const request = async () => {
    if (!refusal) throw new Error("there is no refused edit to request");
    const styleEdit: StoredStyleEdit = {
      marker: markerValue,
      tag,
      changes: Object.entries(diff.changes).map(([attribute, to]) => ({ attribute, from: baseline[attribute] ?? null, to })),
      refusal: { reason: refusal.reason, file: refusal.file, line: refusal.line, column: refusal.column, message: refusal.error },
    };
    setRequesting(true);
    setLocalError(null);
    try {
      setRequested(await requestStyleChange(styleEdit));
    } catch (error) {
      setLocalError({ title: "Request failed", error: error as Error });
    } finally {
      setRequesting(false);
    }
  };

  const openSource = (target: SourceTarget) => {
    if (edits.pending || requesting) {
      setInteractionNotice("Wait for the current save or request to finish");
      return;
    }
    const failure = revertPreview();
    if (failure) {
      setLocalError({ title: "Revert failed", error: failure });
      return;
    }
    onOpenSource(target);
  };
  const markerTarget: SourceTarget = { file: marker.file, line: marker.line };
  const label = labelOf(element);
  const failure = edits.failure;

  return createPortal(
    <div
      ref={panel}
      role="dialog"
      aria-label={`Style ${label}`}
      aria-busy={edits.saving ? true : undefined}
      data-svg-style-panel=""
      style={{ position: "fixed", left: position.left, top: position.top, zIndex, width: "min(520px, calc(100vw - 16px))", maxHeight: "calc(100vh - 16px)" }}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-card text-xs text-foreground shadow-lg"
    >
      <div className="flex items-start gap-density-2 border-b border-border p-density-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <code className="rounded bg-muted px-1 font-semibold">{`<${tag}>`}</code>
            {label !== `<${tag}>` ? <span className="truncate font-medium">{label}</span> : null}
          </div>
          <div className="break-all text-muted-foreground">{marker.file}:{marker.line}</div>
        </div>
        <Button type="button" size="sm" variant="outline" aria-label={`Open source of ${label}`} onClick={() => openSource(markerTarget)}>
          <UiLinkExternal />
          Open source
        </Button>
        <Button type="button" size="sm" variant="ghost" aria-label="Close style panel" onClick={dismiss}>
          <UiClose />
        </Button>
      </div>
      <div className="min-h-0 flex-1 space-y-density-2 overflow-y-auto p-density-2">
        {interactionNotice ? <p role="status">{interactionNotice}</p> : null}
        <SvgStyleOptions element={element} values={values} onChange={setValues} />
        <JsonSchemaForm
          schema={schema}
          value={values}
          onChange={setValues}
          readOnly={edits.pending}
          post={[(field, rendered, context) => {
            const property = field.key;
            if (property !== "fill" && property !== "stroke" && property !== "color" && property !== "fontSize" && property !== "strokeWidth" && property !== "opacity") return rendered;
            return { ...rendered, value: <SvgTailwindField {...(context?.fieldId ? { id: context.fieldId } : {})} element={element} property={property} values={values} baseline={baseline} disabled={edits.pending} onChange={setValues} /> };
          }]}
          size="xs"
          layout={{ mode: "inline", labelMaxWidth: "14ch", valueMaxWidth: "100%" }}
          applyDefaults={false}
          showPreferencesMenu={false}
          idPrefix={idPrefix}
        />
        <SvgDeleteButton disabled={busy && !edits.saving} saving={edits.saving} instances={root.querySelectorAll(`[${EDITABLE_SOURCE_ATTRIBUTE}="${markerValue}"]`).length} onDelete={async () => {
          if (await edits.commit({ markerValue, nodes: connected(), edit: { kind: "delete" } }) === "applied") window.location.reload();
        }} />
        {!live.supported ? <p className="text-muted-foreground">Live preview off: {live.reason}</p> : null}
        {invalidMessages.length > 0 ? (
          <ul role="status" className="list-disc pl-4 text-muted-foreground">
            {invalidMessages.map((message) => <li key={message}>{message}</li>)}
          </ul>
        ) : null}
        {localError ? <ActionError error={localError.error} title={localError.title} /> : null}
        {previewCss.error ? <ActionError error={previewCss.error} title="Tailwind preview failed" /> : null}
        {edits.candidates.length > 0 ? <div className="space-y-density-1">
          <p>Choose the source text to update:</p>
          {edits.candidates.map(candidate => <Button key={candidate.id} type="button" size="sm" variant="outline" onClick={() => void (async () => {
            const result = await edits.choose(candidate.id);
            if (result === "applied") {
              Object.assign(originalProps, diff.changes);
              setBaseline(current => ({ ...current, ...diff.changes }));
              previewed.current = new Map();
            }
          })()}>{candidate.file}:{candidate.line} {candidate.context}</Button>)}
        </div> : null}
        {failure && !requested ? (
          <ActionError
            error={failure.error}
            title={refusal ? "Cannot save in place" : failure.title}
            context={[
              ...(refusal ? ([["Reason", refusal.reason], ["Attribute", refusal.attribute ?? "unknown"]] as Array<[string, string]>) : []),
              ...(failure.location ? ([["Source", `${failure.location.file}:${failure.location.line}`]] as Array<[string, string]>) : []),
            ]}
            actions={
              <>
                {failure.location ? (
                  <Button type="button" size="sm" variant="outline" onClick={() => openSource(failure.location!)}>
                    <UiLinkExternal />
                    Open source
                  </Button>
                ) : null}
                {refusal ? (
                  <Button type="button" size="sm" disabled={requesting || changeNames.length === 0} onClick={() => void request()}>
                    {requesting ? "Requesting…" : "Request change"}
                  </Button>
                ) : null}
                <Button type="button" size="sm" variant="ghost" onClick={edits.dismissFailure}>Dismiss</Button>
              </>
            }
          />
        ) : null}
        {requested ? (
          <div role="status" className="flex flex-wrap items-center gap-density-2">
            <span className="font-semibold">Requested</span>
            <span className="text-muted-foreground">{requested.agent ? `Sent to ${requested.agent}` : "Comment created"}</span>
            <Button type="button" size="sm" variant="outline" onClick={requested.onFocusThread}>Show thread</Button>
          </div>
        ) : null}
        {edits.lastSaved && changeNames.length === 0 && !failure ? (
          <p role="status" className="text-muted-foreground">
            Saved {edits.lastSaved.file}:{edits.lastSaved.line}{live.supported ? "" : " — reload to see it"}
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-end gap-density-2 border-t border-border p-density-2">
        <Button type="button" size="sm" variant="ghost" disabled={edits.saving || (changeNames.length === 0 && invalidMessages.length === 0)} onClick={revert}>
          Revert
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={edits.pending || previewCss.pending || previewCss.error !== null || changeNames.length === 0 || invalidMessages.length > 0}
          onClick={() => void save()}
        >
          {edits.saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>,
    document.body,
  );
}
