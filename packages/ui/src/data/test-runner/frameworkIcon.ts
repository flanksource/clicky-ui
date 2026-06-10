// Maps a test framework to a native clicky icon component. We deliberately use
// only imported Ui* components (not iconify runtime name strings) so framework
// glyphs always resolve without a fallback icon provider — runtime names render
// as a dashed "?" placeholder when no provider is registered.
//
// Hosts wanting brand logos (devicon/logos) can override per node via a
// TestNodeAdapter's `renderRowLeading`, which renders before the name.

import type { StaticIconComponent } from "../Icon";
import { UiBeaker, UiGlobe, UiMarkdown, UiTerminal, UiTest } from "../../icons";

export function frameworkIcon(framework?: string): StaticIconComponent | null {
  switch (framework) {
    case "go test":
    case "ginkgo":
      return UiTest;
    case "jest":
    case "vitest":
      return UiBeaker;
    case "playwright":
      return UiGlobe;
    case "fixture":
      return UiMarkdown;
    case "task":
      return UiTerminal;
    default:
      return null;
  }
}
