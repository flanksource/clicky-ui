import { useEffect, useState } from "react";
import { UiArrowRight } from "../icons";
import { cn } from "../lib/utils";

type OverflowState = {
  overflow: boolean;
  atStart: boolean;
  atEnd: boolean;
  interacted: boolean;
};

const INITIAL_STATE: OverflowState = {
  overflow: false,
  atStart: true,
  atEnd: true,
  interacted: false,
};

export function DataTableOverflowCue({ scroll }: { scroll: HTMLDivElement | null }) {
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    if (!scroll) {
      setState(INITIAL_STATE);
      return;
    }

    const update = () => {
      const remaining = scroll.scrollWidth - scroll.clientWidth;
      const atStart = scroll.scrollLeft <= 1;
      setState((current) => ({
        overflow: remaining > 1,
        atStart,
        atEnd: remaining <= 1 || scroll.scrollLeft >= remaining - 1,
        interacted: current.interacted || !atStart,
      }));
    };

    update();
    scroll.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(update);
    observer?.observe(scroll);
    const table = scroll.querySelector("table");
    if (table) observer?.observe(table);
    return () => {
      scroll.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [scroll]);

  if (!state.overflow) return null;

  return (
    <>
      {!state.atStart ? (
        <span
          aria-hidden
          data-testid="data-table-overflow-left"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-6 bg-gradient-to-r from-background to-transparent"
        />
      ) : null}
      {!state.atEnd ? (
        <span
          aria-hidden
          data-testid="data-table-overflow-right"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-background to-transparent"
        />
      ) : null}
      {state.atStart && !state.interacted ? (
        <span
          className={cn(
            "pointer-events-none absolute right-2 top-10 z-30 inline-flex items-center gap-1 rounded-full",
            "border border-border bg-background/95 px-2 py-1 text-[10px] font-medium text-muted-foreground shadow-sm",
          )}
        >
          More columns
          <UiArrowRight aria-hidden className="size-3" />
        </span>
      ) : null}
    </>
  );
}
