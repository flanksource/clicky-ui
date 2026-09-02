import type { ReactNode } from "react";
import { Callout, cn } from "@flanksource/clicky-ui";

import { DesignSystemPage, SpecimenSection, type SectionLink } from "../../design-system/DesignSystemPage";
import { designSystemPage } from "../../design-system/catalog";
import { CATEGORY_STYLES, LEGEND_ORDER } from "../_supply-chain-threat-icons/palette";
import { SC_ICONS, ScIcon } from "../_supply-chain-posture/icons";
import {
  SEVERITY_CATEGORY,
  STATE_CATEGORY,
  STATE_LABEL,
  chipClass,
  scoreCategory,
} from "../_supply-chain-posture/tone";
import { FINDING_SEVERITIES, type ControlState } from "../_supply-chain-posture/fixture";

export const meta = designSystemPage("flanksource/supply-chain");

// This page publishes the supply-chain layer rather than restating it: every
// hue, glyph and band below is read from the modules the posture and threat-icon
// pages already draw from, so a change there shows up here instead of drifting.

const SECTIONS: SectionLink[] = [
  { id: "categories", label: "Category hues" },
  { id: "severity", label: "Severity & state" },
  { id: "scores", label: "Score bands" },
  { id: "glyphs", label: "Glyph vocabulary" },
];

const CONTROL_STATES: ControlState[] = ["enabled", "reporting", "disabled", "not_recorded"];

const SCORE_SAMPLES: Array<{ score: number | null; note: string }> = [
  { score: 9, note: "Control observed working" },
  { score: 6, note: "Partial coverage" },
  { score: 3, note: "Weak coverage" },
  { score: 1, note: "Effectively absent" },
  { score: null, note: "No subject to assess" },
];

const SCORE_MAX = 10;

function Chip({ category, children }: { category: keyof typeof CATEGORY_STYLES; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1", chipClass(category))}>
      {children}
    </span>
  );
}

export default function SupplyChainSystem() {
  return (
    <DesignSystemPage
      eyebrow="Product system"
      title={meta.title}
      description={meta.description}
      icon={meta.icon}
      sections={SECTIONS}
    >
      <Callout variant="important" title="Grey is “nothing observed”, never “fine”">
        A control the register never recorded and a check that could not conclude are both neutral grey. A control
        observed switched off is red. Painting an absence green reports a control nobody saw.
      </Callout>

      <SpecimenSection
        id="categories"
        title="Category hues"
        description="Colour answers one question: which security property is at risk. It is never decoration, and the same hue means the same property on every supply-chain surface."
      >
        <div className="grid gap-density-2 sm:grid-cols-2 xl:grid-cols-3">
          {LEGEND_ORDER.map((category) => {
            const style = CATEGORY_STYLES[category];
            return (
              <article key={category} className="flex items-start gap-density-3 rounded-xl border border-border bg-card p-density-3">
                <span className={cn("mt-0.5 size-4 shrink-0 rounded", style.swatch)} />
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-x-density-2">
                    <code className="text-xs font-semibold text-foreground">{category}</code>
                    <span className="text-[11px] text-muted-foreground">{style.color} · {style.hex}</span>
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">{style.meaning}</p>
                </div>
              </article>
            );
          })}
        </div>
      </SpecimenSection>

      <SpecimenSection
        id="severity"
        title="Severity & control state"
        description="Severity borrows the icon set's own ramp, so a High here is the High everywhere. Control state is a separate axis: enabled and reporting are both evidence, disabled is a failure, unrecorded is neither."
      >
        <div className="grid gap-density-3 lg:grid-cols-2">
          <div className="space-y-density-3 rounded-xl border border-border bg-card p-density-4">
            <p className="text-sm font-semibold text-foreground">Finding severity</p>
            <div className="flex flex-wrap gap-density-2">
              {FINDING_SEVERITIES.map((severity) => (
                <Chip key={severity} category={SEVERITY_CATEGORY[severity]}>
                  <span className="capitalize">{severity}</span>
                  <code className="text-[10px] opacity-70">{SEVERITY_CATEGORY[severity]}</code>
                </Chip>
              ))}
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Critical and high are separate hues rather than two weights of red: an operator triaging a list sorts by
              colour before they read the label.
            </p>
          </div>
          <div className="space-y-density-3 rounded-xl border border-border bg-card p-density-4">
            <p className="text-sm font-semibold text-foreground">Control state</p>
            <div className="flex flex-wrap gap-density-2">
              {CONTROL_STATES.map((state) => (
                <Chip key={state} category={STATE_CATEGORY[state]}>
                  {STATE_LABEL[state]}
                  <code className="text-[10px] opacity-70">{STATE_CATEGORY[state]}</code>
                </Chip>
              ))}
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Enabled and reporting share the control hue because both are observed evidence; only the label separates
              a setting from the detection that reports on it.
            </p>
          </div>
        </div>
      </SpecimenSection>

      <SpecimenSection
        id="scores"
        title="Score bands"
        description="A scored check lands in a band rather than carrying its own colour, so two tools with different scales still agree on what red means."
      >
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-density-3 font-medium">Score</th>
                <th className="p-density-3 font-medium">Band</th>
                <th className="p-density-3 font-medium">Reads as</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SCORE_SAMPLES.map((sample) => (
                <tr key={sample.note}>
                  <td className="p-density-3 font-mono text-xs text-foreground">
                    {sample.score === null ? "—" : `${sample.score} / ${SCORE_MAX}`}
                  </td>
                  <td className="p-density-3">
                    <Chip category={scoreCategory(sample.score, SCORE_MAX)}>
                      {scoreCategory(sample.score, SCORE_MAX)}
                    </Chip>
                  </td>
                  <td className="p-density-3 text-xs text-muted-foreground">{sample.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpecimenSection>

      <SpecimenSection
        id="glyphs"
        title="Glyph vocabulary"
        description="One glyph per supply-chain concept, drawn in currentColor so it takes the hue of the chip it sits in. Imports are offline: a glyph that needs the network is a glyph that can fail to appear."
      >
        <div className="grid gap-density-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Object.entries(SC_ICONS).map(([token, icon]) => (
            <article key={token} className="flex items-center gap-density-3 rounded-xl border border-border bg-card p-density-3">
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg ring-1", chipClass(icon.category))}>
                <ScIcon icon={token} className="size-5" />
              </span>
              <div className="min-w-0">
                <code className="block truncate text-xs font-semibold text-foreground">{token}</code>
                <p className="truncate text-[11px] text-muted-foreground">{icon.token} · {icon.category}</p>
              </div>
            </article>
          ))}
        </div>
      </SpecimenSection>
    </DesignSystemPage>
  );
}
