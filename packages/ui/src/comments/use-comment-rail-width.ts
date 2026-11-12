import { useSyncExternalStore } from "react";

const KEY = "clicky.comment-sidebar.width";
const EVENT = "clicky.comment-sidebar.resize";
const subscribe = (listener: () => void) => {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
};

export function useCommentRailWidth(defaultWidth = 320, key = KEY): [number, (width: number) => void] {
  const width = useSyncExternalStore(subscribe, () => {
    const saved = localStorage.getItem(key);
    if (saved === null) return defaultWidth;
    const value = Number(saved);
    if (!Number.isFinite(value) || value < 280 || value > 640) throw new Error(`Invalid comment sidebar width: ${saved}`);
    return value;
  }, () => defaultWidth);
  return [width, next => {
    if (!Number.isFinite(next) || next < 280 || next > 640) throw new Error(`Invalid comment sidebar width: ${next}`);
    localStorage.setItem(key, String(next));
    window.dispatchEvent(new Event(EVENT));
  }];
}
