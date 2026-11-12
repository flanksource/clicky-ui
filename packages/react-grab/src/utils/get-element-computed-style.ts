// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/get-element-computed-style.ts
export const getElementComputedStyle = (element: Element): CSSStyleDeclaration => {
  const ownerWindow = element.ownerDocument.defaultView;
  return ownerWindow ? ownerWindow.getComputedStyle(element) : window.getComputedStyle(element);
};
