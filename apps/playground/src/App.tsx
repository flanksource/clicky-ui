import { useEffect, useRef, useState } from "react";
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
import { PAGES, fallbackPageSlug, findPage, preloadMeta } from "./registry";
import { buildPlaygroundRoute, parsePlaygroundRoute, type PlaygroundRoute } from "./route";

export function App() {
  const [route, navigateRoute] = useHistoryRoute<PlaygroundRoute>({
    parse: (_pathname, search) => {
      const parsed = parsePlaygroundRoute(search, fallbackPageSlug(PAGES) ?? "");
      return {
        ...parsed,
        page: findPage(parsed.page)?.slug ?? fallbackPageSlug(PAGES) ?? "",
      };
    },
    build: buildPlaygroundRoute,
  });

  // Browser adapter renders nav items as client-side <a> links; clicking pushes
  // history + dispatches popstate, which useHistoryRoute above re-parses.
  const router = useBrowserRouter();
  const [query, setQuery] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  // Nav labels start from the filename and settle once each `meta` has loaded;
  // PlaygroundShell subscribes to the resulting store updates.
  useEffect(() => preloadMeta(PAGES), []);

  const active = findPage(route.page);
  const comments = useComments(active?.slug ?? "", contentRef);

  return (
    <ThemeProvider>
      <DensityProvider>
        <RouterProvider adapter={router}>
          <CommentProvider
            comments={comments.comments}
            config={PLAYGROUND_COMMENT_CONFIG}
            resolveAnchor={strictAnchorResolver}
            onCreate={comments.create}
            onReply={comments.reply}
            onUpdateStatus={comments.updateStatus}
            onUpdateRating={comments.updateRating}
            onDelete={comments.remove}
          >
            <PlaygroundShell
              active={active}
              allComments={comments.allComments}
              contentRef={contentRef}
              query={query}
              onQueryChange={setQuery}
              commentsError={comments.error}
              view={route.view}
              annotations={route.annotations}
              pageHref={(slug) => buildPlaygroundRoute({ ...route, page: slug })}
              onViewChange={(view) => navigateRoute({ ...route, view })}
              onAnnotationsChange={(annotations) =>
                navigateRoute({ ...route, annotations })
              }
              onNavigate={(slug) => navigateRoute({ ...route, page: slug ?? "" })}
            />
          </CommentProvider>
        </RouterProvider>
      </DensityProvider>
    </ThemeProvider>
  );
}
