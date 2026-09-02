import { cn } from "@flanksource/clicky-ui";
import type { ComponentType } from "react";

import type { SupplyChainPosture } from "./fixture";
import {
  logPercent,
  sqrtPercent,
  type ActivityVisualScale,
} from "./activity-visual-scale";

type ActivityVisualProps = {
  posture: SupplyChainPosture;
  scale: ActivityVisualScale;
};

type ActivityVariant = {
  id: string;
  title: string;
  description: string;
  reading: string;
  Code: ComponentType<ActivityVisualProps>;
  Commits: ComponentType<ActivityVisualProps>;
  Legend?: ComponentType;
};

const VARIANTS: ActivityVariant[] = [
  {
    id: "heat-scales",
    title: "Separate heat scales",
    description:
      "Two compact color cells use independent estate-wide scales, so each column can be scanned on its own.",
    reading: "Darker code is larger · darker commits is more active",
    Code: CodeHeat,
    Commits: CommitHeat,
    Legend: HeatLegends,
  },
  {
    id: "bar-spark",
    title: "Volume bar + activity sparkline",
    description:
      "A length scale makes code magnitude familiar while a six-period sparkline preserves commit shape.",
    reading: "Bar length is code · sparkline is six five-day buckets",
    Code: CodeBar,
    Commits: CommitSparkline,
  },
  {
    id: "bubble-cadence",
    title: "Code bubble + commit cadence",
    description:
      "Circle area makes outsized repositories pop; six heat cells expose sustained or bursty commit activity.",
    reading: "Circle area is code · each activity cell is five days",
    Code: CodeBubble,
    Commits: CommitCadence,
  },
  {
    id: "steps-total",
    title: "Code steps + commit total",
    description:
      "Coarse code bands and a single activity rail trade precision for the fastest, narrowest scan.",
    reading: "Five code levels · commit rail uses the 30-day total",
    Code: CodeSteps,
    Commits: CommitTotal,
  },
];

export function ActivityComparison({
  postures,
  scale,
}: {
  postures: SupplyChainPosture[];
  scale: ActivityVisualScale;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {VARIANTS.map(
        ({ id, title, description, reading, Code, Commits, Legend }) => (
          <section
            className="min-w-0 overflow-hidden rounded-xl border border-border bg-card"
            data-activity-variant={id}
            key={id}
          >
            <header className="space-y-2 border-b border-border bg-muted/25 p-3">
              <h2 className="m-0 text-sm font-semibold text-foreground">
                {title}
              </h2>
              <p className="m-0 text-xs leading-5 text-muted-foreground">
                {description}
              </p>
              <p className="m-0 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {reading}
              </p>
              {Legend ? <Legend /> : null}
            </header>
            <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_5.5rem] items-center gap-2 border-b border-border px-3 py-2 text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
              <span>Repository</span>
              <span>Code size</span>
              <span>Commits · 30d</span>
            </div>
            <div className="divide-y divide-border/60">
              {postures.map((posture) => (
                <div
                  className="grid min-h-10 grid-cols-[minmax(0,1fr)_5.5rem_5.5rem] items-center gap-2 px-3 py-1.5"
                  data-activity-repository={posture.repository}
                  key={posture.repository}
                >
                  <a
                    className="min-w-0 overflow-hidden text-ellipsis font-mono text-[11px] font-medium whitespace-nowrap text-foreground hover:underline"
                    href={`https://github.com/${posture.repository}`}
                    rel="noreferrer"
                    target="_blank"
                    title={posture.repository}
                  >
                    {posture.repository.replace("flanksource/", "")}
                  </a>
                  <Code posture={posture} scale={scale} />
                  <Commits posture={posture} scale={scale} />
                </div>
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}

function HeatLegends() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <HeatLegend dataAttribute="code" label="Code size" />
      <HeatLegend dataAttribute="commit" label="Commit activity" />
    </div>
  );
}

function HeatLegend({
  dataAttribute,
  label,
}: {
  dataAttribute: "code" | "commit";
  label: string;
}) {
  return (
    <span
      className="grid grid-cols-[auto_1fr_auto] items-center gap-1 text-[9px] text-muted-foreground"
      data-code-heat-legend={dataAttribute === "code" ? "true" : undefined}
      data-commit-heat-legend={dataAttribute === "commit" ? "true" : undefined}
    >
      <span className="sr-only">{label}: </span>
      <span>Low</span>
      <span className="h-1.5 rounded-full bg-[linear-gradient(90deg,var(--fs-info-50),var(--fs-info-600))]" />
      <span>High</span>
    </span>
  );
}

function CodeHeat({ posture, scale }: ActivityVisualProps) {
  const activity = measuredActivity(posture);
  const percent = codePercent(activity.totalCode, scale);
  const label = codeDescription(posture);

  return (
    <span
      aria-label={label}
      className={cn(
        "block rounded px-1.5 py-1 text-center font-mono text-[9px] font-semibold tabular-nums",
        percent > 55 ? "text-white" : "text-foreground",
      )}
      data-code-visual="heat"
      style={{ backgroundColor: heatColor(percent) }}
      title={label}
    >
      {formatCode(activity.totalCode)}
    </span>
  );
}

function CommitHeat({ posture, scale }: ActivityVisualProps) {
  const activity = measuredActivity(posture);
  const percent = sqrtPercent(activity.commits.total, scale.maxCommits);
  const label = commitDescription(posture);

  return (
    <span
      aria-label={label}
      className={cn(
        "block rounded px-1.5 py-1 text-center font-mono text-[9px] font-semibold tabular-nums",
        percent > 55 ? "text-white" : "text-foreground",
      )}
      data-commit-visual="heat"
      style={{ backgroundColor: heatColor(percent) }}
      title={label}
    >
      {activity.commits.total}
    </span>
  );
}

function CodeBar({ posture, scale }: ActivityVisualProps) {
  const activity = measuredActivity(posture);
  const label = codeDescription(posture);

  return (
    <span
      aria-label={label}
      className="grid gap-1"
      data-code-visual="bar"
      title={label}
    >
      <span className="h-1.5 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full"
          style={{
            backgroundColor: "var(--fs-info-600)",
            width: `${Math.max(codePercent(activity.totalCode, scale), 2)}%`,
          }}
        />
      </span>
      <span className="font-mono text-[9px] leading-none text-muted-foreground tabular-nums">
        {formatCode(activity.totalCode)}
      </span>
    </span>
  );
}

function CommitSparkline({ posture, scale }: ActivityVisualProps) {
  const activity = measuredActivity(posture);
  const label = commitDescription(posture);

  return (
    <span
      aria-label={label}
      className="grid h-7 grid-cols-6 items-end gap-0.5"
      data-commit-visual="sparkline"
      title={label}
    >
      {activity.commits.buckets.map((value, index) => (
        <span
          className="min-h-px rounded-t"
          key={index}
          style={{
            backgroundColor: "var(--fs-info-600)",
            height: `${Math.max((value / scale.maxCommitBucket) * 100, 4)}%`,
          }}
        />
      ))}
    </span>
  );
}

function CodeBubble({ posture, scale }: ActivityVisualProps) {
  const activity = measuredActivity(posture);
  const label = codeDescription(posture);
  const percent = codePercent(activity.totalCode, scale);
  const diameter = 6 + (percent / 100) * 26;

  return (
    <span
      aria-label={label}
      className="grid h-8 place-items-center"
      data-code-visual="bubble"
      title={label}
    >
      <span
        className="rounded-full border"
        style={{
          backgroundColor: heatColor(percent),
          borderColor: "var(--fs-info-700)",
          height: `${diameter}px`,
          width: `${diameter}px`,
        }}
      />
    </span>
  );
}

function CommitCadence({ posture, scale }: ActivityVisualProps) {
  const activity = measuredActivity(posture);
  const label = commitDescription(posture);

  return (
    <span
      aria-label={label}
      className="grid grid-cols-6 gap-0.5"
      data-commit-visual="cadence"
      title={label}
    >
      {activity.commits.buckets.map((value, index) => (
        <span
          className="h-4 rounded-[2px] border border-border"
          key={index}
          style={{
            backgroundColor: heatColor((value / scale.maxCommitBucket) * 100),
          }}
        />
      ))}
    </span>
  );
}

function CodeSteps({ posture, scale }: ActivityVisualProps) {
  const activity = measuredActivity(posture);
  const label = codeDescription(posture);
  const level = Math.max(
    1,
    Math.ceil(codePercent(activity.totalCode, scale) / 20),
  );

  return (
    <span
      aria-label={label}
      className="grid grid-cols-5 gap-0.5"
      data-code-visual="steps"
      title={label}
    >
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          className={cn(
            "h-3 rounded-[2px]",
            step <= level ? "bg-[var(--fs-info-600)]" : "bg-muted",
          )}
          key={step}
        />
      ))}
    </span>
  );
}

function CommitTotal({ posture, scale }: ActivityVisualProps) {
  const activity = measuredActivity(posture);
  const label = commitDescription(posture);
  const percent = sqrtPercent(activity.commits.total, scale.maxCommits);

  return (
    <span
      aria-label={label}
      className="grid grid-cols-[1fr_auto] items-center gap-1"
      data-commit-visual="total"
      title={label}
    >
      <span className="h-1.5 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full"
          style={{
            backgroundColor: "var(--fs-info-600)",
            width: `${Math.max(percent, 2)}%`,
          }}
        />
      </span>
      <span className="w-5 text-right font-mono text-[9px] text-muted-foreground tabular-nums">
        {activity.commits.total}
      </span>
    </span>
  );
}

function measuredActivity(posture: SupplyChainPosture) {
  if (posture.activity === null)
    throw new Error(`${posture.repository} has no measured activity`);
  return posture.activity;
}

function codePercent(value: number, scale: ActivityVisualScale): number {
  return logPercent(value, scale.minCode, scale.maxCode);
}

function codeDescription(posture: SupplyChainPosture): string {
  return `${posture.repository}: ${formatCode(measuredActivity(posture).totalCode)} of code`;
}

function commitDescription(posture: SupplyChainPosture): string {
  const commits = measuredActivity(posture).commits;
  return `${posture.repository}: ${commits.total} commits in ${commits.windowDays} days`;
}

function formatCode(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(value / 1_000))} KB`;
}

function heatColor(percent: number): string {
  return `color-mix(in srgb, var(--fs-info-600) ${12 + percent * 0.88}%, var(--fs-info-50))`;
}
