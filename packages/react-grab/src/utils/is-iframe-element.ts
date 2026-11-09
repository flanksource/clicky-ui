// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-iframe-element.ts
import { isHtmlElement } from "./is-html-element.js";

export const isIframeElement = (element: unknown): element is HTMLIFrameElement =>
  isHtmlElement(element) && element.tagName === "IFRAME";
