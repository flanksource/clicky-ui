// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/auto-resize-textarea.ts
export const autoResizeTextarea = (textarea: HTMLTextAreaElement, maxHeight: number) => {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
};
