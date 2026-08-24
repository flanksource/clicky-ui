export type PlaygroundView = "preview" | "markdown";
export type AnnotationVisibility = "visible" | "hidden";

export type PlaygroundRoute = {
  page: string;
  view: PlaygroundView;
  annotations: AnnotationVisibility;
};

export function parsePlaygroundRoute(
  search: string,
  fallbackPage: string,
): PlaygroundRoute {
  const params = new URLSearchParams(search);
  const view = params.get("view") ?? "preview";
  const annotations = params.get("annotations") ?? "visible";
  if (view !== "preview" && view !== "markdown") {
    throw new Error(`invalid playground view "${view}"; expected preview or markdown`);
  }
  if (annotations !== "visible" && annotations !== "hidden") {
    throw new Error(
      `invalid playground annotations "${annotations}"; expected visible or hidden`,
    );
  }
  return {
    page: params.get("page") ?? fallbackPage,
    view,
    annotations,
  };
}

export function buildPlaygroundRoute(route: PlaygroundRoute): string {
  const params = new URLSearchParams({ page: route.page });
  if (route.view !== "preview") params.set("view", route.view);
  if (route.annotations !== "visible") params.set("annotations", route.annotations);
  return `?${params.toString()}`;
}
