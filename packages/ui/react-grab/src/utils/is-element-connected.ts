// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-element-connected.ts
import { getElementAdapter } from "../core/element-adapter.js";

export const isElementConnected = (element: Element | null | undefined): element is Element => {
  if (!element) return false;
  const adapter = getElementAdapter(element);
  if (adapter) return adapter.isConnected();
  return Boolean(element.isConnected || element.ownerDocument?.contains(element));
};
