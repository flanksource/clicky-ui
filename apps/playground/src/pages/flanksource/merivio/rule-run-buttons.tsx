import { useId, useState, type ReactNode } from "react";
import { Button, cn } from "@flanksource/clicky-ui";
import { UiPlay } from "@flanksource/clicky-ui/icons";

import { BestPractice, ReviewVariant } from "../../../review/ReviewComponents";
import type { PageMeta } from "../../../registry";
import { categoryTokens } from "../_merivio/category-tokens";
import {
  RULES,
  VARIANTS,
  type RuleRow,
  type VariantId,
} from "./_rule-run-buttons-data";
import { RuleRunColumnVariations } from "./_rule-run-column-variations";
import { ICON_CONTROL, ICON_META, RuleIdentity, StateBadge, TargetBadge } from "./_rule-run-parts";
import "../merivio.css";

export const meta = {
  title: "Rule table run buttons",
  description:
    "Tabular alternatives for the icon-only Run button on the entity-scoped rules page.",
  group: "Merivio · Reviews",
  icon: UiPlay,
  groupOrder: 20,
  navOrder: 55,
} satisfies PageMeta;

/**
 * Derived from the fixture so the key can never teach a category the table lacks.
 * Deduped with filter rather than [...new Set()] — the playground's static evaluator
 * (plugins/markdown-static-evaluator.ts) cannot evaluate calls, and an array spread
 * over a value it resolves to undefined is a hard build failure.
 */
const RULE_CATEGORIES = RULES.map((row) => row.category).filter(
  (category, index, all) => all.indexOf(category) === index,
);

const INACTIVE_REASON = "This rule is inactive for the selected entity.";

/**
 * Four states, four treatments. "Blocked while another rule runs" and "switched off
 * for this entity" are different facts and must not collapse into one grey button.
 */
type Availability = "idle" | "running" | "blocked" | "inactive";

function availabilityOf(row: RuleRow, busyRuleId: string | null): Availability {
  if (row.state === "inactive") return "inactive";
  if (busyRuleId === row.id) return "running";
  if (busyRuleId !== null) return "blocked";
  return "idle";
}

function RunButton({
  row,
  availability,
  busyRuleName,
  reasonId,
  onRun,
  onCancel,
  presentation,
}: {
  row: RuleRow;
  availability: Availability;
  busyRuleName: string | null;
  reasonId: string;
  onRun: (row: RuleRow) => void;
  onCancel: (row: RuleRow) => void;
  presentation: "icon" | "label" | "rail" | "history" | "leading";
}) {
  const running = availability === "running";
  const unavailable = availability === "blocked" || availability === "inactive";
  const iconOnly = presentation === "icon" || presentation === "rail";
  const category = categoryTokens(row.category);

  // WCAG 2.5.3: the accessible name must contain the visible label, so the label and
  // the name change together. The name stays the *action* even when unavailable —
  // the reason travels via aria-describedby, never by overwriting the name.
  const label = running ? "Cancel" : "Run";
  const accessibleName = running ? `Cancel run of ${row.name}` : `Run ${row.name}`;

  const reason =
    availability === "inactive"
      ? INACTIVE_REASON
      : availability === "blocked"
        ? `Waiting for ${busyRuleName ?? "another rule"} to finish.`
        : null;

  // aria-disabled rather than disabled: `disabled` sets pointer-events:none in the
  // Button base and drops the control from the tab order, which makes both the title
  // and the described-by reason unreachable by every input modality.
  const handleActivate = () => {
    if (unavailable) return;
    if (running) onCancel(row);
    else onRun(row);
  };

  // The soft tint sits ~1.05:1 against the table surface, so the border is what makes
  // this read as a control at all. `line` was too faint to do that job; a muted mix of
  // the accent gives the edge real contrast without turning the row into a toolbar.
  const tint =
    availability === "inactive"
      ? {
          color: "var(--mv-muted)",
          backgroundColor: "var(--mv-surface-2)",
          borderColor: "var(--mv-border-strong)",
        }
      : {
          color: category.ink,
          backgroundColor: category.soft,
          borderColor: `color-mix(in oklab, ${category.accent} 55%, transparent)`,
        };

  const shared = {
    type: "button" as const,
    "aria-disabled": unavailable || undefined,
    "aria-describedby": reason ? reasonId : undefined,
    onClick: handleActivate,
    title: reason ? `${accessibleName} — ${reason}` : accessibleName,
    "aria-label": accessibleName,
  };

  const stateClass = cn(
    "relative z-10",
    availability === "blocked" && "opacity-55 cursor-not-allowed hover:bg-transparent",
    availability === "inactive" && "cursor-not-allowed hover:bg-transparent",
  );

  const glyphSize = iconOnly ? ICON_CONTROL + 1 : ICON_CONTROL;
  const glyph = running ? (
    // The animation class lives on a wrapper: React 18 writes unknown props on custom
    // elements verbatim, so className on <iconify-icon> would not become class.
    <span className="inline-flex animate-spin motion-reduce:animate-none">
      <iconify-icon icon="ph:circle-notch-thin" width={glyphSize} height={glyphSize} />
    </span>
  ) : (
    // One verb, one glyph. Five treatments of Run should differ in layout, not icon.
    <iconify-icon icon="ph:play-thin" width={glyphSize} height={glyphSize} />
  );

  // Rendered as a sibling of the button rather than an extra cell: a stray <td>
  // would give the row one more column than the header and wreck table navigation.
  const description = reason ? (
    <span id={reasonId} className="sr-only">
      {reason}
    </span>
  ) : null;

  if (iconOnly) {
    const railStyle =
      availability === "inactive"
        ? { color: "var(--mv-muted)", backgroundColor: "var(--mv-surface-2)", borderColor: "var(--mv-border)" }
        : { color: "var(--mv-paper)", backgroundColor: category.accent, borderColor: category.accent };
    return (
      <>
        <Button
          {...shared}
          variant={presentation === "rail" ? "default" : "ghost"}
          size="icon"
          className={cn(stateClass, "size-8")}
          style={presentation === "rail" ? railStyle : { color: availability === "inactive" ? "var(--mv-muted)" : category.accent }}
        >
          {glyph}
        </Button>
        {description}
      </>
    );
  }

  return (
    <>
      <Button
        {...shared}
        variant={presentation === "leading" ? "ghost" : "outline"}
        size="sm"
        className={cn(
          stateClass,
          "gap-1.5",
          presentation === "label" && "min-w-20",
          presentation === "history" && "min-w-24",
        )}
        style={tint}
      >
        {glyph}
        {label}
      </Button>
      {description}
    </>
  );
}

function ActionCell({
  row,
  variant,
  availability,
  busyRuleName,
  reasonId,
  onRun,
  onCancel,
}: {
  row: RuleRow;
  variant: VariantId;
  availability: Availability;
  busyRuleName: string | null;
  reasonId: string;
  onRun: (row: RuleRow) => void;
  onCancel: (row: RuleRow) => void;
}) {
  const button = (presentation: Parameters<typeof RunButton>[0]["presentation"]) => (
    <RunButton
      row={row}
      availability={availability}
      busyRuleName={busyRuleName}
      reasonId={reasonId}
      onRun={onRun}
      onCancel={onCancel}
      presentation={presentation}
    />
  );

  if (variant === "command-rail") {
    const category = categoryTokens(row.category);
    const inactive = availability === "inactive";
    return (
      <div
        className="flex min-h-12 items-center justify-center border-l px-density-2"
        style={{
          backgroundColor: inactive ? "var(--mv-surface-2)" : category.soft,
          borderColor: inactive ? "var(--mv-border)" : category.line,
        }}
      >
        {button("rail")}
      </div>
    );
  }

  if (variant === "history-command") {
    return (
      <div className="flex min-w-48 items-center justify-end gap-density-3">
        <span className="min-w-0 text-right">
          <span className="flex items-center justify-end gap-1 text-[11px] text-[var(--mv-muted)]">
            <iconify-icon icon="ph:clock-thin" width={ICON_META} height={ICON_META} /> {row.lastRun}
          </span>
          <span className="block text-[10px] text-[var(--mv-muted-2)]">
            {row.executions} execution{row.executions === 1 ? "" : "s"}
          </span>
        </span>
        {button("history")}
      </div>
    );
  }

  return button(variant === "current-icon" ? "icon" : "label");
}

function HeaderCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
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

/**
 * A colour key, not an icon key. Row glyphs are per-rule semantics, so the only
 * thing that reliably maps a row to its category is the dot — which is what this
 * now explains.
 */
function CategoryLegend() {
  return (
    <div className="flex flex-wrap items-center gap-density-2">
      <span className="text-[11px] font-medium text-[var(--mv-muted)]">Category dot</span>
      {RULE_CATEGORIES.map((key) => {
        const category = categoryTokens(key);
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium"
            style={{ color: category.ink, backgroundColor: category.soft, borderColor: category.line }}
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: category.accent }} />
            {category.name}
          </span>
        );
      })}
    </div>
  );
}

function RuleTable({
  variant,
  title,
  onAnnounce,
}: {
  variant: VariantId;
  title: string;
  onAnnounce: (message: string) => void;
}) {
  // Busy state is per table. Sharing one value across all five tables meant a single
  // click froze every variant at once and made the comparison impossible to run.
  const [busyRuleId, setBusyRuleId] = useState<string | null>(null);
  const reasonPrefix = useId();

  const busyRow = RULES.find((row) => row.id === busyRuleId) ?? null;
  const leading = variant === "leading-trigger";
  const history = variant === "history-command";

  const handleRun = (row: RuleRow) => {
    setBusyRuleId(row.id);
    onAnnounce(`Running ${row.name}.`);
  };
  const handleCancel = (row: RuleRow) => {
    setBusyRuleId(null);
    onAnnounce(`Cancelled ${row.name}.`);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--mv-border)] bg-[var(--mv-surface)] shadow-sm">
      <table className="w-full min-w-[54rem] border-collapse">
        <caption className="sr-only">{title}</caption>
        <thead className="bg-[var(--mv-surface-2)]">
          <tr className="border-b border-[var(--mv-border)]">
            {leading && <HeaderCell className="w-24 text-center">Run</HeaderCell>}
            <HeaderCell>Rule</HeaderCell>
            <HeaderCell className="w-32">Target</HeaderCell>
            <HeaderCell className="w-32">Status</HeaderCell>
            {!history && <HeaderCell className="w-36">Last run</HeaderCell>}
            {!leading && (
              <HeaderCell
                className={cn(
                  "text-right",
                  variant === "command-rail" ? "w-16" : history ? "w-72" : "w-28",
                )}
              >
                {history ? "Execution" : "Run"}
              </HeaderCell>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--mv-hair)]">
          {RULES.map((row) => {
            const availability = availabilityOf(row, busyRuleId);
            const reasonId = `${reasonPrefix}-${row.id}`;
            return (
              <tr key={row.id} className="transition-colors hover:bg-[var(--mv-paper)]">
                {leading && (
                  <td className="px-density-2 py-density-1 text-center">
                    <RunButton
                      row={row}
                      availability={availability}
                      busyRuleName={busyRow?.name ?? null}
                      reasonId={reasonId}
                      onRun={handleRun}
                      onCancel={handleCancel}
                      presentation="leading"
                    />
                  </td>
                )}
                <td className="max-w-96 px-density-3 py-density-2">
                  <RuleIdentity row={row} />
                </td>
                <td className="px-density-3 py-density-2">
                  <TargetBadge row={row} />
                </td>
                <td className="px-density-3 py-density-2">
                  <StateBadge state={row.state} />
                </td>
                {!history && (
                  <td className="px-density-3 py-density-2 text-xs text-[var(--mv-muted)]">
                    <span className="inline-flex items-center gap-1.5">
                      <iconify-icon icon="ph:clock-thin" width={ICON_META} height={ICON_META} />
                      {row.lastRun}
                    </span>
                  </td>
                )}
                {!leading && (
                  <td
                    className={cn(
                      "py-0 text-right",
                      variant !== "command-rail" && "px-density-3 py-density-2",
                    )}
                  >
                    <ActionCell
                      row={row}
                      variant={variant}
                      availability={availability}
                      busyRuleName={busyRow?.name ?? null}
                      reasonId={reasonId}
                      onRun={handleRun}
                      onCancel={handleCancel}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function RuleRunButtonsPage() {
  const [discarded, setDiscarded] = useState<Set<VariantId>>(new Set());
  const [announcement, setAnnouncement] = useState("");

  return (
    <main className="merivio-system mx-auto w-full max-w-screen-2xl space-y-density-6 rounded-xl border border-[var(--mv-border)] bg-[var(--mv-paper)] p-density-4 sm:p-density-6">
      {/* Starting and cancelling a run are otherwise announced to nobody: aria-busy
          on a button is not reported as a state change by any major screen reader. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <header className="flex flex-wrap items-start justify-between gap-density-4">
        <div className="flex max-w-4xl items-start gap-density-3">
          <span className="merivio-brand-mark size-10 shrink-0 rounded-xl">
            <iconify-icon icon="ph:scales-thin" width="22" height="22" />
          </span>
          <div className="space-y-density-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--mv-accent)]">
              Merivio · Component review
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--mv-ink)]">
              Run buttons inside a rules table
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-[var(--mv-ink-3)]">
              Five treatments for <code>&lt;Button&gt;</code> in the final action cell on the entity-scoped <code>/rules</code> table. Each rule carries its accounting glyph and semantic category from the Merivio vocabulary. Run state is scoped per table, so the variants stay independently comparable.
            </p>
            <p className="font-mono text-[11px] text-[var(--mv-muted)]">
              CellContent → DensityValueProvider · current control: ghost / icon / 32 px
            </p>
            <CategoryLegend />
          </div>
        </div>
        <div className="flex items-center gap-density-2">
          {discarded.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDiscarded(new Set())}
            >
              Restore discarded ({discarded.size})
            </Button>
          )}
        </div>
      </header>

      <BestPractice
        id="rule-run-button-visible-intent"
        title="Keep execution explicit"
        description="Run is consequential and row-specific. Keep the verb visible, preserve a stable action column, show pending state in place with a way to cancel it, and give every row's control a name of its own."
        tone="do"
      />

      <section
        className="space-y-density-6"
        aria-label="Rule table button alternatives"
      >
        {VARIANTS.map((variant) =>
          discarded.has(variant.id) ? null : (
            <ReviewVariant
              key={variant.id}
              id={`rule-run-${variant.id}`}
              title={variant.title}
              verdict={variant.verdict}
              selected={variant.id === "explicit-command"}
              onDiscard={() =>
                setDiscarded((current) => new Set(current).add(variant.id))
              }
            >
              <RuleTable
                variant={variant.id}
                title={variant.title}
                onAnnounce={setAnnouncement}
              />
            </ReviewVariant>
          ),
        )}
      </section>

      <RuleRunColumnVariations />

      <BestPractice
        id="rule-run-button-disabled-reason"
        title="Disabled still needs a reachable reason"
        description="Unavailable controls use aria-disabled, not the disabled attribute: disabled sets pointer-events:none and removes the control from the tab order, so a title tooltip can never fire and the reason reaches nobody. The reason is carried by aria-describedby and stays out of the accessible name, which remains the action."
        tone="rule"
      />
    </main>
  );
}
