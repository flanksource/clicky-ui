import type { HostActionProps } from "./LintDetail";
import type { Violation } from "./types";
import { violationIgnoreActions } from "./actions";
import { ignoreMenuItems } from "./ignore-menu-items";

export type ViolationProps = HostActionProps & {
  violation: Violation;
  linter: string;
  /** The file an ignore rule targets; empty when the violation has none. */
  file: string;
  workDir: string;
  showFile?: boolean;
};

export function violationMenuItems({
  violation,
  linter,
  file,
  workDir,
  onIgnore,
  ignoreBusy,
  onOpenFile,
}: ViolationProps) {
  const ignores = onIgnore
    ? violationIgnoreActions({ violation, linter, file, workDir })
    : [];
  return [
    {
      label: "Copy description",
      onSelect: () => {
        void navigator.clipboard.writeText(violation.message ?? "");
      },
    },
    ...(onOpenFile && file
      ? [
          {
            label: "Open in Files",
            onSelect: () =>
              onOpenFile({
                file,
                ...(workDir ? { workDir } : {}),
                ...(violation.line ? { line: violation.line } : {}),
              }),
          },
        ]
      : []),
    ...(onIgnore
      ? ignoreMenuItems(ignores, onIgnore, Boolean(ignoreBusy))
      : []),
  ];
}
