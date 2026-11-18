import type { AppShellNavDrag, AppShellNavDropTarget } from "@flanksource/clicky-ui";

const PAGE_ITEM = "page-item:";
const PAGE_FOLDER = "page:";

/**
 * The page-move vocabulary keys rows by page slug and folder path; the unified tree keys them by
 * entry key. Returns undefined for anything that is not a page row, which a page move can neither
 * start from nor land on: repository folders and documents, external pages and the External folder.
 */
function toPageTarget(target: AppShellNavDropTarget): AppShellNavDropTarget | undefined {
  if (target.kind === "section") return target;
  if (target.kind === "item" && target.key.startsWith(PAGE_ITEM)) return { key: target.key.slice(PAGE_ITEM.length), kind: "item" };
  if (target.kind === "group" && target.key.startsWith(PAGE_FOLDER)) return { key: target.key.slice(PAGE_FOLDER.length), kind: "group" };
  return undefined;
}

/** Narrows a page-move drag to the page rows of the unified tree. */
export function pageOnlyDrag(drag: AppShellNavDrag): AppShellNavDrag {
  return {
    ...(drag.rootKey === undefined ? {} : { rootKey: drag.rootKey }),
    canDrag: (source) => {
      const page = toPageTarget(source);
      return page !== undefined && page.kind === "item" && (drag.canDrag?.(page) ?? true);
    },
    canDrop: (source, target) => {
      const from = toPageTarget(source);
      const to = toPageTarget(target);
      return from !== undefined && to !== undefined && (drag.canDrop?.(from, to) ?? true);
    },
    onDrop: (source, target) => {
      const from = toPageTarget(source);
      const to = toPageTarget(target);
      if (!from || !to) throw new Error(`Only pages can be moved; dropped "${source.key}" on ${target.kind} "${target.key}"`);
      drag.onDrop(from, to);
    },
  };
}
