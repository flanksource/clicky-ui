// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/components/menu/menu-panel.tsx
import type { Component, JSX } from "solid-js";
import { cn } from "../../utils/cn.js";
import { Surface } from "../ui/surface.js";

interface MenuPanelProps {
  class?: string;
  style?: JSX.CSSProperties;
  children: JSX.Element;
}

export const MenuPanel: Component<MenuPanelProps> = (props) => (
  <Surface class={cn("flex flex-col w-fit h-fit", props.class)} style={props.style}>
    {props.children}
  </Surface>
);
