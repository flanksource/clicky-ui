// Source-line anchors for rendered markdown. A rehype plugin that stamps every
// top-level block with the 1-based line range it came from, so a host can map
// a line number in the original file onto the rendered element that shows it.

type HastNode = {
  type: string;
  position?: { start: { line: number }; end: { line: number } } | undefined;
  properties?: Record<string, unknown> | undefined;
  children?: HastNode[] | undefined;
};

export const SOURCE_START_ATTR = "data-source-start";
export const SOURCE_END_ATTR = "data-source-end";

export type SourceAttributes = {
  "data-source-start"?: string | number | undefined;
  "data-source-end"?: string | number | undefined;
};

/**
 * Rehype plugin: sets `dataSourceStart` / `dataSourceEnd` (rendered as
 * `data-source-start` / `data-source-end`) on each element directly under the
 * root. Run it after sanitising, which would otherwise strip the attributes.
 * Positions are only absolute when the whole document is parsed as one block.
 * An element with no position (it cannot be traced to a source line) is left
 * unstamped rather than given an invented range.
 */
export function rehypeSourceBlocks() {
  return (tree: HastNode) => {
    for (const child of tree.children ?? []) {
      if (child.type !== "element" || !child.position) continue;
      child.properties = {
        ...child.properties,
        dataSourceStart: child.position.start.line,
        dataSourceEnd: child.position.end.line,
      };
    }
  };
}

/** The `data-source-*` attributes among `props`, for forwarding onto a rendered element. */
export function sourceAttributes(props: Record<string, unknown>): SourceAttributes {
  const start = props[SOURCE_START_ATTR];
  const end = props[SOURCE_END_ATTR];
  return {
    ...(typeof start === "string" || typeof start === "number" ? { [SOURCE_START_ATTR]: start } : {}),
    ...(typeof end === "string" || typeof end === "number" ? { [SOURCE_END_ATTR]: end } : {}),
  };
}
