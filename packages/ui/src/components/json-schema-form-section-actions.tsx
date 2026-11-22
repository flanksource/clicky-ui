import { createContext, useContext } from "react";

// A section's header row offers its own field's control a place for actions
// (an object array's ⋮ view menu), so they sit beside the section's title
// instead of on a row of their own below it. The slot names the instance path
// of the field the section heads: a control nested deeper in the section's
// body sees the slot but does not own it, and keeps its actions where it is.
export type SectionActionsSlot = { owner: string; element: HTMLElement };

export const SectionActionsContext = createContext<SectionActionsSlot | null>(null);

/** The header-row element of the section that heads the field at `instancePath`, if there is one. */
export function useSectionActionsSlot(instancePath: string): HTMLElement | undefined {
  const slot = useContext(SectionActionsContext);
  return slot?.owner === instancePath ? slot.element : undefined;
}
