// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/core/plugins/edit.ts
import type { Plugin } from "../../types.js";
import { getElementAdapter } from "../element-adapter.js";

export const editPlugin: Plugin = {
  name: "edit",
  actions: [
    {
      id: "edit",
      label: "Style",
      shortcut: "S",
      shortcutModifier: false,
      showInToolbarMenu: true,
      enabled: (context) => getElementAdapter(context.element)?.supportsDomEditing !== false,
      onAction: (context) => {
        context.enterEditMode?.();
      },
    },
  ],
};
