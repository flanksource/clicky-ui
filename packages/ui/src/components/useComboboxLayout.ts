import {
  useCallback,
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  calculateComboboxMenuPosition,
  COMBOBOX_MOBILE_QUERY,
  type ComboboxMenuPosition,
} from "../lib/combobox";

export function useComboboxLabelWidth(
  label: ReactNode,
  labelRef: RefObject<HTMLSpanElement | null>,
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
  anchorRef: RefObject<HTMLDivElement | null>,
  listRef: RefObject<HTMLDivElement | null>,
): ComboboxMenuPosition | null {
  const [position, setPosition] = useState<ComboboxMenuPosition | null>(null);
  const update = useCallback(() => {
    const anchor = anchorRef.current;
    if (!open || !anchor) return;
    const next = calculateComboboxMenuPosition({
      anchor: anchor.getBoundingClientRect(),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      mobile: window.matchMedia(COMBOBOX_MOBILE_QUERY).matches,
      ...(listRef.current
        ? { naturalHeight: listRef.current.scrollHeight }
        : {}),
    });
    setPosition((current) =>
      sameComboboxMenuPosition(current, next) ? current : next,
    );
  }, [anchorRef, listRef, open]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, update]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!open || !position || !list) return;
    update();
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    const mutationObserver = new MutationObserver(update);
    resizeObserver?.observe(list);
    mutationObserver.observe(list, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => {
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
    };
  }, [listRef, open, position, update]);

  return position;
}

function sameComboboxMenuPosition(
  current: ComboboxMenuPosition | null,
  next: ComboboxMenuPosition,
) {
  return (
    current?.strategy === next.strategy &&
    current.top === next.top &&
    current.bottom === next.bottom &&
    current.left === next.left &&
    current.width === next.width &&
    current.maxWidth === next.maxWidth &&
    current.maxHeight === next.maxHeight
  );
}
