import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn, DropdownMenu, useFloatingZIndex } from "@flanksource/clicky-ui";
import { UiCheck } from "@flanksource/clicky-ui/icons";
import { EDITABLE_SOURCE_ATTRIBUTE } from "../../plugins/editable-source-marker";
import {
  describeEditable,
  EDITABLE_ROOT_SELECTOR,
  findEditableRoots,
  instancesOf,
  styleOptions,
  type EditableRoot,
  type EditableTextPart,
} from "./editable-dom";
import { InlineTextEditor } from "./InlineTextEditor";
import { liveOverrideSupport } from "./react-override";
import { useVisualEdits } from "./useVisualEdits";
import { VisualEditStatus, type SourceTarget } from "./VisualEditStatus";

export type VisualEditOverlayProps = {
  root: HTMLElement | null;
  page: string;
  onOpenSource: (target: SourceTarget) => void;
  onPendingChange: (pending: boolean) => void;
};

type Focus = { node: EditableRoot; rect: DOMRect; instances: number; label: string };

const OBSERVED_ATTRIBUTES = [
  "data-box-style",
  "data-container-style",
  "data-role",
  "data-editable-source",
  "data-editable-box",
  "data-editable-container",
  "data-editable-text",
];

/** The part of `root` its nearest scrolling ancestor shows; the status panel stays inside it, clear of app chrome. */
function visibleArea(root: HTMLElement): DOMRect {
  const own = root.getBoundingClientRect();
  let scroller = root.parentElement;
  while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) scroller = scroller.parentElement;
  if (!scroller) return own;
  const view = scroller.getBoundingClientRect();
  const top = Math.max(own.top, view.top);
  const bottom = Math.min(own.bottom, view.bottom);
  return new DOMRect(own.left, top, own.width, Math.max(bottom - top, 0));
}

function labelOf(node: EditableRoot): string {
  const named = node.textParts.find((part) => part.prop === "title") ?? node.textParts[0];
  return named?.text || `${node.styleProp} node at ${node.marker?.file}:${node.marker?.line}`;
}

/** Design mode: outlines, a style picker and inline text editing over `root`, written back through the visual-edits API. */
export function VisualEditOverlay({ root, page, onOpenSource, onPendingChange }: VisualEditOverlayProps) {
  const live = useMemo(liveOverrideSupport, []);
  const edits = useVisualEdits({ page, live: live.supported });
  const zIndex = useFloatingZIndex();
  const layer = useRef<HTMLDivElement>(null);
  const [tick, bump] = useReducer((count: number) => count + 1, 0);
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  const [selected, setSelected] = useState<HTMLElement | null>(null);
  const [editing, setEditing] = useState<{ node: EditableRoot; part: EditableTextPart } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [styleSaved, setStyleSaved] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const busy = editing !== null || edits.pending;

  useEffect(() => {
    onPendingChange(busy);
  }, [busy, onPendingChange]);
  useEffect(() => () => onPendingChange(false), [onPendingChange]);

  useEffect(() => {
    if (edits.lastSaved?.edit.kind === "style") setStyleSaved(true);
  }, [edits.lastSaved]);

  useEffect(() => {
    setHovered(null);
    setSelected(null);
    setEditing(null);
    setNotice(null);
  }, [root]);

  useEffect(() => {
    if (!root) return;
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        bump();
      });
    };
    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: OBSERVED_ATTRIBUTES,
    });
    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [root]);

  useEffect(() => {
    if (!root) return;
    const rootOf = (target: EventTarget | null): HTMLElement | null => {
      const element = target instanceof Element ? target.closest<HTMLElement>(EDITABLE_ROOT_SELECTOR) : null;
      return element && root.contains(element) ? element : null;
    };
    const onMove = (event: Event) => {
      const element = rootOf(event.target);
      setHovered(element?.hasAttribute(EDITABLE_SOURCE_ATTRIBUTE) ? element : null);
    };
    const onLeave = (event: Event) => {
      const next = (event as PointerEvent).relatedTarget;
      const inChip = next instanceof Element && (layer.current?.contains(next) || next.closest('[role="menu"]'));
      if (!inChip) setHovered(null);
    };
    const onClick = (event: Event) => {
      const element = rootOf(event.target);
      if (!element) return;
      const node = describeEditable(element);
      if (node.unavailable) {
        setNotice(node.unavailable);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (busy) return;
      setNotice(null);
      setSelected(element);
      // A wrapped inline title leaves gaps between its line boxes; a click there lands on the wrapper.
      const target = event.target as Node;
      const part = node.textParts.find((candidate) =>
        candidate.element.contains(target) ||
        (target.contains(candidate.element) && target.textContent?.trim() === candidate.text.trim()),
      );
      if (part) setEditing({ node, part });
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setSelected(null);
    };
    root.addEventListener("pointermove", onMove, true);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      root.removeEventListener("pointermove", onMove, true);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [root, busy]);

  useEffect(() => {
    if (editing && !editing.part.element.isConnected) setEditing(null);
  }, [editing, tick]);

  const scan = useMemo(() => {
    if (!root) return null;
    // A node inside a hidden section (e.g. a rejected diagram) has no boxes: it cannot be seen, so it is not offered.
    const editable = findEditableRoots(root).filter((node) => !node.unavailable && node.element.getClientRects().length > 0);
    return {
      count: editable.length,
      outlines: showAll ? editable.map((node) => ({ source: node.markerValue, rect: node.element.getBoundingClientRect() })) : [],
      diagram: root.matches("[data-facet-diagram]") || root.querySelector("[data-facet-diagram]") !== null,
      rect: visibleArea(root),
    };
    // tick re-scans after DOM mutations, scrolling and resizing
  }, [root, tick, showAll]);

  const focuses = useMemo(() => {
    if (!root) return [];
    return [...new Set([hovered, selected])]
      .filter((element): element is HTMLElement => element !== null && element.isConnected)
      .map((element): Focus => {
        const node = describeEditable(element);
        if (!node.markerValue) throw new Error(node.unavailable ?? "editable node lost its source marker");
        const instances = instancesOf(root, node.markerValue).filter((other) => other.value === node.value);
        return { node, rect: element.getBoundingClientRect(), instances: instances.length, label: labelOf(node) };
      });
    // tick refreshes values and rects after DOM mutations, scrolling and resizing
  }, [root, hovered, selected, tick]);

  const pickStyle = useCallback((node: EditableRoot, value: string) => {
    if (!root || !node.markerValue || busy || value === node.value) return;
    const nodes = instancesOf(root, node.markerValue).filter((other) => other.value === node.value);
    void edits.commit({
      markerValue: node.markerValue,
      nodes: nodes.map((other) => other.element),
      edit: { kind: "style", prop: node.styleProp, value },
      previous: node.value,
    });
  }, [root, busy, edits.commit]);

  const commitText = useCallback((node: EditableRoot, part: EditableTextPart, to: string) => {
    setEditing(null);
    if (!root || !node.markerValue) return;
    const nodes = instancesOf(root, node.markerValue).filter((other) =>
      other.textParts.some((candidate) => candidate.prop === part.prop && candidate.text === part.text),
    );
    void edits.commit({
      markerValue: node.markerValue,
      nodes: nodes.map((other) => other.element),
      edit: { kind: "text", prop: part.prop, from: part.text, to },
      previous: part.text,
    });
  }, [root, edits.commit]);

  if (!root || !scan) return null;
  const selectedFocus = focuses.find((focus) => focus.node.element === selected);
  const selection =
    selectedFocus?.node.marker
      ? { label: selectedFocus.label, target: { file: selectedFocus.node.marker.file, line: selectedFocus.node.marker.line } }
      : null;

  return createPortal(
    <div ref={layer} data-testid="visual-edit-layer">
      <div className="pointer-events-none fixed inset-0" style={{ zIndex }}>
        {scan.outlines.map(({ source, rect }, index) => (
          <div
            key={index}
            data-testid="visual-edit-editable-outline"
            data-for={source}
            className="pointer-events-none fixed rounded-md border-2 border-dashed border-primary bg-primary/5"
            style={{ left: rect.left - 3, top: rect.top - 3, width: rect.width + 6, height: rect.height + 6 }}
          />
        ))}
        {focuses.map((focus) => {
          const { node, rect } = focus;
          const isSelected = node.element === selected;
          const options = styleOptions(node.kind, node.styleProp);
          return (
            <div key={isSelected ? "selected" : "hovered"}>
              <div
                data-testid="visual-edit-outline"
                className={cn("pointer-events-none fixed rounded-sm ring-primary", isSelected ? "ring-2" : "ring-1")}
                style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
              />
              {/* Flush above the node's corner: keeps its title visible and clickable, and the pointer can cross straight into it. */}
              <div className="pointer-events-auto fixed -translate-y-full" style={{ left: rect.left, top: rect.top }}>
                <DropdownMenu
                  align="left"
                  menuLabel={`${node.styleProp} options for ${focus.label}`}
                  {...(focus.instances > 1
                    ? { header: <div className="px-2 py-1 text-xs text-muted-foreground">Applies to {focus.instances} nodes</div> }
                    : {})}
                  items={options.map((option) => ({
                    label: option,
                    ...(option === node.value ? { icon: UiCheck } : {}),
                    onSelect: () => pickStyle(node, option),
                  }))}
                  trigger={
                    <button
                      type="button"
                      aria-label={`Change ${node.styleProp} of “${focus.label}” (${node.value})`}
                      className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground shadow-sm"
                    >
                      {node.styleProp}: {node.value}
                    </button>
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
      <VisualEditStatus
        rect={scan.rect}
        zIndex={zIndex}
        busy={busy}
        saving={edits.saving}
        live={live}
        lastSaved={edits.lastSaved}
        styleSaved={styleSaved}
        nodeCount={scan.count}
        showAll={showAll}
        onToggleShowAll={() => setShowAll((shown) => !shown)}
        diagram={scan.diagram}
        notice={notice}
        selected={selection}
        failure={edits.failure}
        candidates={edits.candidates}
        onOpenSource={onOpenSource}
        onDismissFailure={edits.dismissFailure}
        onChoose={(id) => void edits.choose(id)}
        onCancelChoice={edits.cancelAmbiguous}
      />
      {editing ? (
        <InlineTextEditor
          part={editing.part}
          label={labelOf(editing.node)}
          zIndex={zIndex}
          onCommit={(value) => commitText(editing.node, editing.part, value)}
          onCancel={() => setEditing(null)}
        />
      ) : null}
    </div>,
    document.body,
  );
}
