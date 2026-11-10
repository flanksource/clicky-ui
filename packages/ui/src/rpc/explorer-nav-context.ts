import { createContext, type ReactNode } from "react";

export type ExplorerNavSlot = {
  container: HTMLElement | null;
  title: string;
  /** Host controls kept beside the surface crumb, as beside the default title. */
  titleActions?: ReactNode;
  /** Hides the surface's default title while a portal is mounted; returns the release. */
  claim: () => () => void;
};

export const ExplorerNavContext = createContext<ExplorerNavSlot | null>(null);
