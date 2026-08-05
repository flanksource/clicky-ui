import type {
  AppShellNavGroup,
  AppShellNavItem,
  AppShellNavSection,
} from "../layout/AppShell";
import {
  PATH_SEPARATOR,
  buildPathTree,
  splitPath,
  type PathTreeNode,
} from "../lib/path-tree";
import { resolveSurfaceIcon } from "./surfaceIconMap";
import type { ClickySurface } from "./types";

export interface SurfaceNavOptions {
  /** True when the surface is the current location. */
  isActive: (surface: ClickySurface) => boolean;
  /** Routing destination for the surface. */
  hrefFor: (surface: ClickySurface) => string;
}

// surfaceNavIcon prefers clicky-ui's own generic glyph for a known name, and
// otherwise hands the raw name through for the runtime fallback provider to
// resolve. Dropping unknown names — the old behaviour — silently discarded
// every vendor mark a backend emitted (postgres, loki, opensearch, …).
function surfaceNavIcon(surface: ClickySurface) {
  return resolveSurfaceIcon(surface.icon) ?? surface.icon;
}

function navItem(
  surface: ClickySurface,
  label: string,
  options: SurfaceNavOptions,
): AppShellNavItem {
  const icon = surfaceNavIcon(surface);
  return {
    key: surface.key,
    label,
    ...(icon ? { icon } : {}),
    active: options.isActive(surface),
    to: options.hrefFor(surface),
  };
}

// pathSegments reads the hierarchy the backend declared. A surface without one
// sits at the root of its section, and its title is taken whole — never split,
// because no delimiter was declared for it.
function pathSegments(surface: ClickySurface): string[] {
  return surface.path
    ? splitPath(surface.path, PATH_SEPARATOR)
    : [surface.title];
}

function nodeIsActive(
  node: PathTreeNode<ClickySurface>,
  options: SurfaceNavOptions,
): boolean {
  return (
    node.items.some(options.isActive) ||
    node.children.some((child) => nodeIsActive(child, options))
  );
}

function toNavGroup(
  node: PathTreeNode<ClickySurface>,
  options: SurfaceNavOptions,
): AppShellNavGroup {
  const own = node.items[0];
  const leaves: AppShellNavItem[] = [];
  const groups: AppShellNavGroup[] = [];
  for (const child of node.children) {
    if (child.children.length) {
      groups.push(toNavGroup(child, options));
    } else if (child.items[0]) {
      leaves.push(navItem(child.items[0], child.label, options));
    }
  }
  return {
    key: node.key,
    label: node.label,
    items: leaves,
    ...(groups.length ? { groups } : {}),
    ...(own ? { item: navItem(own, node.label, options) } : {}),
    // Folded until asked for: a backend with dozens of surfaces would otherwise
    // expand into the same unscannable wall the tree exists to replace.
    defaultCollapsed: true,
    // A deep link must never land on a branch the user collapsed earlier.
    ...(nodeIsActive(node, options) ? { forceExpanded: true } : {}),
  };
}

/**
 * Renders one parent bucket of surfaces as a nav section.
 *
 * When no surface in the bucket declares a `path`, the output is the flat item
 * list this has always produced — the backward-compatibility guarantee for
 * every backend that has not opted in. Otherwise the declared paths become
 * nested groups, with a node that is both a folder and a leaf carrying its own
 * destination alongside its children.
 */
export function surfaceNavSection(
  label: string,
  surfaces: ClickySurface[],
  options: SurfaceNavOptions,
): AppShellNavSection {
  if (!surfaces.some((surface) => surface.path)) {
    return {
      label,
      items: surfaces.map((surface) =>
        navItem(surface, surface.title, options),
      ),
    };
  }

  const roots = buildPathTree(surfaces, pathSegments);
  const items: AppShellNavItem[] = [];
  const groups: AppShellNavGroup[] = [];
  for (const node of roots) {
    if (node.children.length) {
      groups.push(toNavGroup(node, options));
    } else if (node.items[0]) {
      items.push(navItem(node.items[0], node.label, options));
    }
  }
  return {
    label,
    items,
    ...(groups.length ? { groups } : {}),
    // Folders sit at the same level as their sibling destinations here, so they
    // must read like nav rows rather than cluster headings.
    variant: "tree",
  };
}
