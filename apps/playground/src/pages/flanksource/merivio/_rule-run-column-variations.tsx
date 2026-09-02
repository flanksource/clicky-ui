import { useId, useState, type ReactNode } from "react";
import { Badge, Button, cn } from "@flanksource/clicky-ui";

import { ReviewVariant } from "../../../review/ReviewComponents";
import { categoryTokens, executionTokens } from "../_merivio/category-tokens";
import { RULES, type ExecutionState, type RuleRow } from "./_rule-run-buttons-data";
import { ICON_CONTROL, ICON_META, RuleIdentity, TargetBadge } from "./_rule-run-parts";

type ColumnVariant = "badges" | "descriptive" | "signal-rail";

const INACTIVE_REASON = "This rule is inactive for the selected entity.";

/** Seeded from the fixture so the column study and the A–E tables agree on each row. */
const INITIAL_STATES: Record<string, ExecutionState> = Object.fromEntries(
  RULES.map((row) => [row.id, row.execution]),
);

const COLUMN_VARIANTS: readonly {
  id: ColumnVariant;
  title: string;
  verdict: string;
}[] = [
  {
    id: "badges",
    title: "D1 · Paired badges",
    verdict:
      "Keeps target and execution state equally scannable, with the state-changing commands sitting directly beside the badge they act on.",
  },
  {
    id: "descriptive",
    title: "D2 · Descriptive columns",
    verdict:
      "Adds destination and lifecycle context for less frequent operators without making the Run, Pause, Resume, or Stop control ambiguous.",
  },
  {
    id: "signal-rail",
    title: "D3 · Status signal band",
    verdict:
      "Tints the Status cell by what the row is doing — running, paused, ready, inactive — so live work reads across a dense table. The tint tracks execution state, never the rule's account class.",
  },
];

const STATE_META: Record<
  ExecutionState,
  {
    label: string;
    detail: string;
    tone: "success" | "warning" | "neutral";
    badge: "soft" | "outline";
  }
> = {
  // "Ready" and "Inactive" previously shared one neutral soft badge, so "available to
  // run" and "switched off" were indistinguishable. Outline marks the disabled one,
  // matching StateBadge in the A–E tables.
  stopped: { label: "Ready", detail: "Available to run", tone: "neutral", badge: "soft" },
  running: { label: "Running", detail: "Execution in progress", tone: "success", badge: "soft" },
  paused: { label: "Paused", detail: "Waiting for resume", tone: "warning", badge: "soft" },
  inactive: { label: "Inactive", detail: "Switched off for this entity", tone: "neutral", badge: "outline" },
};

/** Non-tautological: restating "Journal — creates journal entries" tells nobody anything. */
const TARGET_DETAIL: Record<RuleRow["target"], string> = {
  "Sub-ledger": "Updates counterparty balances",
  Journal: "Posts double-entry lines",
};

function HeaderCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "px-density-3 py-density-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--mv-muted)]",
        className,
      )}
    >
      {children}
    </th>
  );
}

function TargetCell({ row, variant }: { row: RuleRow; variant: ColumnVariant }) {
  const category = categoryTokens(row.category);
  if (variant === "badges") return <TargetBadge row={row} />;

  return (
    <span className="flex items-center gap-density-2">
      <span
        className="grid size-7 shrink-0 place-items-center rounded-md border"
        style={{ color: category.accent, backgroundColor: category.soft, borderColor: category.line }}
      >
        <iconify-icon
          icon={row.target === "Sub-ledger" ? "ph:stack-thin" : "ph:notebook-thin"}
          width={ICON_META}
          height={ICON_META}
        />
      </span>
      <span>
        <span className="block text-xs font-medium text-[var(--mv-ink)]">{row.target}</span>
        {variant === "descriptive" && (
          <span className="block text-[10px] text-[var(--mv-muted)]">{TARGET_DETAIL[row.target]}</span>
        )}
      </span>
    </span>
  );
}

function ControlButton({
  label,
  icon,
  accent,
  reasonId,
  unavailable,
  onActivate,
}: {
  label: string;
  icon: `ph:${string}-thin`;
  accent?: string;
  reasonId?: string;
  unavailable?: boolean;
  onActivate: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("relative z-10 size-8 shrink-0", unavailable && "cursor-not-allowed hover:bg-transparent")}
      // aria-disabled keeps the control hoverable and focusable, so the title and the
      // described-by reason are actually reachable. `disabled` makes both unreachable.
      aria-disabled={unavailable || undefined}
      aria-describedby={unavailable && reasonId ? reasonId : undefined}
      aria-label={label}
      title={label}
      onClick={() => {
        if (unavailable) return;
        onActivate();
      }}
      style={{ color: unavailable ? "var(--mv-muted)" : accent }}
    >
      <iconify-icon icon={icon} width={ICON_CONTROL} height={ICON_CONTROL} />
    </Button>
  );
}

function StateAction({
  row,
  state,
  variant,
  onChange,
}: {
  row: RuleRow;
  state: ExecutionState;
  variant: ColumnVariant;
  onChange: (id: string, next: ExecutionState) => void;
}) {
  const meta = STATE_META[state];
  const category = categoryTokens(row.category);
  const band = executionTokens(state);
  const reasonId = useId();
  const inactive = state === "inactive";
  const live = state === "running" || state === "paused";

  // One verb, one glyph: Run and Resume are the same action from different states.
  const primaryLabel = state === "running" ? "Pause" : state === "paused" ? "Resume" : "Run";
  const primaryIcon: `ph:${string}-thin` = state === "running" ? "ph:pause-thin" : "ph:play-thin";
  const primaryNext: ExecutionState = state === "running" ? "paused" : "running";

  return (
    <div
      className={cn(
        "flex min-h-10 items-center gap-density-2",
        // Controls sit beside the badge they act on. justify-between in a fixed-width
        // cell stranded them ~150px away, reading as part of the next column.
        variant === "signal-rail" && "-my-density-2 -mr-density-3 border-l px-density-3 py-density-2",
      )}
      style={variant === "signal-rail" ? { backgroundColor: band.soft, borderColor: band.line } : undefined}
    >
      {variant === "descriptive" ? (
        <span className="min-w-0">
          <span className="block text-xs font-medium text-[var(--mv-ink)]">{meta.label}</span>
          <span className="block truncate text-[10px] text-[var(--mv-muted)]">{meta.detail}</span>
        </span>
      ) : (
        <Badge variant={meta.badge} tone={meta.tone} size="xs" className="gap-1">
          <span className="size-1.5 rounded-full bg-current" />
          {meta.label}
        </Badge>
      )}
      <span className="flex items-center gap-density-1">
        <ControlButton
          label={inactive ? `Run ${row.name}` : `${primaryLabel} ${row.name}`}
          icon={inactive ? "ph:play-thin" : primaryIcon}
          accent={category.accent}
          unavailable={inactive}
          reasonId={reasonId}
          onActivate={() => onChange(row.id, primaryNext)}
        />
        {/* Without Stop the model was a trapdoor: once started, a rule could only
            oscillate Running <-> Paused and "Ready" was unreachable until reload. */}
        {live && (
          <ControlButton
            label={`Stop ${row.name}`}
            icon="ph:stop-thin"
            accent="var(--mv-muted)"
            onActivate={() => onChange(row.id, "stopped")}
          />
        )}
        {inactive && (
          <span id={reasonId} className="sr-only">
            {INACTIVE_REASON}
          </span>
        )}
      </span>
    </div>
  );
}

function ColumnVariationTable({
  variant,
  title,
  states,
  onChange,
}: {
  variant: ColumnVariant;
  title: string;
  states: Record<string, ExecutionState>;
  onChange: (id: string, next: ExecutionState) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--mv-border)] bg-[var(--mv-surface)] shadow-sm">
      <table className="w-full min-w-[60rem] border-collapse">
        <caption className="sr-only">{title}</caption>
        <thead className="bg-[var(--mv-surface-2)]">
          <tr className="border-b border-[var(--mv-border)]">
            <HeaderCell>Rule</HeaderCell>
            <HeaderCell className="w-48">Target</HeaderCell>
            <HeaderCell className="w-56">Status / action</HeaderCell>
            <HeaderCell className="w-56 text-right">Execution</HeaderCell>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--mv-hair)]">
          {RULES.map((row) => {
            const state = states[row.id];
            if (!state) throw new Error(`Missing execution state for rule ${row.id}`);
            return (
              <tr key={row.id} className="transition-colors hover:bg-[var(--mv-paper)]">
                <td className="max-w-96 px-density-3 py-density-2">
                  <RuleIdentity row={row} />
                </td>
                <td className="px-density-3 py-density-2">
                  <TargetCell row={row} variant={variant} />
                </td>
                <td className="px-density-3 py-density-2">
                  <StateAction row={row} state={state} variant={variant} onChange={onChange} />
                </td>
                <td className="px-density-3 py-density-2 text-right">
                  <span className="inline-block text-[11px] text-[var(--mv-muted)]">
                    <span className="flex items-center justify-end gap-1">
                      <iconify-icon icon="ph:clock-thin" width={ICON_META} height={ICON_META} />
                      {row.lastRun}
                    </span>
                    <span className="block text-[10px] text-[var(--mv-muted-2)]">
                      {row.executions} execution{row.executions === 1 ? "" : "s"}
                    </span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function RuleRunColumnVariations() {
  const [states, setStates] = useState(INITIAL_STATES);
  const [discarded, setDiscarded] = useState<Set<ColumnVariant>>(new Set());
  const changeState = (id: string, next: ExecutionState) =>
    setStates((current) => ({ ...current, [id]: next }));
  const dirty = RULES.some((row) => states[row.id] !== row.execution);

  return (
    <section className="space-y-density-6" aria-labelledby="target-status-variations-title">
      <div className="flex flex-wrap items-end justify-between gap-density-3 border-t border-[var(--mv-border)] pt-density-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--mv-accent)]">D baseline · column study</p>
          <h2 id="target-status-variations-title" className="mt-density-1 text-xl font-semibold text-[var(--mv-ink)]">Target and status alternatives</h2>
          <p className="mt-density-1 max-w-3xl text-sm text-[var(--mv-ink-3)]">The rule identity and execution history stay fixed. Only Target and Status change, with live Run, Pause, Resume, and Stop controls shared across every treatment.</p>
        </div>
        <div className="flex items-center gap-density-2">
          {dirty && (
            <Button variant="outline" size="sm" onClick={() => setStates(INITIAL_STATES)}>
              Reset execution states
            </Button>
          )}
          {discarded.size > 0 && (
            <Button variant="outline" size="sm" onClick={() => setDiscarded(new Set())}>
              Restore column studies ({discarded.size})
            </Button>
          )}
        </div>
      </div>
      {COLUMN_VARIANTS.map((variant) => discarded.has(variant.id) ? null : (
        <ReviewVariant
          key={variant.id}
          id={`rule-run-columns-${variant.id}`}
          title={variant.title}
          verdict={variant.verdict}
          onDiscard={() => setDiscarded((current) => new Set(current).add(variant.id))}
        >
          <ColumnVariationTable
            variant={variant.id}
            title={variant.title}
            states={states}
            onChange={changeState}
          />
        </ReviewVariant>
      ))}
    </section>
  );
}
