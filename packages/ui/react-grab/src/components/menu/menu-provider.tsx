// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/components/menu/menu-provider.tsx
import type { Component, JSX } from "solid-js";
import { MenuContext, type MenuStore } from "./menu-context.js";

interface MenuProviderProps {
  store: MenuStore;
  children: JSX.Element;
}

export const MenuProvider: Component<MenuProviderProps> = (props) => (
  <MenuContext.Provider value={props.store}>{props.children}</MenuContext.Provider>
);
