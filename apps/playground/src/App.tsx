import { useEffect, useState } from "react";
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

export function App() {
  const [route] = useHistoryRoute<{ page: string }>({
    parse: (_pathname, search) => {
      const candidate = new URLSearchParams(search).get("page");
      return { page: findPage(candidate)?.slug ?? fallbackPageSlug(PAGES) ?? "" };
    },
    build: (next) => `?page=${encodeURIComponent(next.page)}`,
  });

  // Browser adapter renders nav items as client-side <a> links; clicking pushes
  // history + dispatches popstate, which useHistoryRoute above re-parses.
  const router = useBrowserRouter();
  const [query, setQuery] = useState("");

  // Nav labels start from the filename and settle once each `meta` has loaded;
  // PlaygroundShell subscribes to the resulting store updates.
  useEffect(() => preloadMeta(PAGES), []);

  const active = findPage(route.page);
  const comments = useComments(active?.slug ?? "");

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
            onDelete={comments.remove}
          >
            <PlaygroundShell
              active={active}
              allComments={comments.allComments}
              query={query}
              onQueryChange={setQuery}
              commentsError={comments.error}
            />
          </CommentProvider>
        </RouterProvider>
      </DensityProvider>
    </ThemeProvider>
  );
}
