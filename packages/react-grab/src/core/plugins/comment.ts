// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/core/plugins/comment.ts
import type { Plugin } from "../../types.js";

export const commentPlugin: Plugin = {
  name: "comment",
  actions: [
    {
      id: "comment",
      label: "Comment",
      shortcut: "Enter",
      showInToolbarMenu: true,
      onAction: (context) => {
        context.enterPromptMode?.();
      },
    },
  ],
};
