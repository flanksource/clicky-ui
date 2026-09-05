export const RUN_SHORTCUT_LABEL = isApple() ? "⌘⏎" : "Ctrl+↵";

function isApple(): boolean {
  if (typeof navigator === "undefined") return false;
  return /mac|iphone|ipad/i.test(navigator.userAgent);
}
