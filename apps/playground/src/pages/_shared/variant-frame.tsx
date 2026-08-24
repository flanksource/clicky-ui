import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, cn } from "@flanksource/clicky-ui";
import { UiCheck } from "@flanksource/clicky-ui/icons";

import { useAnnotationsHidden } from "../../annotations";

/**
 * Section chrome for a design alternative: title, one-line verdict, the width
 * frame it is being judged at, and — where vertical cost is the thing under
 * comparison — its live measured height.
 */
export function VariantFrame({
  title,
  verdict,
  width,
  selected = false,
  showHeight = true,
  children,
}: {
  title: string;
  verdict: string;
  width: number | undefined;
  selected?: boolean;
  showHeight?: boolean;
  children: ReactNode;
}) {
  const annotationsHidden = useAnnotationsHidden();
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!showHeight) return;
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setHeight(Math.round(entry.contentRect.height));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [showHeight]);

  if (annotationsHidden) {
    return (
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
          <div style={width == null ? undefined : { width }}>{children}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        {selected && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            <Icon icon={UiCheck} className="text-[12px]" />
            chosen
          </span>
        )}
        {showHeight && (
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            {height}px
          </span>
        )}
        <p className="text-sm text-muted-foreground">{verdict}</p>
      </header>
      <div
        className={cn(
          "overflow-x-auto rounded-lg border bg-card p-4",
          selected
            ? "border-primary/40 ring-1 ring-primary/20"
            : "border-border",
        )}
      >
        {/* Width is a runtime value, so it rides on an inline style — a dynamic
            arbitrary Tailwind class would never be emitted by the scanner. */}
        <div ref={ref} style={width == null ? undefined : { width }}>
          {children}
        </div>
      </div>
    </section>
  );
}
