import { createContext } from "react";
import type { UseInteractionsReturn } from "@floating-ui/react";

// Shared popover shell class so the root menu and every flyout submenu match.
export const MENU_POPOVER_CLASS =
  "min-w-[8rem] rounded-md border border-border bg-popover py-1 shadow-md";

/**
 * Bridges a menu level to its item components: leaves and submenu triggers pull
 * `getItemProps` + roving-tabindex state from the enclosing menu. The root menu
 * provides it too, so the same item components serve every level.
 */
export type MenuContextValue = {
  getItemProps: UseInteractionsReturn["getItemProps"];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  setHasFocusInside: (value: boolean) => void;
  isOpen: boolean;
};

export const MenuContext = createContext<MenuContextValue>({
  getItemProps: () => ({}),
  activeIndex: null,
  setActiveIndex: () => {},
  setHasFocusInside: () => {},
  isOpen: false,
});
