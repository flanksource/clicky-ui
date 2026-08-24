/**
 * Reports — a document, not a screen.
 *
 * The mistake a report makes is being a dashboard that someone printed. A
 * dashboard is a surface you interrogate: it has filters, hover, drill-down, and
 * a live time range. A report is a surface you *hand to someone else*, usually
 * asynchronously, often on paper, and always without you standing next to it. So
 * every interactive affordance either has to resolve to a static fact or come
 * out entirely.
 *
 * That single difference drives everything below: a fixed as-of stamp instead of
 * a relative range, direct labels instead of tooltips, a table beside every
 * chart, and the scope of the query stated on the page rather than implied by
 * controls the reader cannot see.
 */

import { Callout } from "@flanksource/clicky-ui";

import { BarSeries, Legend, StackedBar } from "./dataviz-marks";
import { PracticeGrid, type Practice } from "../practice/PracticeGrid";

import "./dataviz-palette.css";

const PRACTICES: Practice[] = [
  {
    title: "Stamp the as-of, never a relative range",
    body: "“Last 7 days” means nothing in a PDF opened next month. Print the absolute window and the generation time — and the scan or query id, so the numbers can be reproduced.",
    tone: "rule",
  },
  {
    title: "State the scope where the filters would have been",
    body: "A reader cannot see the filter bar you ran this with. Any narrowing — accounts, severities, date window, muted rules — belongs in a scope line under the title, or the totals are unreadable.",
    tone: "rule",
  },
  {
    title: "Every chart ships its table",
    body: "Hover does not survive print. A figure whose values exist only in a tooltip becomes a picture of a number. Put the table next to it, or label the marks directly.",
    tone: "do",
  },
  {
    title: "Don't paginate a table by CSS alone",
    body: "A table split mid-row across a page break loses its header. Repeat the header on every page (thead + break-inside rules) or the second page is a wall of unlabelled columns.",
    tone: "avoid",
  },
  {
    title: "Say what is missing",
    body: "A report that silently drops rows it could not resolve reports a completeness it does not have. Name the truncation and the count — “500 of 1,284 rows, cut in print order”.",
    tone: "rule",
  },
  {
    title: "Ink, not screen colour",
    body: "The chart palette is validated against both app surfaces, but paper is neither. Assume the reader prints greyscale: keep direct labels, and let texture or order carry identity if hue cannot.",
    tone: "avoid",
  },
];

const BY_SERVICE = [
  { label: "s3", value: 214 },
  { label: "iam", value: 186 },
  { label: "ec2", value: 143 },
  { label: "rds", value: 97 },
  { label: "kms", value: 64 },
  { label: "elbv2", value: 41 },
];

const MIX = [
  { label: "Critical", value: 27 },
  { label: "High", value: 143 },
  { label: "Medium", value: 327 },
  { label: "Low", value: 96 },
];

/** The report page furniture, drawn at document proportions rather than app ones. */
function ReportSheet() {
  return (
    <article className="mx-auto max-w-3xl space-y-density-4 rounded-xl border border-border bg-card p-density-6 shadow-sm">
      <header className="space-y-2 border-b border-border pb-density-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-lg font-semibold tracking-tight text-foreground">
            Cloud posture — scan report
          </h4>
          <span className="font-mono text-xs text-muted-foreground">scan/01JQ8F3K2</span>
        </div>
        {/* The scope line: what a filter bar would have said, said statically. */}
        <dl className="grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="font-medium text-foreground">As of</dt>
            <dd className="tabular-nums">2026-08-23 09:14 UTC</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-foreground">Window</dt>
            <dd className="tabular-nums">2026-08-16 → 2026-08-23</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-foreground">Scope</dt>
            <dd>6 accounts · 4 providers · class in (prod, public)</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-foreground">Engine</dt>
            <dd>prowler 5.40.0 · profile safe</dd>
          </div>
        </dl>
      </header>

      <section className="space-y-2">
        <h5 className="text-sm font-semibold text-foreground">Severity mix</h5>
        <StackedBar points={MIX} />
        <Legend points={MIX} />
        {/* The table is not an accessibility afterthought — it is how the figure
            survives being printed. */}
        <table className="w-full text-xs">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="py-1 font-medium">Severity</th>
              <th className="py-1 text-right font-medium">Findings</th>
              <th className="py-1 text-right font-medium">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MIX.map((row) => (
              <tr key={row.label}>
                <td className="py-1 text-foreground">{row.label}</td>
                <td className="py-1 text-right tabular-nums text-foreground">{row.value}</td>
                <td className="py-1 text-right tabular-nums text-muted-foreground">
                  {((row.value / MIX.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-2">
        <h5 className="text-sm font-semibold text-foreground">Concentration by service</h5>
        <BarSeries height={110} points={BY_SERVICE} slot={0} />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          {BY_SERVICE.map((row) => (
            <span key={row.label}>{row.label}</span>
          ))}
        </div>
        <p className="text-[11px] leading-4 text-muted-foreground">
          Top six of 61 services. The remaining 55 hold 539 findings between them and are not shown —
          named here rather than silently dropped.
        </p>
      </section>

      <footer className="border-t border-border pt-density-3 text-[11px] text-muted-foreground">
        Generated by reconctl · 1,284 findings examined · 500-row API limit not reached
      </footer>
    </article>
  );
}

export function ReportsPattern() {
  return (
    <div className="space-y-density-6">
      <Callout title="A report is read where you are not" variant="important">
        Every interactive affordance a dashboard leans on &mdash; hover, filters, a relative time range,
        drill-down &mdash; is unavailable to a report&rsquo;s reader. Anything the chart said through
        interaction has to be said in ink instead, or it is not said at all.
      </Callout>

      <section className="space-y-density-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Anatomy</h3>
          <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
            Title and identifier, a scope block standing in for the filter bar, figures that each carry
            their own values, and a footer that states what was examined and what was cut.
          </p>
        </div>
        <ReportSheet />
      </section>

      <section className="space-y-density-3">
        <h3 className="text-sm font-semibold text-foreground">Rules</h3>
        <PracticeGrid practices={PRACTICES} />
      </section>
    </div>
  );
}
