// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-shadow-root.ts
export const isShadowRoot = (node: Node): node is ShadowRoot => {
  const ownerWindow = node.ownerDocument?.defaultView;
  return Boolean(ownerWindow && node instanceof ownerWindow.ShadowRoot);
};
