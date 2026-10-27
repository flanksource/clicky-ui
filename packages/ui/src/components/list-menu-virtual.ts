import { createContext } from "react";

export interface ListMenuVirtualOptions {
  estimateRowHeight?: number;
  overscan?: number;
}

export interface ListMenuVirtualState {
  scrollElement: HTMLDivElement | null;
  contentElement: HTMLDivElement | null;
  estimateRowHeight: number;
  overscan: number;
}

export const ListMenuVirtualContext = createContext<ListMenuVirtualState | null>(null);
