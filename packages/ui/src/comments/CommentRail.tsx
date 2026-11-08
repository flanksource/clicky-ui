import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { Button } from "../components/button";
import { UiComment } from "../icons";
import { Modal } from "../overlay/Modal";
import { useFloatingZIndex } from "../overlay/modalStack";
import { ResizeHandle } from "../layout/ResizeHandle";
import { useCommentRailWidth } from "./use-comment-rail-width";
import { cn } from "../lib/utils";

export type CommentRailProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  width?: number;
  onWidthChange?: (width: number) => void;
  /** Match the host's existing stacked layout. */
  stacked?: boolean;
  /** Controlled visibility: a closed rail becomes a floating launcher. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  launcherLabel?: string;
  scrollRef?: Ref<HTMLDivElement>;
};

/** A right comment rail; only the content scrolls, keeping the divider reachable. */
export function CommentRail({
  children,
  className,
  style,
  width,
  onWidthChange,
  stacked,
  scrollRef,
  open = true,
  onOpenChange,
  launcherLabel = "Open comments",
}: CommentRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current && !open) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);
  const [preferred, setPreferred] = useCommentRailWidth();
  const floatingZIndex = useFloatingZIndex();
  const [available, setAvailable] = useState(960);
  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const update = () => setAvailable(parent.clientWidth);
    update();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(parent);
    return () => observer?.disconnect();
  }, []);
  const narrow = stacked ?? available < 640;
  const max = Math.max(280, Math.min(640, available - 320));
  const actual = Math.max(280, Math.min(max, width ?? preferred));
  if (!open && !onOpenChange)
    throw new Error(
      "A closed comment rail requires onOpenChange to restore it",
    );
  if (!open || (narrow && onOpenChange)) {
    return (
      <div ref={ref} className="contents">
        {!open ? (
          <Button
            ref={launcherRef}
            type="button"
            aria-label={launcherLabel}
            title={launcherLabel}
            onClick={() => onOpenChange?.(true)}
            style={{ zIndex: floatingZIndex }}
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 h-12 gap-2 rounded-full px-4 shadow-lg"
          >
            <UiComment className="size-5" />
            {launcherLabel}
          </Button>
        ) : (
          <Modal
            open
            title="Comments"
            expandable={false}
            onClose={() => onOpenChange?.(false)}
          >
            {children}
          </Modal>
        )}
      </div>
    );
  }
  return (
    <div
      ref={ref}
      data-comment-rail=""
      className={cn(
        "relative min-h-0 shrink-0 border-border bg-background",
        narrow ? "w-full border-t" : "border-l",
        className,
      )}
      style={{ ...style, ...(!narrow ? { width: actual } : {}) }}
    >
      {!narrow && (
        <ResizeHandle
          orientation="vertical"
          value={actual}
          min={280}
          max={max}
          pointerFactor={-1}
          label="Resize comment sidebar"
          className="left-0"
          onChange={onWidthChange ?? setPreferred}
        />
      )}
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto overscroll-contain"
        data-comment-rail-scroll=""
      >
        {children}
      </div>
    </div>
  );
}
