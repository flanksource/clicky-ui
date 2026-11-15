import type { JvmClassRef } from "../protocol/types";

/** A package (children, no `ref`) or a class (`ref`, no children) in the class browser. */
export type ClassTreeNode = {
  /** The package path, or `name@loader` for a class. */
  key: string;
  /** The last dotted segment. */
  name: string;
  /** Classes in this package and below; 1 for a class. */
  count: number;
  ref?: JvmClassRef;
  children: ClassTreeNode[];
};

export function classSimpleName(className: string): string {
  return className.slice(className.lastIndexOf(".") + 1);
}

export function classNodeKey(ref: JvmClassRef): string {
  return `${ref.name}@${ref.loader}`;
}

function sortLevel(nodes: ClassTreeNode[]): void {
  nodes.sort((left, right) => {
    const leftIsClass = left.ref !== undefined;
    if (leftIsClass !== (right.ref !== undefined)) return leftIsClass ? 1 : -1;
    return left.name.localeCompare(right.name);
  });
  for (const node of nodes) sortLevel(node.children);
}

/**
 * Groups loaded classes into a package hierarchy. A class appears once per
 * loader that defines it; a repeat of the same class and loader (a page that
 * overlapped the previous one) is listed once.
 */
export function buildClassTree(classes: readonly JvmClassRef[]): ClassTreeNode[] {
  const roots: ClassTreeNode[] = [];
  const seen = new Set<string>();
  for (const ref of classes) {
    const name = ref.name.trim();
    if (name === "") throw new Error(`Invalid class list: empty class name in loader ${ref.loader}`);
    const key = classNodeKey({ name, loader: ref.loader });
    if (seen.has(key)) continue;
    seen.add(key);

    const segments = name.split(".");
    segments.pop();
    let siblings = roots;
    let path = "";
    for (const segment of segments) {
      path = path ? `${path}.${segment}` : segment;
      let node = siblings.find((candidate) => candidate.ref === undefined && candidate.name === segment);
      if (!node) {
        node = { key: path, name: segment, count: 0, children: [] };
        siblings.push(node);
      }
      node.count++;
      siblings = node.children;
    }
    siblings.push({ key, name: classSimpleName(name), count: 1, ref: { name, loader: ref.loader }, children: [] });
  }
  sortLevel(roots);
  return roots;
}

export function findClassNode(nodes: readonly ClassTreeNode[], ref: JvmClassRef): ClassTreeNode | null {
  const key = classNodeKey(ref);
  for (const node of nodes) {
    if (node.key === key && node.ref) return node;
    const found = findClassNode(node.children, ref);
    if (found) return found;
  }
  return null;
}
