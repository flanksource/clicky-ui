import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  CommentProvider,
  DensityProvider,
  RouterProvider,
  ThemeProvider,
  strictAnchorResolver,
  useBrowserRouter,
  useHistoryRoute,
} from "@flanksource/clicky-ui";

import { PLAYGROUND_COMMENT_CONFIG, useComments } from "./comments/useComments";
import { PlaygroundShell } from "./PlaygroundShell";
import { ExternalWorkspace } from "./bookmarklet/ExternalWorkspace";
import {
  PAGES,
  fallbackPageSlug,
  findPage,
  getMetaVersion,
  pages,
  preloadMeta,
  subscribeMeta,
} from "./registry";
import {
  buildPlaygroundRoute,
  parsePlaygroundRoute,
  type PlaygroundRoute,
} from "./route";

export function App() {
  const [route, navigateRoute] = useHistoryRoute<PlaygroundRoute>({
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

  // Nav labels start from the filename and settle once each `meta` has loaded;
  // PlaygroundShell subscribes to the resulting store updates. The same store
  // carries optimistic renames/moves/deletes, so the active page has to be
  // re-resolved when it fires — the route is unchanged by a rename.
  useSyncExternalStore(subscribeMeta, getMetaVersion, getMetaVersion);
  useEffect(() => preloadMeta(PAGES), []);

  const active = findPage(route.page);
  const isExternal = route.page.startsWith("external:");
  const comments = useComments(route.page, contentRef, { poll: true });
  const standardRoute = (
    page: string,
    view: PlaygroundRoute["view"] = route.view,
  ): PlaygroundRoute => ({ page, view, annotations: route.annotations });

  return (
    <ThemeProvider>
      <DensityProvider>
        <RouterProvider adapter={router}>
          <CommentProvider
            comments={comments.comments}
            config={PLAYGROUND_COMMENT_CONFIG}
            resolveAnchor={strictAnchorResolver}
            {...(!isExternal ? { onCreate: comments.create } : {})}
            onReply={comments.reply}
            onUpdateStatus={comments.updateStatus}
            onClose={comments.close}
            onUpdateRating={comments.updateRating}
            onDelete={comments.remove}
          >
            {isExternal ? (
              <ExternalWorkspace
                id={route.page}
                pageHref={(slug) => buildPlaygroundRoute(standardRoute(slug))}
                comments={comments.allComments}
                commentsLoading={comments.loading}
                error={comments.error}
                review={route.review === "resolved"}
                {...(route.comment ? { selectedId: route.comment } : {})}
                onReopen={comments.commentAndReopen}
                navigate={(page, comment) =>
                  navigateRoute({
                    page,
                    view: "preview",
                    annotations: route.annotations,
                    ...(comment
                      ? { review: "resolved" as const, comment }
                      : {}),
                  })
                }
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
                {...(route.review ? { review: route.review } : {})}
                {...(route.comment ? { selectedCommentId: route.comment } : {})}
                pageHref={(slug) => buildPlaygroundRoute(standardRoute(slug))}
                onViewChange={(view) =>
                  navigateRoute(standardRoute(route.page, view))
                }
                onAnnotationsChange={(annotations) =>
                  navigateRoute({ ...route, annotations })
                }
                onNavigate={(slug) => navigateRoute(standardRoute(slug ?? ""))}
                onReviewNavigate={(page, comment) =>
                  navigateRoute({
                    page,
                    annotations: route.annotations,
                    view: "preview",
                    review: "resolved",
                    ...(comment ? { comment } : {}),
                  })
                }
                onReviewExit={() => navigateRoute(standardRoute(route.page))}
                onCommentAndReopen={comments.commentAndReopen}
                onPrepareCommentSelection={comments.prepareSelection}
              />
            )}
          </CommentProvider>
        </RouterProvider>
      </DensityProvider>
    </ThemeProvider>
  );
}
