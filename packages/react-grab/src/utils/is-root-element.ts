// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-root-element.ts
import { getTagName } from "./get-tag-name.js";

export const isRootElement = (element: Element): boolean => {
  const tagName = getTagName(element);
  return tagName === "html" || tagName === "body";
};
