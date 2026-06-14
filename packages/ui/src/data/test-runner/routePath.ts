// Stable, URL-safe paths for selection/navigation. A host that wants to encode
// the selected node in its route annotates the forest once with annotateRoutePaths
// (writing Test.route_path), then resolves a path back to a node with
// findNodeByRoutePath. Tree's nodeKey already prefers route_path, so an annotated
// forest also gets stable React keys for free.

import type { Test } from "./types";

export function slugify(value: string): string {
  const slug = (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "node";
}

/**
 * Return a deep copy of the forest with a stable, unique `route_path` on every
 * node. Each segment is the slug of the node's name; siblings that slug to the
 * same value are disambiguated with a `~N` ordinal so paths stay unique.
 */
export function annotateRoutePaths(nodes: Test[], parentSegments: string[] = []): Test[] {
  const counts = new Map<string, number>();
  for (const node of nodes) {
    const slug = slugify(node.name);
    counts.set(slug, (counts.get(slug) || 0) + 1);
  }

  const seen = new Map<string, number>();
  return nodes.map((node) => {
    const slug = slugify(node.name);
    const ordinal = (seen.get(slug) || 0) + 1;
    seen.set(slug, ordinal);
    const finalSlug = (counts.get(slug) || 0) > 1 ? `${slug}~${ordinal}` : slug;
    const segments = [...parentSegments, finalSlug];
    const annotated: Test = { ...node, route_path: segments.join("/") };
    if (node.children) annotated.children = annotateRoutePaths(node.children, segments);
    return annotated;
  });
}

/** Depth-first lookup of the node whose route_path equals target, or null. */
export function findNodeByRoutePath(nodes: Test[], target: string): Test | null {
  if (!target) return null;
  for (const node of nodes) {
    if (node.route_path === target) return node;
    if (node.children) {
      const child = findNodeByRoutePath(node.children, target);
      if (child) return child;
    }
  }
  return null;
}
