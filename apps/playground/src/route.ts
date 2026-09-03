export type PlaygroundView = "preview" | "markdown";
export type AnnotationVisibility = "visible" | "hidden";

export type PlaygroundRoute = {
  page: string;
  view: PlaygroundView;
  annotations: AnnotationVisibility;
  review?: "resolved";
  comment?: string;
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
  if (view !== "preview" && view !== "markdown") {
    throw new Error(
      `invalid playground view "${view}"; expected preview or markdown`,
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
  };
}

export function buildPlaygroundRoute(route: PlaygroundRoute): string {
  const params = new URLSearchParams({ page: route.page });
  if (route.view !== "preview") params.set("view", route.view);
  if (route.annotations !== "visible")
    params.set("annotations", route.annotations);
  if (route.review) params.set("review", route.review);
  if (route.comment) params.set("comment", route.comment);
  return `?${params.toString()}`;
}
