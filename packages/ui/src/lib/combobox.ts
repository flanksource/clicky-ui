export const COMBOBOX_MENU_MAX_WIDTH_PX = 400;
export const COMBOBOX_MENU_MAX_HEIGHT_PX = 256;
export const COMBOBOX_MOBILE_QUERY = "(max-width: 639px)";

const COMBOBOX_MENU_EDGE_INSET_PX = 8;
const COMBOBOX_MENU_ANCHOR_GAP_PX = 4;
const COMBOBOX_MOBILE_HORIZONTAL_INSET_PX = 16;

export type ComboboxMenuPosition = {
  strategy: "desktop" | "mobile";
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxWidth: number;
  maxHeight: number;
};

export function calculateComboboxMenuPosition({
  anchor,
  viewportWidth,
  viewportHeight,
  mobile,
  naturalHeight,
}: {
  anchor: Pick<DOMRect, "top" | "bottom" | "left" | "width">;
  viewportWidth: number;
  viewportHeight: number;
  mobile: boolean;
  naturalHeight?: number;
}): ComboboxMenuPosition {
  if (mobile) {
    const spaceBelow = Math.max(
      0,
      viewportHeight -
        anchor.bottom -
        COMBOBOX_MENU_ANCHOR_GAP_PX -
        COMBOBOX_MENU_EDGE_INSET_PX,
    );
    const spaceAbove = Math.max(
      0,
      anchor.top - COMBOBOX_MENU_ANCHOR_GAP_PX - COMBOBOX_MENU_EDGE_INSET_PX,
    );
    const openUp =
      naturalHeight != null &&
      naturalHeight > spaceBelow &&
      spaceAbove > spaceBelow;
    const width = Math.max(
      0,
      viewportWidth - COMBOBOX_MOBILE_HORIZONTAL_INSET_PX * 2,
    );
    return menuPosition({
      strategy: "mobile",
      anchor,
      viewportHeight,
      openUp,
      left: COMBOBOX_MOBILE_HORIZONTAL_INSET_PX,
      width,
      maxWidth: width,
      maxHeight: openUp ? spaceAbove : spaceBelow,
    });
  }

  const spaceBelow = Math.max(
    0,
    viewportHeight -
      anchor.bottom -
      COMBOBOX_MENU_ANCHOR_GAP_PX -
      COMBOBOX_MENU_EDGE_INSET_PX,
  );
  const spaceAbove = Math.max(
    0,
    anchor.top - COMBOBOX_MENU_ANCHOR_GAP_PX - COMBOBOX_MENU_EDGE_INSET_PX,
  );
  const openUp =
    spaceBelow < COMBOBOX_MENU_MAX_HEIGHT_PX && spaceAbove > spaceBelow;
  return menuPosition({
    strategy: "desktop",
    anchor,
    viewportHeight,
    openUp,
    left: anchor.left,
    width: anchor.width,
    maxWidth: Math.max(
      anchor.width,
      Math.min(
        COMBOBOX_MENU_MAX_WIDTH_PX,
        viewportWidth - anchor.left - COMBOBOX_MENU_EDGE_INSET_PX,
      ),
    ),
    maxHeight: Math.min(
      COMBOBOX_MENU_MAX_HEIGHT_PX,
      openUp ? spaceAbove : spaceBelow,
    ),
  });
}

function menuPosition({
  strategy,
  anchor,
  viewportHeight,
  openUp,
  left,
  width,
  maxWidth,
  maxHeight,
}: Omit<ComboboxMenuPosition, "top" | "bottom"> & {
  anchor: Pick<DOMRect, "top" | "bottom">;
  viewportHeight: number;
  openUp: boolean;
}): ComboboxMenuPosition {
  return {
    strategy,
    ...(openUp
      ? { bottom: viewportHeight - anchor.top + COMBOBOX_MENU_ANCHOR_GAP_PX }
      : { top: anchor.bottom + COMBOBOX_MENU_ANCHOR_GAP_PX }),
    left,
    width,
    maxWidth,
    maxHeight,
  };
}
