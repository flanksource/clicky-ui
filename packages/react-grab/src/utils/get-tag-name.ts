// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/get-tag-name.ts
import { getElementAdapter } from "../core/element-adapter.js";

export const getTagName = (element: Element): string =>
  getElementAdapter(element)?.getTagName() ?? (element.tagName || "").toLowerCase();
