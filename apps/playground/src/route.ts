/**
 * `preview` renders the page. `markdown` is a TSX page's extracted guidance;
 * `source` is a markdown page's annotated editor and `problems` its lint findings.
 */
export type PlaygroundView = "preview" | "markdown" | "source" | "problems";
export type AnnotationVisibility = "visible" | "hidden";

export type PlaygroundRoute = {
  page: string;
  view: PlaygroundView;
  annotations: AnnotationVisibility;
  review?: "resolved";
  comment?: string;
  showRejected?: boolean;
};

export function parsePlaygroundRoute(
  search: string,
  fallbackPage: string,
): PlaygroundRoute {
  const params = new URLSearchParams(search);
  const view = params.get("view") ?? "preview";
  const annotations = params.get("annotations") ?? "visible";
  const review = params.get("review");
  const comment = params.get("comment");
  const rejected = params.get("rejected");
  if (rejected !== null && rejected !== "show") throw new Error('invalid rejected visibility; expected rejected=show');
  if (view !== "preview" && view !== "markdown" && view !== "source" && view !== "problems") {
    throw new Error(
      `invalid playground view "${view}"; expected preview, markdown, source or problems`,
    );
  }
  if (annotations !== "visible" && annotations !== "hidden") {
    throw new Error(
      `invalid playground annotations "${annotations}"; expected visible or hidden`,
    );
  }
  if (review !== null && review !== "resolved") {
    throw new Error(`invalid playground review "${review}"; expected resolved`);
  }
  if (comment !== null && review === null) {
    throw new Error('playground "comment" requires review=resolved');
  }
  return {
    page: params.get("page") ?? fallbackPage,
    view: review === "resolved" ? "preview" : view,
    annotations,
    ...(review === "resolved" ? { review } : {}),
    ...(comment === null ? {} : { comment }),
    ...(rejected === "show" ? { showRejected: true } : {}),
  };
}

export function buildPlaygroundRoute(route: PlaygroundRoute): string {
  const current = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  const params = current.get("page") === route.page ? current : new URLSearchParams();
  for (const key of ["sidebar.sort", "sidebar.filters", "sidebar.q", "sidebar.age"]) {
    const value = current.get(key);
    if (value !== null) params.set(key, value);
  }
  for (const key of ["page", "view", "annotations", "review", "comment", "rejected"]) params.delete(key);
  params.set("page", route.page);
  if (route.view !== "preview") params.set("view", route.view);
  if (route.annotations !== "visible")
    params.set("annotations", route.annotations);
  if (route.review) params.set("review", route.review);
  if (route.comment) params.set("comment", route.comment);
  if (route.showRejected) params.set("rejected", "show");
  return `?${params.toString()}`;
}
