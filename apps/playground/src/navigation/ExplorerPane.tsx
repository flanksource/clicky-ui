import { useState, type ReactNode } from "react";
import {
  ActionError,
  NavigationTree,
  useMediaQuery,
  type AppShellNavSection,
  type WorkspaceLayoutDefaults,
  type WorkspacePaneSpec,
} from "@flanksource/clicky-ui";
import { UiComment } from "@flanksource/clicky-ui/icons";
import { NAVIGATION_ROUTE } from "./types";

export const NAVIGATION_STORAGE_KEY = "playground:navigation";
export const WORKSPACE_STORAGE_KEY = "playground:workspace";

/**
 * A phone opens with the Explorer folded away (the workspace stacks it under the page there); the
 * top-right toggle brings it back. A layout stored from an earlier visit wins over this.
 */
export function useExplorerLayoutDefaults(): WorkspaceLayoutDefaults {
  const phone = useMediaQuery("(max-width: 767px)");
  const [defaults] = useState<WorkspaceLayoutDefaults>(() => ({ sideCollapsed: { left: phone, right: false } }));
  return defaults;
}

export type ExplorerProps = {
  /** Shown above the tree: repository controls, sort and filters, load errors. */
  header: ReactNode;
  /** The navigation fetch failed; shown above the tree so an empty tree is never mistaken for an empty playground. */
  error: Error | null;
  section: AppShellNavSection;
  commentsHref: string;
  commentsActive: boolean;
};

export function ExplorerContent({ header, error, section, commentsHref, commentsActive }: ExplorerProps) {
  const comments: AppShellNavSection = { items: [{ key: "comments", label: "Comments", icon: UiComment, to: commentsHref, active: commentsActive }] };
  return (
    <div data-playground-explorer="" className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 space-y-density-2 px-density-2 pt-density-2">{header}</div>
      {error && (
        <ActionError
          title="Navigation unavailable"
          error={error}
          context={[["Endpoint", NAVIGATION_ROUTE]]}
          className="mx-density-2 my-density-2 shrink-0 rounded-md bg-background text-xs text-foreground"
        />
      )}
      <NavigationTree section={comments} storageKey={`${NAVIGATION_STORAGE_KEY}:static`} className="shrink-0 py-density-1" />
      <NavigationTree section={section} storageKey={NAVIGATION_STORAGE_KEY} className="min-h-0 flex-1 overflow-auto pb-density-2" />
    </div>
  );
}

/** The left Explorer pane both playground shells share. */
export function explorerPane({ title, ...props }: ExplorerProps & { title: string }): WorkspacePaneSpec {
  return {
    id: "explorer",
    label: <span className="font-semibold tracking-tight">{title}</span>,
    icon: <span className="grid size-5 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">P</span>,
    location: "left",
    width: 300,
    minWidth: 220,
    maxWidth: 560,
    contentClassName: "overflow-hidden",
    content: <ExplorerContent {...props} />,
  };
}
