// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-html-element.ts
import { isElementNode } from "./is-element-node.js";

export const isHtmlElement = (element: unknown): element is HTMLElement =>
  isElementNode(element) && element.namespaceURI === "http://www.w3.org/1999/xhtml";
