import { act } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot, getNearestEditorFromDOMNode, SKIP_SCROLL_INTO_VIEW_TAG } from "lexical";

/** Seed a draft through the editor's public model rather than a textarea change event. */
export function setCommentDraft(element: HTMLElement, body: string) {
  act(() => {
    getNearestEditorFromDOMNode(element).update(() => {
      const text = $createTextNode(body);
      $getRoot().clear().append($createParagraphNode().append(text));
      text.selectEnd();
    }, { discrete: true, tag: SKIP_SCROLL_INTO_VIEW_TAG });
  });
}
