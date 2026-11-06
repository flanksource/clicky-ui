// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/components/menu/menu-item-label.tsx
import type { Component, JSX } from "solid-js";
import { cn } from "../../utils/cn.js";

interface MenuItemLabelProps {
  class?: string;
  children: JSX.Element;
}

export const MenuItemLabel: Component<MenuItemLabelProps> = (props) => (
  <span class={cn("text-[13px] leading-4 font-sans font-medium", props.class)}>
    {props.children}
  </span>
);
