import { useEffect, useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "../lib/utils";

export type ResizeHandleProps = {
  orientation: "horizontal" | "vertical";
  value: number;
  min: number;
  max: number;
  pointerFactor: number;
  label: string;
  testId?: string;
  className?: string;
  onChange: (value: number) => void;
};

export function ResizeHandle({ orientation, value, min, max, pointerFactor, label, testId, className, onChange }: ResizeHandleProps) {
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);
  const clamp = (next: number) => Math.max(min, Math.min(max, next));
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    cleanup.current?.();
    const start = orientation === "vertical" ? event.clientX : event.clientY;
    const cursor = document.body.style.cursor;
    const userSelect = document.body.style.userSelect;
    const move = (next: PointerEvent) => onChange(clamp(value + ((orientation === "vertical" ? next.clientX : next.clientY) - start) * pointerFactor));
    const end = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", end);
      document.removeEventListener("pointercancel", end);
      document.body.style.cursor = cursor;
      document.body.style.userSelect = userSelect;
      cleanup.current = null;
    };
    cleanup.current = end;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end);
    document.addEventListener("pointercancel", end);
    document.body.style.cursor = orientation === "vertical" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 48 : 16;
    if (event.key === "Home") onChange(min);
    else if (event.key === "End") onChange(max);
    else if (event.key === (orientation === "vertical" ? "ArrowLeft" : "ArrowUp")) onChange(clamp(value - step * pointerFactor));
    else if (event.key === (orientation === "vertical" ? "ArrowRight" : "ArrowDown")) onChange(clamp(value + step * pointerFactor));
    else return;
    event.preventDefault();
  };
  return <div role="separator" tabIndex={0} aria-label={label} aria-orientation={orientation}
    aria-valuemin={min} aria-valuemax={max} aria-valuenow={Math.round(value)} data-testid={testId}
    className={cn("absolute z-20 bg-border transition-colors hover:bg-primary focus-visible:bg-primary focus-visible:outline-none touch-none",
      orientation === "vertical" ? "top-0 h-full w-1 cursor-col-resize" : "left-0 h-1 w-full cursor-row-resize", className)}
    onPointerDown={onPointerDown} onKeyDown={onKeyDown} />;
}
