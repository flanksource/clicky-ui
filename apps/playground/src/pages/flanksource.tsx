import { UiArrowRight } from "@flanksource/clicky-ui/icons";

import {
  DesignSystemPage,
  SpecimenSection,
  type SectionLink,
} from "../design-system/DesignSystemPage";
import {
  designSystemPage,
  pagesInSection,
  type DesignSystemPage as CatalogPage,
} from "../design-system/catalog";
import {
  ColorsSection,
  IconsSection,
  SpacingSection,
  TonesSection,
  TypographySection,
} from "../design-system/foundations/FoundationSections";

export const meta = designSystemPage("flanksource");

const principles = [
  {
    title: "Semantic by default",
    body: "Name intent—not pigment, pixels, or implementation—so themes and products stay aligned.",
  },
  {
    title: "Dense, never cramped",
    body: "Operational interfaces carry detail while preserving hierarchy, rhythm, and reliable targets.",
  },
  {
    title: "State is visible",
    body: "Loading, health, risk, selection, and recovery remain legible at every point in a workflow.",
  },
] as const;

const SECTIONS: SectionLink[] = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing & density" },
  { id: "icons", label: "Icons" },
  { id: "tones", label: "Tones" },
  { id: "patterns", label: "Patterns" },
  { id: "systems", label: "Product systems" },
];

function PageCards({ pages }: { pages: readonly CatalogPage[] }) {
  return (
    <div className="grid gap-density-3 md:grid-cols-2 xl:grid-cols-3">
      {pages.map((page) => {
        const Icon = page.icon;
        return (
          <a
            key={page.slug}
            href={`?page=${encodeURIComponent(page.slug)}`}
            className="group flex min-h-36 flex-col rounded-xl border border-border bg-card p-density-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-density-3">
              <span className="grid size-9 place-items-center rounded-lg bg-muted text-primary">
                <Icon className="size-5" />
              </span>
              <UiArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <h3 className="mt-density-4 text-sm font-semibold text-foreground">{page.title}</h3>
            <p className="mt-density-1 text-xs leading-5 text-muted-foreground">{page.description}</p>
          </a>
        );
      })}
    </div>
  );
}

export default function FlanksourceDesignSystem() {
  return (
    <DesignSystemPage
      eyebrow="Design system"
      title={meta.title}
      description={meta.description}
      icon={meta.icon}
      sections={SECTIONS}
    >
      <div className="grid gap-density-4 lg:grid-cols-3">
        {principles.map((principle, index) => (
          <article key={principle.title} className="rounded-xl border border-border bg-card p-density-4">
            <p className="text-xs font-semibold text-primary">0{index + 1}</p>
            <h2 className="mt-density-3 text-base font-semibold text-foreground">{principle.title}</h2>
            <p className="mt-density-2 text-sm leading-6 text-muted-foreground">{principle.body}</p>
          </article>
        ))}
      </div>

      <ColorsSection />
      <TypographySection />
      <SpacingSection />
      <IconsSection />
      <TonesSection />

      <SpecimenSection
        id="patterns"
        title="Common patterns"
        description="Repeatable compositions for the tasks that appear across Flanksource products."
      >
        <PageCards pages={pagesInSection("patterns")} />
      </SpecimenSection>

      <SpecimenSection
        id="systems"
        title="Product systems"
        description="Each product adds a vocabulary of its own on top of these foundations — the marks, hues, and rules that only make sense inside that domain."
      >
        <PageCards pages={pagesInSection("systems")} />
      </SpecimenSection>
    </DesignSystemPage>
  );
}
