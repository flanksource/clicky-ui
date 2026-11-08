import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import {
  CommentProvider,
  DensityProvider,
  RouterProvider,
  ThemeProvider,
  strictAnchorResolver,
  useBrowserRouter,
  useHistoryRoute,
} from "@flanksource/clicky-ui";

import { AgentRunsProvider } from "./agent-runs/AgentRunsProvider";
import { PromptRunsProvider } from "./prompt-runs/PromptRunsProvider";
import { PLAYGROUND_COMMENT_CONFIG, useComments } from "./comments/useComments";
import { PlaygroundShell } from "./PlaygroundShell";
import { ArtifactSearch } from "./navigation/ArtifactSearch";
import { VocabularyReference } from "./vocabularies/VocabularyReference";
import { useVocabulary } from "./vocabularies/context";
import { ExternalWorkspace } from "./bookmarklet/ExternalWorkspace";
import { allowDocumentNavigation } from "./documents/navigation-guard";
import {
  fallbackPageSlug,
  findPage,
  getMetaVersion,
  pages,
  subscribeMeta,
} from "./registry";
import {
  buildPlaygroundRoute,
  parsePlaygroundRoute,
  type PlaygroundRoute,
} from "./route";

export function App() {
  const { vocabulary } = useVocabulary();
  const commentConfig = useMemo(() => ({ ...PLAYGROUND_COMMENT_CONFIG, ...(vocabulary ? { vocabulary } : {}) }), [vocabulary]);
  const [route, navigateRoute] = useHistoryRoute<PlaygroundRoute>({
    beforeNavigate: (next) => allowDocumentNavigation(next.page),
    parse: (_pathname, search) => {
      const parsed = parsePlaygroundRoute(
        search,
        "",
      );
      return {
        ...parsed,
        page: parsed.page === "" || parsed.page.startsWith("external:")
          ? parsed.page
          : (findPage(parsed.page)?.slug ?? fallbackPageSlug(pages()) ?? ""),
      };
    },
    build: buildPlaygroundRoute,
  });

  // Browser adapter renders nav items as client-side <a> links; clicking pushes
  // history + dispatches popstate, which useHistoryRoute above re-parses.
  const router = useBrowserRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  // Re-resolve the active page after optimistic renames, moves and deletions.
  useSyncExternalStore(subscribeMeta, getMetaVersion, getMetaVersion);

  const active = findPage(route.page);
  const isExternal = route.page.startsWith("external:");
  const comments = useComments(route.page, contentRef, { poll: true, all: route.page === "" || route.review === "resolved" });
  const standardRoute = useCallback(
    (page: string, view: PlaygroundRoute["view"] = route.view): PlaygroundRoute => ({ page, view, annotations: route.annotations, ...(route.showRejected ? { showRejected: true } : {}) }),
    [route.view, route.annotations, route.showRejected],
  );
  const pageHref = useCallback((slug: string) => buildPlaygroundRoute(standardRoute(slug)), [standardRoute]);
  const onShowRejectedChange = useCallback((showRejected: boolean) => navigateRoute({ ...route, showRejected }), [navigateRoute, route]);
  const onViewChange = useCallback((view: PlaygroundRoute["view"]) => navigateRoute(standardRoute(route.page, view)), [navigateRoute, standardRoute, route.page]);
  const onAnnotationsChange = useCallback((annotations: PlaygroundRoute["annotations"]) => navigateRoute({ ...route, annotations }), [navigateRoute, route]);
  const onNavigate = useCallback((slug?: string) => navigateRoute(standardRoute(slug ?? "")), [navigateRoute, standardRoute]);
  const onReviewNavigate = useCallback(
    (page: string, comment?: string) => navigateRoute({ page, annotations: route.annotations, view: "preview", review: "resolved", ...(comment ? { comment } : {}) }),
    [navigateRoute, route.annotations],
  );
  const onReviewExit = useCallback(() => navigateRoute(standardRoute(route.page)), [navigateRoute, standardRoute, route.page]);
  const navigateExternal = useCallback(
    (page: string, comment?: string, review?: boolean) =>
      navigateRoute({
        page,
        view: "preview",
        annotations: route.annotations,
        ...(review || comment ? { review: "resolved" as const, ...(comment ? { comment } : {}) } : {}),
      }),
    [navigateRoute, route.annotations],
  );

  return (
    <ThemeProvider>
      {new URLSearchParams(window.location.search).has("vocabulary") ? <VocabularyReference id={new URLSearchParams(window.location.search).get("vocabulary")!} /> : <>
      <DensityProvider>
        <RouterProvider adapter={router}>
          <ArtifactSearch onNavigate={slug => navigateRoute(standardRoute(slug, "preview"))} />
          <CommentProvider
            persistenceKey={route.page || "__dashboard"}
            comments={comments.comments}
            config={commentConfig}
            resolveAnchor={strictAnchorResolver}
            {...(!isExternal ? { onCreate: comments.create } : {})}
            onReply={comments.reply}
            onUpdateStatus={comments.updateStatus}
            onClose={comments.close}
            onAcknowledge={comments.acknowledge}
            onAssign={comments.assign}
            onUpdateRating={comments.updateRating}
            onDelete={comments.remove}
          >
            <AgentRunsProvider runAgent={comments.runAgent} {...(route.page ? { page: route.page } : {})}>
            <PromptRunsProvider>
            {isExternal ? (
              <ExternalWorkspace
                id={route.page}
                pageHref={pageHref}
                comments={comments.allComments}
                commentsLoading={comments.loading}
                error={comments.error}
                review={route.review === "resolved"}
                {...(route.comment ? { selectedId: route.comment } : {})}
                onReopen={comments.commentAndReopen}
                navigate={navigateExternal}
              />
            ) : (
              <PlaygroundShell
                active={active}
                allComments={comments.allComments}
                contentRef={contentRef}
                commentsError={comments.error}
                commentsLoading={comments.loading}
                view={route.view}
                annotations={route.annotations}
                showRejected={route.showRejected ?? false}
                onShowRejectedChange={onShowRejectedChange}
                {...(route.review ? { review: route.review } : {})}
                {...(route.comment ? { selectedCommentId: route.comment } : {})}
                pageHref={pageHref}
                onViewChange={onViewChange}
                onAnnotationsChange={onAnnotationsChange}
                onNavigate={onNavigate}
                onReviewNavigate={onReviewNavigate}
                onReviewExit={onReviewExit}
                onCommentAndReopen={comments.commentAndReopen}
                onPrepareCommentSelection={comments.prepareSelection}
                onCaptureSelection={comments.captureSelection}
              />
            )}
            </PromptRunsProvider>
            </AgentRunsProvider>
          </CommentProvider>
        </RouterProvider>
      </DensityProvider>
      </>}
    </ThemeProvider>
  );
}
