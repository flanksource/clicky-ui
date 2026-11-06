// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/core/plugins/copy.ts
import type { Plugin } from "../../types.js";

export const copyPlugin: Plugin = {
  name: "copy",
  actions: [
    {
      id: "copy",
      label: "Copy",
      shortcut: "C",
      showInToolbarMenu: true,
      onAction: (context) => {
        context.copy?.();
      },
    },
  ],
};
