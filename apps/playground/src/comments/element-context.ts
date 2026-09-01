import type { ReactGrabAPI, SourceInfo } from "react-grab";

import {
  COMMENT_ELEMENT_HTML_LIMIT,
  COMMENT_ELEMENT_HTML_TRUNCATION,
  type CommentElementContext,
} from "../../plugins/comments-model";

const STACK_TIMEOUT_MS = 1500;

function sourceLocation(source: SourceInfo | null): string {
  if (!source?.filePath) return "";
  return `${source.filePath}:${source.lineNumber ?? ""}`;
}

function resolveStack(
  api: ReactGrabAPI,
  element: Element,
  fallback: string,
): Promise<string> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve(value || fallback);
    };
    const timeout = window.setTimeout(() => finish(fallback), STACK_TIMEOUT_MS);
    void api.getStackContext(element).then(finish, () => finish(fallback));
  });
}

function captureHtml(element: Element): string {
  if (element.outerHTML.length <= COMMENT_ELEMENT_HTML_LIMIT) {
    return element.outerHTML;
  }
  return `${element.outerHTML.slice(0, COMMENT_ELEMENT_HTML_LIMIT)}${COMMENT_ELEMENT_HTML_TRUNCATION}`;
}

export async function captureElementContext(
  element: Element,
): Promise<CommentElementContext> {
  const api = window.__REACT_GRAB__;
  if (!api) {
    throw new Error(
      "React Grab is not ready, so the selected element cannot be attached to this comment",
    );
  }

  const directSource = await api
    .getSource(element)
    .then(sourceLocation, () => "");
  const source = await resolveStack(api, element, directSource);
  if (!source) {
    throw new Error(
      "React Grab could not resolve source context for the selected element",
    );
  }

  const componentName = api.getDisplayName(element);
  return {
    ...(componentName ? { componentName } : {}),
    source,
    html: captureHtml(element),
  };
}
