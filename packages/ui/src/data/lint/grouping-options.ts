import type { StaticIconComponent } from "../Icon";
import { UiCollapseAll, UiFileCode, UiFolder, UiListTree } from "../../icons";
import type { LintGrouping } from "./types";

/** The groupings a host can offer, in display order, with the label and glyph the picker shows. */
export const LINT_GROUPING_OPTIONS: ReadonlyArray<{
  key: LintGrouping;
  label: string;
  icon: StaticIconComponent;
}> = [
  { key: "linter-rule-file", label: "Linter · Rule · File", icon: UiListTree },
  { key: "linter-file", label: "Linter · File", icon: UiFolder },
  { key: "file-linter-rule", label: "File · Linter · Rule", icon: UiFileCode },
  { key: "summary", label: "Summary", icon: UiCollapseAll },
];
