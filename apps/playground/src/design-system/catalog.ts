import type { StaticIconComponent } from "@flanksource/clicky-ui";
import {
  UiActivity,
  UiColumns,
  UiFileType,
  UiForm,
  UiGrid,
  UiLayoutDashboard,
  UiPalette,
  UiResizeVertical,
  UiRows,
  UiTable,
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
  section: "overview" | "foundations" | "patterns";
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
    slug: "flanksource/foundations/colors",
    title: "Colors",
    description: "Semantic surface, content, border, status, and chart color tokens.",
    group: "Flanksource · Foundations",
    icon: UiPalette,
    groupOrder: 10,
    navOrder: 10,
    section: "foundations",
  },
  {
    slug: "flanksource/foundations/typography",
    title: "Typography",
    description: "Type roles, hierarchy, readable measures, and technical text.",
    group: "Flanksource · Foundations",
    icon: UiFileType,
    groupOrder: 10,
    navOrder: 20,
    section: "foundations",
  },
  {
    slug: "flanksource/foundations/spacing-density",
    title: "Spacing & density",
    description: "A shared spacing rhythm that responds to the active density setting.",
    group: "Flanksource · Foundations",
    icon: UiResizeVertical,
    groupOrder: 10,
    navOrder: 30,
    section: "foundations",
  },
  {
    slug: "flanksource/foundations/icons",
    title: "Icons",
    description: "Offline interface glyphs, product marks, sizing, and semantic pairing.",
    group: "Flanksource · Foundations",
    icon: UiGrid,
    groupOrder: 10,
    navOrder: 40,
    section: "foundations",
  },
  {
    slug: "flanksource/foundations/tones",
    title: "Tones",
    description: "Consistent visual language for status, risk, guidance, and feedback.",
    group: "Flanksource · Foundations",
    icon: UiActivity,
    groupOrder: 10,
    navOrder: 50,
    section: "foundations",
  },
  {
    slug: "flanksource/patterns/page-anatomy",
    title: "Page anatomy",
    description: "Page titles, actions, filters, content regions, and responsive composition.",
    group: "Flanksource · Patterns",
    icon: UiColumns,
    groupOrder: 20,
    navOrder: 10,
    section: "patterns",
  },
  {
    slug: "flanksource/patterns/collections",
    title: "Collections",
    description: "Tables, filters, selection, pagination, and master-detail exploration.",
    group: "Flanksource · Patterns",
    icon: UiTable,
    groupOrder: 20,
    navOrder: 20,
    section: "patterns",
  },
  {
    slug: "flanksource/patterns/forms-preview",
    title: "Forms & preview",
    description: "Persistent labels, validation, and preview-first configuration workflows.",
    group: "Flanksource · Patterns",
    icon: UiForm,
    groupOrder: 20,
    navOrder: 30,
    section: "patterns",
  },
  {
    slug: "flanksource/patterns/object-arrays",
    title: "Object arrays",
    description: "Accordion editors with identity-rich summaries and details on demand.",
    group: "Flanksource · Patterns",
    icon: UiRows,
    groupOrder: 20,
    navOrder: 40,
    section: "patterns",
  },
  {
    slug: "flanksource/patterns/feedback-states",
    title: "Feedback states",
    description: "Loading, empty, success, warning, error, and recovery treatments.",
    group: "Flanksource · Patterns",
    icon: UiWarningCircle,
    groupOrder: 20,
    navOrder: 50,
    section: "patterns",
  },
] as const satisfies readonly DesignSystemPage[];

export function designSystemPage(slug: string): DesignSystemPage {
  const page = DESIGN_SYSTEM_PAGES.find((candidate) => candidate.slug === slug);
  if (!page) {
    throw new Error(`Unknown design-system page "${slug}"`);
  }
  return page;
}
