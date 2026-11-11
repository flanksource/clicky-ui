export interface WeightedNode {
  id: string;
  label: string;
  self: number;
  total: number;
  children: WeightedNode[];
}

export interface WeightedHierarchy {
  metric: string;
  unit: string;
  root: WeightedNode;
}

export interface WeightedRect {
  node: WeightedNode;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
}

function validate(root: WeightedNode) {
  const ids = new Set<string>();
  const walk = (node: WeightedNode) => {
    if (!node.id || ids.has(node.id)) throw new Error("Duplicate or missing weighted node identity");
    ids.add(node.id);
    if (!Number.isFinite(node.self) || !Number.isFinite(node.total) || node.self < 0 || node.total < 0) throw new Error("Invalid profile weight");
    const total = node.self + node.children.reduce((sum, child) => sum + child.total, 0);
    if (Math.abs(total - node.total) > Math.max(1, node.total) * 1e-12) throw new Error(`Inconsistent profile total for ${node.id}`);
    node.children.forEach(walk);
  };
  walk(root);
}

export function flameLayout(root: WeightedNode): WeightedRect[] {
  validate(root);
  if (root.total === 0) return [];
  const result: WeightedRect[] = [];
  const walk = (node: WeightedNode, x: number, depth: number) => {
    const width = node.total / root.total;
    result.push({ node, x, y: depth, width, height: 1, depth });
    let cursor = x;
    for (const child of node.children) {
      walk(child, cursor, depth + 1);
      cursor += child.total / root.total;
    }
  };
  walk(root, 0, 0);
  return result;
}

export function treemapLayout(root: WeightedNode): WeightedRect[] {
  validate(root);
  if (root.total === 0) return [];
  const result: WeightedRect[] = [];
  const walk = (node: WeightedNode, x: number, y: number, width: number, height: number, depth: number) => {
    if (node.total === 0) return;
    const horizontal = width >= height;
    let cursor = horizontal ? x : y;
    const slice = (weight: number) => {
      const share = weight / node.total;
      const rect = { node, x: horizontal ? cursor : x, y: horizontal ? y : cursor, width: horizontal ? width * share : width, height: horizontal ? height : height * share, depth };
      cursor += horizontal ? rect.width : rect.height;
      return rect;
    };
    if (node.self > 0) result.push(slice(node.self));
    for (const child of node.children) {
      const rect = slice(child.total);
      walk(child, rect.x, rect.y, rect.width, rect.height, depth + 1);
    }
  };
  walk(root, 0, 0, 1, 1, 0);
  return result;
}
