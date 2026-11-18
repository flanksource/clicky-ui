import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { normalizeRegion } from "./anchoring/region-anchor";
import type { RegionAnchor } from "./annotation-types";

/** A region already commented on, drawn over the image. */
export type RegionOverlayItem = {
  id: string;
  region: RegionAnchor;
  /** Accessible name and tooltip, e.g. the thread's first words. */
  label?: string;
};

export type RegionOverlayProps = {
  /** The image (or screenshot) the regions are drawn over; the overlay is sized to it. */
  children: ReactNode;
  regions: readonly RegionOverlayItem[];
  activeId?: string | undefined;
  onSelect?: ((id: string) => void) | undefined;
  /** Dragging over the image draws a new region. Needs `onDraw`. */
  drawing?: boolean | undefined;
  onDraw?: ((region: RegionAnchor) => void) | undefined;
  className?: string | undefined;
};

type Drag = { from: { x: number; y: number }; to: { x: number; y: number } };

const percent = (fraction: number) => `${Number((fraction * 100).toFixed(4))}%`;

const boxStyle = ({ x, y, w, h }: RegionAnchor): CSSProperties => ({ left: percent(x), top: percent(y), width: percent(w), height: percent(h) });

/**
 * An image with rectangles over it. Existing `regions` are placed by their
 * normalized x, y, w, h, so they stay on the same pixels at any size; with
 * `drawing` a drag over the image reports a new region to `onDraw`.
 */
export function RegionOverlay({ children, regions, activeId, onSelect, drawing = false, onDraw, className }: RegionOverlayProps) {
  if (drawing && !onDraw) throw new Error("RegionOverlay: `drawing` needs an `onDraw` handler");
  const surface = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const latest = useRef({ onDraw });
  latest.current = { onDraw };
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => stop.current?.(), []);

  const point = (event: { clientX: number; clientY: number }) => {
    const box = surface.current!.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };

  function start(event: PointerEvent<HTMLDivElement>) {
    if (!drawing || event.button !== 0) return;
    event.preventDefault();
    const from = point(event);
    const bounds = () => {
      const { width, height } = surface.current!.getBoundingClientRect();
      return { width, height };
    };
    setDrag({ from, to: from });
    const move = (next: globalThis.PointerEvent) => setDrag({ from, to: point(next) });
    const end = (next: globalThis.PointerEvent) => {
      stop.current?.();
      const region = normalizeRegion({ from, to: point(next), bounds: bounds() });
      if (region) latest.current.onDraw!(region);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    stop.current = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      stop.current = null;
      setDrag(null);
    };
  }

  const bounds = surface.current?.getBoundingClientRect();
  const draft = drag && bounds && bounds.width > 0 && bounds.height > 0 ? normalizeRegion({ ...drag, bounds }) : null;

  return (
    <div
      ref={surface}
      data-region-surface=""
      onPointerDown={start}
      className={cn("relative inline-block max-w-full select-none", drawing && "cursor-crosshair touch-none", className)}
    >
      {children}
      {regions.map(({ id, region, label }) => (
        <button
          key={id}
          type="button"
          data-region={id}
          aria-label={label ?? "Region"}
          aria-current={id === activeId ? "true" : undefined}
          title={label}
          onClick={() => onSelect?.(id)}
          style={boxStyle(region)}
          className={cn(
            "absolute rounded-sm border-2 transition-colors",
            drawing && "pointer-events-none",
            id === activeId ? "border-primary bg-primary/20" : "border-warning bg-warning/20 hover:bg-warning/30",
          )}
        />
      ))}
      {draft && <div data-region-draft="" aria-hidden style={boxStyle(draft)} className="pointer-events-none absolute rounded-sm border-2 border-dashed border-primary bg-primary/10" />}
    </div>
  );
}
