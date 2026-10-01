import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

export interface PanZoomTransform {
  /** Translation of the content's top-left corner inside the viewport, in px. */
  x: number;
  y: number;
  scale: number;
}

export interface PanZoomSize {
  width: number;
  height: number;
}

export interface PanZoomLimits {
  minScale: number;
  maxScale: number;
}

const DEFAULT_LIMITS: PanZoomLimits = { minScale: 0.2, maxScale: 4 };
const BUTTON_ZOOM_FACTOR = 1.25;
const WHEEL_ZOOM_RATE = 0.01;
/** Air kept between overflowing content and the viewport edge when fitting, in content px. */
const OVERFLOW_MARGIN = 8;
/** Pointer travel in px before a press becomes a pan rather than a click. */
const DRAG_THRESHOLD = 4;

/** Scales by `factor`, clamped to `limits`, keeping the content under `point` (viewport px) where it is. */
export function zoomAround(
  transform: PanZoomTransform,
  point: { x: number; y: number },
  factor: number,
  limits: PanZoomLimits = DEFAULT_LIMITS,
): PanZoomTransform {
  const scale = Math.min(limits.maxScale, Math.max(limits.minScale, transform.scale * factor));
  const ratio = scale / transform.scale;
  return {
    x: point.x - (point.x - transform.x) * ratio,
    y: point.y - (point.y - transform.y) * ratio,
    scale,
  };
}

export interface FitOptions {
  /** The smallest scale the fit shrinks to. Content too large for it overflows the viewport. */
  minScale?: number;
  /** The content point an overflowing axis is centred on. Defaults to the content's centre. */
  focus?: { x: number; y: number };
}

/** Offset of one axis: centred when the content fits, else centred on `focus` without showing past either edge. */
function fitOffset(viewport: number, content: number, focus: number, scale: number): number {
  const slack = viewport - content * scale;
  return slack >= 0 ? slack / 2 : Math.min(0, Math.max(slack, viewport / 2 - focus * scale));
}

/**
 * The transform that shows all of `content` centred in `viewport`. Content is
 * only ever shrunk to fit, never enlarged past its natural size. With
 * `fit.minScale` it is not shrunk past that either: it then overflows, centred
 * on `fit.focus`, and the rest is reached by panning. An unmeasured
 * (zero-sized) viewport yields the identity transform.
 */
export function fitTransform(
  content: PanZoomSize,
  viewport: PanZoomSize,
  limits: PanZoomLimits = DEFAULT_LIMITS,
  fit: FitOptions = {},
): PanZoomTransform {
  if (viewport.width <= 0 || viewport.height <= 0 || content.width <= 0 || content.height <= 0) {
    return { x: 0, y: 0, scale: 1 };
  }
  const whole = Math.min(1, viewport.width / content.width, viewport.height / content.height);
  const scale = Math.max(limits.minScale, Math.min(1, fit.minScale ?? 0), whole);
  const focus = fit.focus ?? { x: content.width / 2, y: content.height / 2 };
  return {
    x: fitOffset(viewport.width, content.width, focus.x, scale),
    y: fitOffset(viewport.height, content.height, focus.y, scale),
    scale,
  };
}

export interface UsePanZoomOptions {
  /** When false the hook is inert: no listeners, identity transform. */
  enabled: boolean;
  /** Natural (unscaled) size of the content being panned and zoomed. */
  contentWidth: number;
  contentHeight: number;
  /** How the content opens, and what `reset()` returns to. `fit()` ignores it and shows everything. */
  opening?: FitOptions;
}

export interface PanZoomViewportHandlers {
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
}

export interface PanZoom {
  /** Attach to the clipping viewport element. */
  viewportRef: RefObject<HTMLDivElement | null>;
  /** Attach to the content element, so anything overflowing its box is fitted too. */
  contentRef: RefObject<HTMLDivElement | null>;
  /** Spread onto the viewport element; empty when disabled. */
  handlers: Partial<PanZoomViewportHandlers>;
  /** Apply to the content as `translate(x, y) scale(scale)` with a top-left transform origin. */
  transform: PanZoomTransform;
  panning: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  /** Shows everything, however small. */
  fit: () => void;
  /** Returns to how the content opened: see `UsePanZoomOptions.opening`. */
  reset: () => void;
}

type ViewportRef = RefObject<HTMLDivElement | null>;

function viewportSize(element: HTMLElement): PanZoomSize {
  return { width: element.clientWidth, height: element.clientHeight };
}

/**
 * The content's size, counting children that overflow its box to the right or
 * below (a label hanging off its edge): they extend its scroll size, which a
 * transform leaves untouched.
 */
function overflowedSize(element: HTMLElement | null, natural: PanZoomSize): PanZoomSize {
  const overflowed = (size: number, scrolled: number | undefined) =>
    scrolled !== undefined && scrolled > size ? scrolled + OVERFLOW_MARGIN : size;
  return {
    width: overflowed(natural.width, element?.scrollWidth),
    height: overflowed(natural.height, element?.scrollHeight),
  };
}

/** Runs `refit` now and whenever the viewport is resized. */
function useViewportResize(viewportRef: ViewportRef, enabled: boolean, refit: () => void): void {
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!enabled || !viewport) return;
    refit();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(refit);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [viewportRef, enabled, refit]);
}

function useWheelZoom(
  viewportRef: ViewportRef,
  enabled: boolean,
  zoomAt: (point: { x: number; y: number }, factor: number) => void,
): void {
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!enabled || !viewport) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      zoomAt(
        { x: event.clientX - rect.left, y: event.clientY - rect.top },
        Math.exp(-event.deltaY * WHEEL_ZOOM_RATE),
      );
    };
    // React registers wheel listeners as passive, which cannot preventDefault the page zoom.
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [viewportRef, enabled, zoomAt]);
}

function useDragPan(panBy: (dx: number, dy: number) => void): {
  panning: boolean;
  handlers: PanZoomViewportHandlers;
} {
  const [panning, setPanning] = useState(false);
  const drag = useRef<{ pointerId: number; x: number; y: number; moved: boolean } | null>(null);
  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    drag.current = null;
    setPanning(false);
  };
  return {
    panning,
    handlers: {
      onPointerDown: (event) => {
        if (event.button !== 0) return;
        drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
      },
      onPointerMove: (event) => {
        const active = drag.current;
        if (!active || active.pointerId !== event.pointerId) return;
        const dx = event.clientX - active.x;
        const dy = event.clientY - active.y;
        if (!active.moved) {
          if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
          // Capturing only once a drag is under way leaves plain clicks on nodes and edges alone,
          // and retargets the click that ends a drag to the viewport so it selects nothing.
          event.currentTarget.setPointerCapture?.(event.pointerId);
          setPanning(true);
        }
        drag.current = { pointerId: active.pointerId, x: event.clientX, y: event.clientY, moved: true };
        panBy(dx, dy);
      },
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}

/**
 * Pan and zoom for a fixed-size content box inside a clipping viewport:
 * ctrl/meta + wheel (which is also what a trackpad pinch sends) zooms around
 * the pointer, dragging pans, and `zoomIn`/`zoomOut`/`fit` back a control
 * cluster. The content stays fitted to the viewport — across content and
 * viewport size changes — until the user pans or zooms, and again after
 * `fit()` or `reset()`.
 */
export function usePanZoom({ enabled, contentWidth, contentHeight, opening }: UsePanZoomOptions): PanZoom {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<PanZoomTransform>({ x: 0, y: 0, scale: 1 });
  // Which fit the content is held to, until the user pans or zooms.
  const fitted = useRef<"opening" | "everything" | undefined>("opening");
  const { minScale, focus } = opening ?? {};
  const [focusX, focusY] = [focus?.x, focus?.y];

  const refit = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !fitted.current) return;
    const content = overflowedSize(contentRef.current, { width: contentWidth, height: contentHeight });
    const fit: FitOptions =
      fitted.current === "everything"
        ? {}
        : {
            ...(minScale !== undefined ? { minScale } : {}),
            ...(focusX !== undefined && focusY !== undefined ? { focus: { x: focusX, y: focusY } } : {}),
          };
    setTransform(fitTransform(content, viewportSize(viewport), DEFAULT_LIMITS, fit));
  }, [contentWidth, contentHeight, minScale, focusX, focusY]);
  const zoomAt = useCallback((point: { x: number; y: number }, factor: number) => {
    fitted.current = undefined;
    setTransform((current) => zoomAround(current, point, factor));
  }, []);
  const zoomAtCentre = (factor: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const { width, height } = viewportSize(viewport);
    zoomAt({ x: width / 2, y: height / 2 }, factor);
  };
  const { panning, handlers } = useDragPan((dx, dy) => {
    fitted.current = undefined;
    setTransform((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
  });
  useViewportResize(viewportRef, enabled, refit);
  useWheelZoom(viewportRef, enabled, zoomAt);
  const hold = (fit: "opening" | "everything") => () => {
    fitted.current = fit;
    refit();
  };

  return {
    viewportRef,
    contentRef,
    handlers: enabled ? handlers : {},
    transform,
    panning,
    zoomIn: () => zoomAtCentre(BUTTON_ZOOM_FACTOR),
    zoomOut: () => zoomAtCentre(1 / BUTTON_ZOOM_FACTOR),
    fit: hold("everything"),
    reset: hold("opening"),
  };
}
