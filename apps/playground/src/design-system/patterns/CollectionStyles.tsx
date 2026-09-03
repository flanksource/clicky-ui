import { useEffect, useState, type ReactNode } from "react";
import { SegmentedControl, cn } from "@flanksource/clicky-ui";

import { useAnnotationsHidden } from "../../annotations";
import {
  UiColumns,
  UiKanban,
  UiListDashes,
  UiListTree,
  UiRows,
  UiSigma,
  UiTable,
  UiHistory,
} from "@flanksource/clicky-ui/icons";
import type { StaticIconComponent } from "@flanksource/clicky-ui";

import {
  AccordionSpecimen,
  AggregateSpecimen,
  CardsSpecimen,
  MasterDialogSpecimen,
  MasterRowDetailSpecimen,
  RowsSpecimen,
  TableSpecimen,
  TimelineSpecimen,
  TreeSpecimen,
} from "./collection-specimens";
import { ObjectArrayPattern } from "./ObjectArrayPattern";
import {
  InfiniteScrollDemo,
  LiveTailDemo,
} from "../../pages/components/logs-live-tail";

// Choosing a collection style is choosing which question the screen answers.
// Each entry below names that question first, because "which is prettier" is the
// argument teams actually have and "what is the reader trying to find out" is
// the one that settles it.

export type CollectionStyle = {
  id: string;
  label: string;
  icon: StaticIconComponent;
  /** The question this shape answers better than the others. */
  question: string;
  useWhen: readonly string[];
  avoidWhen: readonly string[];
  render: () => ReactNode;
};

export const COLLECTION_STYLES: readonly CollectionStyle[] = [
  {
    id: "table",
    label: "Data table",
    icon: UiTable,
    question: "How do these items compare on the same attributes?",
    useWhen: [
      "Every item shares the same fields and the reader compares them column by column",
      "Sorting, filtering, or paging over more rows than fit on a screen",
      "The reader will export, copy, or reconcile the values against another system",
    ],
    avoidWhen: [
      "Items have wildly different shapes, so most cells would be empty",
      "There are fewer than about five rows — a table is chrome around nothing",
      "The primary job is editing rather than scanning",
    ],
    render: () => <TableSpecimen />,
  },
  {
    id: "rows",
    label: "Summary rows",
    icon: UiListDashes,
    question: "What is each item, in one line?",
    useWhen: [
      "One identity plus a short summary carries the item; columns would be noise",
      "Items differ in what metadata they have",
      "The row is a doorway into a detail view",
    ],
    avoidWhen: [
      "The reader needs to compare a specific attribute across items",
      "Values are numeric and belong in aligned columns",
    ],
    render: () => <RowsSpecimen />,
  },
  {
    id: "cards",
    label: "Card grid",
    icon: UiKanban,
    question: "Which one do I want?",
    useWhen: [
      "Items are chosen rather than compared — catalogs, templates, integrations",
      "Each item has visual identity worth showing (logo, chart, preview)",
      "The collection is small enough to browse without paging",
    ],
    avoidWhen: [
      "More than roughly two dozen items — scanning cards costs far more than rows",
      "Attribute-by-attribute comparison matters",
    ],
    render: () => <CardsSpecimen />,
  },
  {
    id: "master-dialog",
    label: "Master → dialog",
    icon: UiColumns,
    question: "What is this one, without leaving the collection?",
    useWhen: [
      "The reader inspects items one after another inside the same filtered set",
      "Detail is large enough to need focus but still belongs to the current task",
      "The reader should dismiss the detail and continue at the same scroll position",
    ],
    avoidWhen: [
      "Detail needs the full width (long logs, wide diffs, editors)",
      "The detail contains its own deep navigation or needs a shareable URL",
    ],
    render: () => <MasterDialogSpecimen />,
  },
  {
    id: "master-row-detail",
    label: "Master → row detail",
    icon: UiColumns,
    question: "What extra context belongs directly beneath this row?",
    useWhen: [
      "The detail is short and directly explains the selected row",
      "Readers compare a few expanded records without leaving the list",
      "Opening a row should preserve the surrounding order and context",
    ],
    avoidWhen: [
      "The expanded body is a full editor or wide report",
      "Many rows need to remain expanded at once",
    ],
    render: () => <MasterRowDetailSpecimen />,
  },
  {
    id: "tree",
    label: "Tree",
    icon: UiListTree,
    question: "What contains what?",
    useWhen: [
      "Items nest, and the parent is part of the item's meaning",
      "The reader navigates down a hierarchy they already have in mind",
      "Branches can be loaded lazily as they are opened",
    ],
    avoidWhen: [
      "The hierarchy is one level deep — that is a grouped list",
      "The reader wants to compare leaves that live in different branches",
    ],
    render: () => <TreeSpecimen />,
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: UiHistory,
    question: "What happened, and in what order?",
    useWhen: [
      "Order in time is the point — activity, audit, deploys, incidents",
      "Entries are events rather than records with a current state",
      "Each entry may carry a differently shaped body",
    ],
    avoidWhen: [
      "The reader needs the current state rather than the history that produced it",
      "Entries have no meaningful ordering",
    ],
    render: () => <TimelineSpecimen />,
  },
  {
    id: "accordion",
    label: "Accordion",
    icon: UiRows,
    question: "Which of these do I need to change?",
    useWhen: [
      "The collection is edited in place and each item has its own small form",
      "The summary row carries enough identity to pick the right item unopened",
      "Items are added, removed, and reordered as part of the task",
    ],
    avoidWhen: [
      "Items are read, not edited — the disclosure is then pure friction",
      "Two items must be compared side by side while both are open",
    ],
    render: () => <AccordionSpecimen />,
  },
  {
    id: "object-array",
    label: "Object array editor",
    icon: UiRows,
    question: "How do I edit ordered, identity-rich objects?",
    useWhen: [
      "Each array item has a stable human label and a multi-field form",
      "Add, remove, reorder, and edit are all part of one configuration task",
      "Collapsed summaries let the reader find an item before opening it",
    ],
    avoidWhen: [
      "Items are scalar values that fit a multi-select or token input",
      "The collection is read-only and never needs inline editing",
    ],
    render: () => <ObjectArrayPattern />,
  },
  {
    id: "infinite-feed",
    label: "Infinite feed",
    icon: UiListDashes,
    question: "What happened before the currently loaded page?",
    useWhen: [
      "Rows are ordered events and readers naturally continue in one direction",
      "A pager would interrupt investigation more than it helps navigation",
      "The server can provide stable cursors and an explicit end condition",
    ],
    avoidWhen: [
      "Readers must jump to an exact page or report a stable row position",
      "Sorting changes frequently or the collection mutates ahead of the cursor",
    ],
    render: () => <InfiniteScrollDemo />,
  },
  {
    id: "live-tail",
    label: "Live tail",
    icon: UiHistory,
    question: "What is arriving right now?",
    useWhen: [
      "The source is actively producing ordered events",
      "Following the newest item is the default but pausing must preserve position",
      "Dropped history and reconnect state can be made explicit",
    ],
    avoidWhen: [
      "The data is a current-state collection rather than an event stream",
      "Background streaming cost is not bounded by session lifecycle",
    ],
    render: () => <LiveTailDemo />,
  },
  {
    id: "aggregate",
    label: "Aggregate first",
    icon: UiSigma,
    question: "Is anything wrong, and how much of it?",
    useWhen: [
      "The mix matters more than the members — health, coverage, budget burn",
      "The collection is far too large to read item by item",
      "Each segment can drill through to the filtered list behind it",
    ],
    avoidWhen: [
      "The reader has to act on a specific item — the aggregate cannot be the only surface",
      "Counts are small enough that the list itself is the summary",
    ],
    render: () => <AggregateSpecimen />,
  },
] as const;

export function CollectionStyleGallery() {
  const [styleId, setStyleId] = useState(() => {
    const hash = typeof window === "undefined" ? "" : window.location.hash;
    const requested = hash.startsWith("#style-") ? hash.slice(7) : "";
    return COLLECTION_STYLES.some((style) => style.id === requested)
      ? requested
      : COLLECTION_STYLES[0]!.id;
  });
  const style = COLLECTION_STYLES.find((candidate) => candidate.id === styleId);
  if (!style) throw new Error(`Unknown collection style: ${styleId}`);

  useEffect(() => {
    const selectHashStyle = () => {
      const requested = window.location.hash.startsWith("#style-")
        ? window.location.hash.slice(7)
        : "";
      if (COLLECTION_STYLES.some((candidate) => candidate.id === requested)) {
        setStyleId(requested);
      }
    };
    window.addEventListener("hashchange", selectHashStyle);
    return () => window.removeEventListener("hashchange", selectHashStyle);
  }, []);

  const selectStyle = (next: string) => {
    setStyleId(next);
    window.history.replaceState(null, "", `#style-${next}`);
  };

  return (
    <div className="space-y-density-3">
      <GuidanceCatalog styles={COLLECTION_STYLES} />
      <SegmentedControl
        value={styleId}
        onChange={selectStyle}
        aria-label="Collection style"
        wrap
        options={COLLECTION_STYLES.map(({ id, label, icon }) => ({ id, label, icon }))}
      />

      <div className="grid gap-density-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div id={`style-${style.id}`} className="min-w-0 scroll-mt-density-4">{style.render()}</div>
        <div className="space-y-density-3">
          <div className="rounded-xl border border-border bg-card p-density-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Answers</p>
            <p className="mt-1 text-sm font-medium leading-6 text-foreground">{style.question}</p>
          </div>
          <StyleGuidanceList title="Use when" items={style.useWhen} tone="use" />
          <StyleGuidanceList title="Avoid when" items={style.avoidWhen} tone="avoid" />
        </div>
      </div>
    </div>
  );
}

function GuidanceCatalog({
  styles: _styles,
}: {
  styles: typeof COLLECTION_STYLES;
}) {
  return null;
}

function StyleGuidanceList({
  title,
  items,
  tone,
}: {
  title: string;
  items: readonly string[];
  tone: "use" | "avoid";
}) {
  const annotationsHidden = useAnnotationsHidden();
  if (annotationsHidden) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-l-4 bg-card p-density-3",
        tone === "use" ? "border-border border-l-emerald-500" : "border-border border-l-rose-500",
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-density-2 space-y-density-2">
        {items.map((item) => (
          <li key={item} className="flex gap-density-2 text-xs leading-5 text-muted-foreground">
            <span
              aria-hidden
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                tone === "use" ? "bg-emerald-500" : "bg-rose-500",
              )}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CollectionStyleTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[42rem] text-sm">
        <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="p-density-3 font-medium">Style</th>
            <th className="p-density-3 font-medium">Answers</th>
            <th className="p-density-3 font-medium">Reach for something else when</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {COLLECTION_STYLES.map((style) => {
            const Icon = style.icon;
            return (
              <tr key={style.id}>
                <td className="p-density-3 align-top">
                  <span className="flex items-center gap-density-2 whitespace-nowrap text-xs font-semibold text-foreground">
                    <Icon className="size-4 text-primary" />
                    {style.label}
                  </span>
                </td>
                <td className="p-density-3 align-top text-xs leading-5 text-muted-foreground">{style.question}</td>
                <td className="p-density-3 align-top text-xs leading-5 text-muted-foreground">{style.avoidWhen[0]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
