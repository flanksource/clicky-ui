// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-element-node.ts
export const isElementNode = (node: unknown): node is Element =>
  typeof node === "object" &&
  node !== null &&
  "nodeType" in node &&
  node.nodeType === Node.ELEMENT_NODE;
