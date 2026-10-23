import {
  buildPathTree,
  type FilterBarFilter,
  type FilterTreeNode,
  type PathTreeNode,
} from "@flanksource/clicky-ui";
import { externalPage } from "../bookmarklet/external-catalog";
import {
  findPage,
  humanizeSlug,
  pageTitle,
  pages as playgroundPages,
} from "../registry";
import {
  EXTERNAL_PAGES_ROOT,
  UNASSIGNED,
  commentPageTreePath,
  commentProject,
} from "./dashboard-model";
import type { DashboardState } from "./dashboard-state";
import {
  PLAYGROUND_ASSIGNEES,
  PLAYGROUND_COMMENT_CONFIG,
  type PageComment,
} from "./useComments";

type PageTreeEntry = { treeKey: string; slug: string | undefined };

function pageLabel(slug: string): string {
  const page = findPage(slug);
  return page ? pageTitle(page) : (externalPage(slug)?.title ?? slug);
}

function pageTreeNode(node: PathTreeNode<PageTreeEntry>): FilterTreeNode {
  const children = node.children.map(pageTreeNode).sort(compareTreeNodes);
  const slug = node.items.find((entry) => entry.slug)?.slug;
  const label = slug
    ? pageLabel(slug)
    : node.key === EXTERNAL_PAGES_ROOT
      ? "External pages"
      : children.length > 0
        ? humanizeSlug(node.label)
        : node.key;
  return {
    key: node.key,
    label,
    ...(slug ? { description: slug } : {}),
    ...(children.length > 0 ? { children } : {}),
  };
}

function compareTreeNodes(left: FilterTreeNode, right: FilterTreeNode): number {
  const leftIsFolder = (left.children?.length ?? 0) > 0;
  const rightIsFolder = (right.children?.length ?? 0) > 0;
  if (leftIsFolder !== rightIsFolder) return leftIsFolder ? -1 : 1;
  return left.label.localeCompare(right.label);
}

/**
 * Folders come from the slug hierarchy, external pages sit under one synthetic
 * root, and keys in the current selection that match no page still get a node
 * so a stale URL value stays visible and removable.
 */
export function pageTreeNodes(
  slugs: readonly string[],
  selectedKeys: readonly string[],
): FilterTreeNode[] {
  const known = new Set(slugs.map(commentPageTreePath));
  const entries: PageTreeEntry[] = [
    ...slugs.map((slug) => ({ treeKey: commentPageTreePath(slug), slug })),
    ...selectedKeys
      .filter((key) => !known.has(key))
      .map((treeKey) => ({ treeKey, slug: undefined })),
  ];
  return buildPathTree(entries, (entry) => entry.treeKey.split("/"))
    .map(pageTreeNode)
    .sort(compareTreeNodes);
}

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
  const assignees = [
    ...new Set([
      ...PLAYGROUND_ASSIGNEES.map((assignee) => assignee.name),
      ...comments
        .filter((comment) => !comment.parentId)
        .map((comment) => comment.assignee?.name)
        .filter((name): name is string => name !== undefined),
      ...(state.assignee && state.assignee !== UNASSIGNED
        ? [state.assignee]
        : []),
    ]),
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
          value === EXTERNAL_PAGES_ROOT
            ? "External pages"
            : humanizeSlug(value),
      })),
    },
    {
      key: "page",
      kind: "tree",
      label: "Pages",
      value: state.pages,
      onChange: (pages) => onChange({ pages }),
      description:
        "Include or exclude pages and whole folders; the deepest selection wins.",
      nodes: pageTreeNodes(pages, Object.keys(state.pages)),
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
      key: "assignee",
      kind: "enum",
      label: "Assignee",
      value: state.assignee,
      onChange: (assignee) => onChange({ assignee }),
      options: [
        { value: "", label: "All assignees" },
        { value: UNASSIGNED, label: "Unassigned" },
        ...assignees.map((value) => ({ value, label: value })),
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
