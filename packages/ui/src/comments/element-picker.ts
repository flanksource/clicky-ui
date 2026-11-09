import { createElement, useState, type MouseEvent, type PointerEvent, type ReactNode, type RefObject } from "react";
import { useEscapeLayer } from "../overlay/modalStack";
import { ElementOutline } from "./ElementOutline";

const MAX_LABEL = 80;

/** Short reader-facing name of a picked element: its aria-label, else its text, else its tag. */
export function elementLabel(element: Element): string {
  return (element.getAttribute("aria-label") || element.textContent?.trim() || element.localName).slice(0, MAX_LABEL);
}

export type ElementPickerOptions = {
  /** The positioned container the picker listens on and outlines elements inside. */
  root: RefObject<HTMLElement | null>;
  /** Called with the clicked element; the click is swallowed so the element's own action does not run. */
  onPick: (element: Element) => void;
  /** Elements the picker may pick; a click elsewhere passes through untouched. */
  accepts?: (element: Element) => boolean;
};

export type ElementPicker = {
  picking: boolean;
  setPicking: (picking: boolean) => void;
  /** Spread on the root container. */
  rootProps: {
    onPointerOver: (event: PointerEvent<HTMLElement>) => void;
    onClickCapture: (event: MouseEvent<HTMLElement>) => void;
  };
  /** Render inside the root container. */
  outline: ReactNode;
};

/**
 * "Comment on element": while picking, the element under the pointer is
 * outlined and the next click picks it instead of acting. Escape cancels.
 */
export function useElementPicker({ root, onPick, accepts }: ElementPickerOptions): ElementPicker {
  const [picking, setPicking] = useState(false);
  const [hover, setHover] = useState<Element | null>(null);
  const stop = () => {
    setPicking(false);
    setHover(null);
  };
  useEscapeLayer(picking, stop);
  const pickable = (target: EventTarget): target is Element => target instanceof Element && (accepts?.(target) ?? true);
  return {
    picking,
    setPicking: (next) => (next ? setPicking(true) : stop()),
    rootProps: {
      onPointerOver: (event) => {
        if (picking && pickable(event.target)) setHover(event.target);
      },
      onClickCapture: (event) => {
        if (!picking || !root.current || !pickable(event.target)) return;
        event.preventDefault();
        event.stopPropagation();
        onPick(event.target);
        stop();
      },
    },
    outline: picking && hover && root.current ? createElement(ElementOutline, { element: hover, root: root.current }) : null,
  };
}
