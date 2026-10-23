import type { FilterBarFilter } from "@flanksource/clicky-ui";
import { externalPage } from "../bookmarklet/external-catalog";
import {
  findPage,
  humanizeSlug,
  pageTitle,
  pages as playgroundPages,
} from "../registry";
import { commentProject } from "./dashboard-model";
import type { DashboardState } from "./dashboard-state";
import { PLAYGROUND_COMMENT_CONFIG, type PageComment } from "./useComments";

export function dashboardFilters({
  comments,
  state,
  onChange,
  externalPages,
}: {
  comments: PageComment[];
  state: DashboardState;
  onChange: (next: Partial<DashboardState>) => void;
  externalPages: string[];
}): FilterBarFilter[] {
  const pages = [
    ...new Set([
      ...playgroundPages().map((page) => page.slug),
      ...externalPages,
      ...comments
        .filter((comment) => !comment.parentId)
        .map((comment) => comment.page),
      ...Object.keys(state.pages),
    ]),
  ];
  const projects = [
    ...new Set([...pages.map(commentProject), ...Object.keys(state.projects)]),
  ].sort();
  const authors = [
    ...new Set(
      comments
        .filter((comment) => !comment.parentId)
        .map((comment) => comment.author?.name)
        .filter((name): name is string => name !== undefined),
    ),
  ].sort();
  return [
    {
      key: "status",
      kind: "enum",
      label: "Status",
      value: state.status,
      onChange: (status) =>
        onChange({ status: status === "" ? "all" : status }),
      options: [
        { value: "unresolved", label: "Unresolved" },
        { value: "all", label: "All statuses" },
        ...PLAYGROUND_COMMENT_CONFIG.statuses.map(({ value, label }) => ({
          value,
          label,
        })),
      ],
    },
    {
      key: "project",
      kind: "multi",
      label: "Projects",
      value: state.projects,
      onChange: (projects) => onChange({ projects }),
      description:
        "Include any selected project; exclusions take precedence. Projects and pages must both match.",
      options: projects.map((value) => ({
        value,
        label:
          value === "__external__" ? "External pages" : humanizeSlug(value),
      })),
    },
    {
      key: "page",
      kind: "multi",
      label: "Pages",
      value: state.pages,
      onChange: (pages) => onChange({ pages }),
      description: "Include any selected page; exclusions take precedence.",
      options: pages
        .map((value) => {
          const page = findPage(value);
          return {
            value,
            label: page
              ? pageTitle(page)
              : (externalPage(value)?.title ?? value),
            description: value,
          };
        })
        .sort((left, right) => left.label.localeCompare(right.label)),
    },
    {
      key: "author",
      kind: "enum",
      label: "Author",
      value: state.author,
      onChange: (author) => onChange({ author }),
      options: [
        { value: "", label: "All authors" },
        ...authors.map((value) => ({ value, label: value })),
      ],
    },
    {
      key: "screenshot",
      kind: "enum",
      label: "Screenshot",
      value: state.screenshots,
      onChange: (screenshots) =>
        onChange({ screenshots: screenshots === "" ? "all" : screenshots }),
      options: [
        { value: "all", label: "All comments" },
        { value: "captured", label: "With screenshot" },
        { value: "missing", label: "Without screenshot" },
      ],
    },
  ];
}
