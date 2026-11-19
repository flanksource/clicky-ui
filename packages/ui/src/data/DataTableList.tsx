import { Fragment, type ReactNode } from "react";

export type DataTableListMetaItem = {
  key: string;
  label: string;
  content: ReactNode;
};

/** One row of the list layout: title and status on line one, meta on line two. */
export function DataTableListItem({
  title,
  status,
  meta,
}: {
  title: ReactNode;
  status: ReactNode;
  meta: DataTableListMetaItem[];
}) {
  return (
    <div data-list-item="" className="flex min-w-0 flex-col gap-0.5">
      <div className="flex min-w-0 items-start gap-2">
        <div data-list-title="" className="min-w-0 flex-1 break-words font-medium">
          {title}
        </div>
        {status != null && status !== false ? (
          <div data-list-status="" className="flex shrink-0 items-center self-center">
            {status}
          </div>
        ) : null}
      </div>
      {meta.length > 0 ? (
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
          {meta.map((item, index) => (
            <Fragment key={item.key}>
              {index > 0 ? <span aria-hidden>·</span> : null}
              <span data-list-meta={item.key} title={item.label} className="inline-flex min-w-0 items-center">
                <span className="sr-only">{item.label}: </span>
                <span data-list-meta-value="" className="inline-flex min-w-0 items-center gap-1">
                  {item.content}
                </span>
              </span>
            </Fragment>
          ))}
        </div>
      ) : null}
    </div>
  );
}
