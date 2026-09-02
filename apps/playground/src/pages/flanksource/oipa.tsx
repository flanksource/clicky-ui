import { Badge, cn } from "@flanksource/clicky-ui";

import { DesignSystemPage, SpecimenSection, type SectionLink } from "../../design-system/DesignSystemPage";
import { designSystemPage } from "../../design-system/catalog";
import {
  ALL_MARKS,
  SECTIONS as MARK_SECTIONS,
  STATUS_CHIP,
  STATUS_LABEL,
  type MarkStatus,
} from "../oipa/_entity-icons/catalog";
import { oipaMark } from "../oipa/_entity-icons/oipa-marks";

export const meta = designSystemPage("flanksource/oipa");

// The OIPA layer is a naming problem before it is a drawing problem: the domain's
// own words ("transaction", "segment") describe something other than what they
// sound like, so every mark here is captioned with what the thing IS. The table
// itself is the shared one `_marks/entity-marks.ts` owns — this page is the
// design-system view of it, and `oipa/entity-icons` stays the working review.

const SECTIONS: SectionLink[] = [
  { id: "rules", label: "Rules" },
  { id: "coverage", label: "Coverage" },
  ...MARK_SECTIONS.map((section) => ({
    id: section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label: section.title,
  })),
];

const RULES = [
  {
    title: "Caption the concept, not the name",
    body: "A segment is the unit reserves are held at; a transaction is configured business logic, not money moving. The label repeats OIPA, the caption corrects it.",
  },
  {
    title: "One glyph and one symbol together",
    body: "Dense rows fall back to a single character where an icon is too heavy. Glyph and symbol are chosen as a pair, so a tree row and a card still read as the same entity.",
  },
  {
    title: "Hue belongs to the entity",
    body: "An entity's colour identifies it across every surface. Review state, selection, and severity ride on chips and rings instead of recolouring the mark.",
  },
] as const;

const STATUS_ORDER: MarkStatus[] = ["matches", "differs", "new", "unmarked"];

export default function OipaSystem() {
  return (
    <DesignSystemPage
      eyebrow="Product system"
      title={meta.title}
      description={meta.description}
      icon={meta.icon}
      sections={SECTIONS}
    >
      <SpecimenSection
        id="rules"
        title="Rules"
        description="What this layer adds on top of the Flanksource foundations."
      >
        <div className="grid gap-density-3 lg:grid-cols-3">
          {RULES.map((rule) => (
            <article key={rule.title} className="rounded-xl border border-border bg-card p-density-4">
              <h3 className="text-sm font-semibold text-foreground">{rule.title}</h3>
              <p className="mt-density-2 text-xs leading-5 text-muted-foreground">{rule.body}</p>
            </article>
          ))}
        </div>
      </SpecimenSection>

      <SpecimenSection
        id="coverage"
        title="Coverage"
        description="How far the shared table has actually reached oipa-cli. Anything but “matches” is drift someone still has to close."
      >
        <div className="grid gap-density-3 sm:grid-cols-2 xl:grid-cols-4">
          {STATUS_ORDER.map((status) => {
            const count = ALL_MARKS.filter((mark) => mark.status === status).length;
            return (
              <article key={status} className="rounded-xl border border-border bg-card p-density-4">
                <div className="flex items-baseline justify-between gap-density-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold capitalize", STATUS_CHIP[status])}>
                    {status}
                  </span>
                  <span className="font-mono text-lg font-semibold text-foreground">{count}</span>
                </div>
                <p className="mt-density-2 text-xs leading-5 text-muted-foreground">{STATUS_LABEL[status]}</p>
              </article>
            );
          })}
        </div>
      </SpecimenSection>

      {MARK_SECTIONS.map((section) => (
        <SpecimenSection
          key={section.title}
          id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
          title={section.title}
          description={section.desc}
        >
          <div className="grid gap-density-2 md:grid-cols-2 xl:grid-cols-3">
            {section.items.map((mark) => {
              const Icon = mark.icon;
              return (
                <article key={mark.key} className="flex gap-density-3 rounded-xl border border-border bg-card p-density-3">
                  {/* The tint is the literal class the app draws this entity in
                      (`oipa-marks.ts`), never composed from `mark.hue` — a
                      computed class name is invisible to Tailwind's scanner and
                      would ship as no colour at all. */}
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg bg-muted", oipaMark(mark.key)?.text ?? "text-muted-foreground")}>
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-density-2">
                      <h3 className="text-sm font-semibold text-foreground">{mark.label}</h3>
                      <span aria-hidden className="font-mono text-xs text-muted-foreground">{mark.symbol}</span>
                      <Badge size="xxs" tone="neutral" variant="soft" clickToCopy={false}>{mark.key}</Badge>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">{mark.desc}</p>
                    {mark.today && (
                      <p className={cn("rounded px-1.5 py-0.5 text-[11px] leading-4", STATUS_CHIP[mark.status])}>
                        oipa-cli today: {mark.today}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </SpecimenSection>
      ))}
    </DesignSystemPage>
  );
}
