import { Badge } from "../data/Badge";
import { Section } from "../layout/Section";
import { CommentThreadList } from "./CommentThreadList";
import {
  buildReplyMap,
  buildThreadListHandlers,
  groupByFacet,
  isUnresolved,
  resolveFacetOption,
  sortReplies,
} from "./comment-utils";
import type { Comment, CommentCallbacks, CommentConfig } from "./comment-types";

export type GroupedCommentsProps = CommentCallbacks & {
  comments: Comment[];
  config: CommentConfig;
  /** Facet key to group root comments by. */
  groupBy: string;
  /** Explicit group order by facet value; defaults to the facet's option order. */
  order?: string[];
  /** Force groups open regardless of their unresolved state. */
  alwaysOpen?: boolean;
};

const UNCATEGORIZED = "";

function groupLabel(
  value: string,
  config: CommentConfig,
  groupBy: string,
): string {
  if (value === UNCATEGORIZED) return "Uncategorized";
  const facet = config.facets?.find((f) => f.key === groupBy);
  return (facet && resolveFacetOption(facet, value)?.label) ?? value;
}

function orderedGroupKeys(
  present: string[],
  config: CommentConfig,
  groupBy: string,
  order?: string[],
): string[] {
  const preferred =
    order ??
    config.facets
      ?.find((f) => f.key === groupBy)
      ?.options.map((o) => o.value) ??
    [];
  const head = preferred.filter((v) => present.includes(v));
  const tail = present
    .filter((v) => !head.includes(v))
    .sort((a, b) => a.localeCompare(b));
  return [...head, ...tail];
}

/**
 * Groups root comments by a facet value, rendering each group as a collapsible
 * section with a count summary. Controlled — mutations route through the
 * supplied callbacks.
 */
export function GroupedComments({
  comments,
  config,
  groupBy,
  order,
  alwaysOpen,
  ...callbacks
}: GroupedCommentsProps) {
  const groups = groupByFacet(comments, groupBy);
  const replyMap = buildReplyMap(comments);
  const handlers = buildThreadListHandlers(
    comments,
    config,
    callbacks as CommentCallbacks,
  );
  const keys = orderedGroupKeys([...groups.keys()], config, groupBy, order);

  return (
    <div className="space-y-2">
      {keys.map((value) => {
        const roots = groups.get(value) ?? [];
        if (roots.length === 0) return null;
        const openCount = roots.filter((r) =>
          isUnresolved(config, r.status),
        ).length;
        const subset: Comment[] = roots.flatMap((root) => [
          root,
          ...sortReplies(replyMap.get(root.id) ?? []),
        ]);
        return (
          <Section
            key={value || "uncategorized"}
            title={groupLabel(value, config, groupBy)}
            defaultOpen={alwaysOpen ?? openCount > 0}
            summary={
              <span className="inline-flex items-center gap-1.5">
                <span>{roots.length}</span>
                {openCount > 0 && (
                  <Badge variant="soft" tone="info" size="xs">
                    {openCount} open
                  </Badge>
                )}
              </span>
            }
          >
            <CommentThreadList
              comments={subset}
              config={config}
              {...handlers}
            />
          </Section>
        );
      })}
    </div>
  );
}
