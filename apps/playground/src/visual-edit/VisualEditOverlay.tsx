import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn, DropdownMenu, useFloatingZIndex } from "@flanksource/clicky-ui";
import { UiCheck } from "@flanksource/clicky-ui/icons";
import {
  describeEditable,
  editableTargetOf,
  findEditableRoots,
  isEditableVisible,
  instancesOf,
  styleOptions,
  type EditableRoot,
  type FacetEditableRoot,
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
  selected: Element | null;
  pending: boolean;
  selectionNotice: string | null;
  onSelect: (target: EditableRoot | null) => void;
};

type Focus = { node: EditableRoot; rect: DOMRect; instances: number; label: string };

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
  if (node.kind === "svg") return node.element.textContent?.replace(/\s+/g, " ").trim().slice(0, 40) || `<${node.tag}>`;
  const named = node.textParts.find((part) => part.prop === "title") ?? node.textParts[0];
  return named?.text || `${node.styleProp} node at ${node.marker?.file}:${node.marker?.line}`;
}

/** Design mode: outlines, a style picker and inline text editing over `root`, written back through the visual-edits API. */
export function VisualEditOverlay({ root, page, onOpenSource, onPendingChange, selected, pending, selectionNotice, onSelect }: VisualEditOverlayProps) {
  const live = useMemo(liveOverrideSupport, []);
  const edits = useVisualEdits({ page, live: live.supported });
  const zIndex = useFloatingZIndex();
  const layer = useRef<HTMLDivElement>(null);
  const [tick, bump] = useReducer((count: number) => count + 1, 0);
  const [hovered, setHovered] = useState<Element | null>(null);
  const [editing, setEditing] = useState<{ node: FacetEditableRoot; part: EditableTextPart } | null>(null);
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
    const rootOf = (target: EventTarget | null): EditableRoot | null => {
      const node = target instanceof Element ? editableTargetOf(target, root) : null;
      return node && isEditableVisible(node.element) ? node : null;
    };
    const onMove = (event: Event) => {
      const node = rootOf(event.target);
      setHovered(node?.markerValue ? node.element : null);
    };
    const onLeave = (event: Event) => {
      const next = (event as PointerEvent).relatedTarget;
      const inChip = next instanceof Element && (layer.current?.contains(next) || next.closest('[role="menu"]'));
      if (!inChip) setHovered(null);
    };
    const onClick = (event: Event) => {
      const node = rootOf(event.target);
      if (!node) return;
      if (node.unavailable) {
        setNotice(node.unavailable);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (busy || pending) {
        setNotice("Save or revert the current visual edit before selecting another element");
        return;
      }
      setNotice(null);
      onSelect(node);
      if (node.kind === "svg") return;
      // A wrapped inline title leaves gaps between its line boxes; a click there lands on the wrapper.
      const target = event.target as Node;
      const part = node.textParts.find((candidate) =>
        candidate.element.contains(target) ||
        (target.contains(candidate.element) && target.textContent?.trim() === candidate.text.trim()),
      );
      if (part) setEditing({ node, part });
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy && !pending) onSelect(null);
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
  }, [root, busy, pending, onSelect]);

  useEffect(() => {
    if (editing && !editing.part.element.isConnected) setEditing(null);
  }, [editing, tick]);

  const scan = useMemo(() => {
    if (!root) return null;
    // A node inside a hidden section (e.g. a rejected diagram) has no boxes: it cannot be seen, so it is not offered.
    const editable = findEditableRoots(root).filter((node) => !node.unavailable && isEditableVisible(node.element));
    return {
      count: editable.length,
      outlines: showAll ? editable.map((node) => ({ source: node.markerValue, rect: node.element.getBoundingClientRect() })) : [],
      diagram: root.matches("[data-facet-diagram],svg") || root.querySelector("[data-facet-diagram],svg") !== null,
      rect: visibleArea(root),
    };
    // tick re-scans after DOM mutations, scrolling and resizing
  }, [root, tick, showAll]);

  const focuses = useMemo(() => {
    if (!root) return [];
    return [...new Set([hovered, selected])]
      .filter((element): element is Element => element !== null && element.isConnected && isEditableVisible(element))
      .map((element): Focus => {
        const node = describeEditable(element);
        if (!node.markerValue) throw new Error(node.unavailable ?? "editable node lost its source marker");
        const instances = instancesOf(root, node.markerValue).filter((other) => node.kind === "svg" ? other.kind === "svg" : other.kind !== "svg" && other.value === node.value);
        return { node, rect: element.getBoundingClientRect(), instances: instances.length, label: labelOf(node) };
      });
    // tick refreshes values and rects after DOM mutations, scrolling and resizing
  }, [root, hovered, selected, tick]);

  const pickStyle = useCallback((node: FacetEditableRoot, value: string) => {
    if (!root || !node.markerValue || busy || pending || value === node.value) return;
    onSelect(node);
    const nodes = instancesOf(root, node.markerValue).filter((other) => other.kind !== "svg" && other.value === node.value);
    void edits.commit({
      markerValue: node.markerValue,
      nodes: nodes.map((other) => other.element),
      edit: { kind: "style", prop: node.styleProp, value },
      previous: node.value,
    });
  }, [root, busy, pending, onSelect, edits.commit]);

  const commitText = useCallback((node: FacetEditableRoot, part: EditableTextPart, to: string) => {
    setEditing(null);
    if (!root || !node.markerValue) return;
    const nodes = instancesOf(root, node.markerValue).filter((other) =>
      other.kind !== "svg" && other.textParts.some((candidate) => candidate.prop === part.prop && candidate.text === part.text),
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
          return (
            <div key={isSelected ? "selected" : "hovered"}>
              <div
                data-testid="visual-edit-outline"
                className={cn("pointer-events-none fixed rounded-sm ring-primary", isSelected ? "ring-2" : "ring-1")}
                style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
              />
              {/* Flush above the node's corner: keeps its title visible and clickable, and the pointer can cross straight into it. */}
              {node.kind !== "svg" && <div className="pointer-events-auto fixed -translate-y-full" style={{ left: rect.left, top: rect.top }}>
                <DropdownMenu
                  align="left"
                  menuLabel={`${node.styleProp} options for ${focus.label}`}
                  {...(focus.instances > 1
                    ? { header: <div className="px-2 py-1 text-xs text-muted-foreground">Applies to {focus.instances} nodes</div> }
                    : {})}
                  items={styleOptions(node.kind, node.styleProp).map((option) => ({
                    label: option,
                    ...(option === node.value ? { icon: UiCheck } : {}),
                    onSelect: () => pickStyle(node, option),
                  }))}
                  trigger={
                    <button
                      type="button"
                      disabled={busy || pending}
                      aria-label={`Change ${node.styleProp} of “${focus.label}” (${node.value})`}
                      className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground shadow-sm"
                    >
                      {node.styleProp}: {node.value}
                    </button>
                  }
                />
              </div>}
            </div>
          );
        })}
      </div>
      <VisualEditStatus
        rect={scan.rect}
        zIndex={zIndex}
        busy={busy || pending}
        saving={edits.saving}
        live={live}
        lastSaved={edits.lastSaved}
        styleSaved={styleSaved}
        nodeCount={scan.count}
        showAll={showAll}
        onToggleShowAll={() => setShowAll((shown) => !shown)}
        diagram={scan.diagram}
        notice={notice ?? selectionNotice}
        selected={selection}
        failure={edits.failure}
        candidates={edits.candidates}
        onOpenSource={target => {
          if (busy || pending) setNotice("Save or revert the current visual edit before opening source");
          else onOpenSource(target);
        }}
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
