import { Badge } from "@flanksource/clicky-ui";
import { useDocumentProblems } from "./problems";

export function DocumentProblemBadge({
  repositoryId,
  path,
  folder = false,
}: {
  repositoryId: string;
  path: string;
  folder?: boolean;
}) {
  const { results } = useDocumentProblems();
  const prefix = `document:${repositoryId}/`;
  const count = Object.entries(results)
    .filter(([id]) =>
      folder
        ? id.startsWith(path === "." ? prefix : `${prefix}${path}/`)
        : id === `${prefix}${path}`,
    )
    .reduce(
      (total, [, findings]) =>
        total +
        [...findings.plain, ...findings.prompt].reduce(
          (sum, lint) => sum + (lint.violations?.length ?? 0),
          0,
        ),
      0,
    );
  return count ? (
    <span
      title={`${count} lint problem${count === 1 ? "" : "s"}`}
      aria-label={`${count} lint problem${count === 1 ? "" : "s"}`}
    >
      <Badge
        clickToCopy={false}
        count={count}
        size="xxs"
        tone="warning"
        variant="soft"
      />
    </span>
  ) : null;
}
