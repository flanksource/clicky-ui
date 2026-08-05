import {
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  COMBOBOX_MENU_MAX_HEIGHT_PX,
  COMBOBOX_MENU_MAX_WIDTH_PX,
  type ComboboxMenuPosition,
} from "./combobox-utils";

export function useComboboxLabelWidth(
  label: ReactNode,
  labelRef: RefObject<HTMLSpanElement>,
): number {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    if (label == null) {
      setWidth(0);
      return;
    }
    if (labelRef.current) setWidth(labelRef.current.offsetWidth);
  }, [label, labelRef]);
  return width;
}

export function useComboboxMenuPosition(
  open: boolean,
  anchorRef: RefObject<HTMLDivElement>,
): ComboboxMenuPosition | null {
  const [position, setPosition] = useState<ComboboxMenuPosition | null>(null);
  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const openUp =
        spaceBelow < COMBOBOX_MENU_MAX_HEIGHT_PX && spaceAbove > spaceBelow;
      setPosition({
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
        left: rect.left,
        width: rect.width,
        maxWidth: Math.max(
          rect.width,
          Math.min(
            COMBOBOX_MENU_MAX_WIDTH_PX,
            window.innerWidth - rect.left - 8,
          ),
        ),
        maxHeight: Math.min(
          COMBOBOX_MENU_MAX_HEIGHT_PX,
          openUp ? spaceAbove : spaceBelow,
        ),
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef, open]);
  return position;
}
