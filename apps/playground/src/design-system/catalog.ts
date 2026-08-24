import type { StaticIconComponent } from "@flanksource/clicky-ui";
import {
  UiChartBar,
  UiColumns,
  UiFileText,
  UiForm,
  UiLayoutDashboard,
  UiRows,
  UiScan,
  UiScroll,
  UiShield,
  UiTable,
  UiTrendUp,
  UiWarningCircle,
} from "@flanksource/clicky-ui/icons";

import type { PageMeta } from "../registry";

export type DesignSystemPage = PageMeta & {
  slug: string;
  title: string;
  description: string;
  group: string;
  icon: StaticIconComponent;
  groupOrder: number;
  navOrder: number;
  /**
   * `overview` is the single foundations page: colors, type, spacing, icons and
   * tones live on it rather than as five nav destinations, because a foundation
   * is only legible next to the others it has to agree with.
   */
  section: "overview" | "patterns" | "systems";
};

export const DESIGN_SYSTEM_PAGES = [
  {
    slug: "flanksource",
    title: "Flanksource",
    description: "The foundations and repeatable patterns behind Flanksource product interfaces.",
    group: "Flanksource",
    icon: UiLayoutDashboard,
    groupOrder: 0,
    navOrder: 0,
    section: "overview",
  },
  {
    slug: "flanksource/patterns/page-anatomy",
    title: "Page anatomy",
    description: "The shell regions a product page is assembled from, and what belongs in each.",
    group: "Flanksource · Patterns",
    icon: UiColumns,
    groupOrder: 10,
    navOrder: 10,
    section: "patterns",
  },
  {
    slug: "flanksource/patterns/collections",
    title: "Collections",
    description: "Every way to present many things at once, and which question each one answers.",
    group: "Flanksource · Patterns",
    icon: UiTable,
    groupOrder: 10,
    navOrder: 20,
    section: "patterns",
  },
  {
    slug: "flanksource/patterns/forms",
    title: "Forms",
    description: "Field controls, progressive disclosure, adornments, and validation that lands.",
    group: "Flanksource · Patterns",
    icon: UiForm,
    groupOrder: 10,
    navOrder: 30,
    section: "patterns",
  },
  {
    slug: "flanksource/patterns/object-arrays",
    title: "Object arrays",
    description: "Accordion editors with identity-rich summaries and details on demand.",
    group: "Flanksource · Patterns",
    icon: UiRows,
    groupOrder: 10,
    navOrder: 40,
    section: "patterns",
  },
  {
    slug: "flanksource/patterns/feedback-states",
    title: "Feedback states",
    description: "Loading, empty, success, warning, error, and recovery treatments.",
    group: "Flanksource · Patterns",
    icon: UiWarningCircle,
    groupOrder: 10,
    navOrder: 50,
    section: "patterns",
  },
  {
    slug: "flanksource/patterns/stats",
    title: "Stats",
    description: "Stat tiles, deltas, gauges and sparklines — and when a number should not be a tile at all.",
    group: "Flanksource · Patterns",
    icon: UiTrendUp,
    groupOrder: 10,
    navOrder: 60,
    section: "patterns",
  },
  {
    slug: "flanksource/patterns/dashboards",
    title: "Dashboards",
    description:
      "The validated chart palette, and the reading order that turns a grid of charts into an argument.",
    group: "Flanksource · Patterns",
    icon: UiChartBar,
    groupOrder: 10,
    navOrder: 70,
    section: "patterns",
  },
  {
    slug: "flanksource/patterns/reports",
    title: "Reports",
    description: "Documents handed to someone else: fixed scope, direct labels, and every figure carrying its table.",
    group: "Flanksource · Patterns",
    icon: UiFileText,
    groupOrder: 10,
    navOrder: 80,
    section: "patterns",
  },
  {
    slug: "flanksource/supply-chain",
    title: "Supply chain",
    description: "The threat-model layer: category hues, severity ramp, and the grey-means-unobserved rule.",
    group: "Flanksource · Systems",
    icon: UiShield,
    groupOrder: 20,
    navOrder: 10,
    section: "systems",
  },
  {
    slug: "flanksource/oipa",
    title: "OIPA",
    description: "Entity marks for a policy-administration domain whose own names mislead.",
    group: "Flanksource · Systems",
    icon: UiScroll,
    groupOrder: 20,
    navOrder: 20,
    section: "systems",
  },
  {
    slug: "flanksource/reconctl",
    title: "reconctl",
    description:
      "The attack-surface layer: a violet/cyan palette, and the tone and glyph vocabulary for findings, scans, targets, hosts, resources and engines.",
    group: "Flanksource · Systems",
    icon: UiScan,
    groupOrder: 20,
    navOrder: 30,
    section: "systems",
  },
] as const satisfies readonly DesignSystemPage[];

export function designSystemPage(slug: string): DesignSystemPage {
  const page = DESIGN_SYSTEM_PAGES.find((candidate) => candidate.slug === slug);
  if (!page) {
    throw new Error(`Unknown design-system page "${slug}"`);
  }
  return page;
}

export function pagesInSection(
  section: DesignSystemPage["section"],
): readonly DesignSystemPage[] {
  return DESIGN_SYSTEM_PAGES.filter((page) => page.section === section);
}
