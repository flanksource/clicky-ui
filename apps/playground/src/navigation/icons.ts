import * as uiIcons from "@flanksource/clicky-ui/icons";
import { UiFileCode, UiFolder, UiLinkExternal } from "@flanksource/clicky-ui/icons";
import type { AppShellNavItem } from "@flanksource/clicky-ui";
import type { NavigationEntry } from "./types";

type NavIcon = NonNullable<AppShellNavItem["icon"]>;

const KIND_ICON: Record<NavigationEntry["kind"], NavIcon> = {
  folder: UiFolder,
  page: UiFileCode,
  document: UiFileCode,
  external: UiLinkExternal,
};

const registry = uiIcons as Record<string, unknown>;

/**
 * The entry's icon: the generated `Ui*` component its page meta names, or the kind's default.
 * Page meta may name any component (for example a product logo), but only `Ui*` icons are
 * importable here, so any other name gets the default for its kind, as a page without meta does.
 */
export function entryIcon(entry: NavigationEntry): NavIcon {
  const named = entry.icon?.startsWith("Ui") ? registry[entry.icon] : undefined;
  return (typeof named === "function" || (typeof named === "object" && named !== null) ? named : KIND_ICON[entry.kind]) as NavIcon;
}
