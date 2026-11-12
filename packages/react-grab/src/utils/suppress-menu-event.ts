// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/suppress-menu-event.ts
export const suppressMenuEvent = (event: Event): void => {
  if (event.type === "contextmenu") {
    event.preventDefault();
  }
  event.stopImmediatePropagation();
};
