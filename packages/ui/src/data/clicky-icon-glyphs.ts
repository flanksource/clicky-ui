import type { StaticIconComponent } from "./Icon";
import { UiCheck, UiClose, UiInfo, UiWarningTriangle } from "../icons";

/**
 * Icons of clicky's Go catalog (clicky/api/icons) that a clicky document names
 * by Iconify id, drawn with clicky-ui's own offline glyphs so they render
 * without a host icon provider: the warning and info markers a query step puts
 * before its server messages, and the pass/fail marks.
 */
export const CLICKY_ICONIFY_GLYPHS: Readonly<Record<string, StaticIconComponent>> = {
  "ion:warning": UiWarningTriangle,
  "ion:information-circle": UiInfo,
  "ion:information": UiInfo,
  "ion:checkmark": UiCheck,
  "ion:close": UiClose,
};
