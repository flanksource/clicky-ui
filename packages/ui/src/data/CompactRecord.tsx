import { Children, isValidElement, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Badge, type BadgeTone } from "./Badge";

export type CompactRecordStatus = {
  label: string;
  tone?: BadgeTone;
};

export type CompactRecordProps = {
  /** A product logo or glyph, e.g. an Azure DevOps pipeline for a build; sized by the row. */
  icon: ReactNode;
  title: ReactNode;
  /** Opens the record where it lives (a pipeline run, a pull request); an absolute URL opens in a new tab. */
  href?: string;
  status?: CompactRecordStatus;
  /** The secondary line, its entries separated by dots; null, false and "" entries are skipped. */
  meta?: ReactNode[];
  /** A right-aligned slot, e.g. a short SHA or a time. */
  trailing?: ReactNode;
  className?: string;
};

function present(node: ReactNode): boolean {
  return node !== null && node !== undefined && node !== false && node !== "";
}

// CompactRecord is one build, pull request, deployment or similar record as a
// single dense row: icon, title, status, and a dot-separated meta line.
export function CompactRecord({ icon, title, href, status, meta, trailing, className }: CompactRecordProps) {
  const details = (meta ?? []).filter(present);
  const external = href !== undefined && /^[a-z][a-z0-9+.-]*:\/\//i.test(href);
  return (
    <div data-compact-record className={cn("flex min-w-0 items-start gap-2.5 px-3 py-2 text-xs", className)}>
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center [&_svg]:size-5" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {href ? (
            <a
              href={href}
              className="min-w-0 truncate font-medium text-foreground hover:text-primary hover:underline"
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {title}
            </a>
          ) : (
            <span className="min-w-0 truncate font-medium text-foreground">{title}</span>
          )}
          {status ? (
            <Badge tone={status.tone ?? "neutral"} size="xs">
              {status.label}
            </Badge>
          ) : null}
        </div>
        {details.length > 0 ? (
          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 text-muted-foreground">
            {details.map((detail, index) => (
              <span key={index} className="inline-flex min-w-0 items-center gap-1.5">
                {index > 0 ? <span aria-hidden>·</span> : null}
                {detail}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {present(trailing) ? <div className="shrink-0 text-muted-foreground">{trailing}</div> : null}
    </div>
  );
}

export type CompactRecordListProps = {
  /** The heading above the records, e.g. "Builds". */
  title?: ReactNode;
  /** Shown instead of the box when there are no records. */
  emptyLabel?: ReactNode;
  className?: string;
  children?: ReactNode;
};

// CompactRecordList stacks CompactRecords in one bordered box under an
// optional heading that counts them once there is more than one.
export function CompactRecordList({ title, emptyLabel, className, children }: CompactRecordListProps) {
  const records = Children.toArray(children).filter(isValidElement);
  return (
    <section className={cn("space-y-1.5", className)} aria-label={typeof title === "string" ? title : undefined}>
      {title ? (
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
          {records.length > 1 ? <span className="tabular-nums font-normal">{records.length}</span> : null}
        </h3>
      ) : null}
      {records.length === 0 ? (
        emptyLabel ? <p className="text-xs text-muted-foreground">{emptyLabel}</p> : null
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">{records}</div>
      )}
    </section>
  );
}
