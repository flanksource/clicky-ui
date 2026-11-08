import type { SchemaViewerNode } from "./schema-viewer-model";

export interface SchemaViewerSection {
  id: string;
  title: string;
  description?: string;
  /** Root field names/keys, a predicate, or all fields not selected by earlier sections. */
  select: readonly string[] | ((node: SchemaViewerNode) => boolean) | "*";
  /** Listed root field names/keys come first; remaining fields retain schema order. */
  order?: readonly string[];
}

export interface SchemaViewerSectionNodes {
  id: string;
  title?: string;
  description?: string;
  nodes: SchemaViewerNode[];
}

export function groupedSchemaRoots(groups: SchemaViewerSectionNodes[]): SchemaViewerNode[] {
  return groups.flatMap((group) => group.title ? [{
    key: `__section/${group.id}`,
    label: group.title,
    description: group.description,
    section: true,
    badge: "group",
    count: group.nodes.length,
    children: group.nodes,
  }] : group.nodes);
}

export function selectSchemaSections(roots: SchemaViewerNode[], sections?: readonly SchemaViewerSection[]): SchemaViewerSectionNodes[] {
  if (!sections) return [{ id: "fields", nodes: roots }];
  const ids = new Set<string>();
  const remaining = new Set(roots);
  const result = sections.map((section) => {
    if (!section.id || ids.has(section.id)) throw new Error(`SchemaViewer section IDs must be nonempty and unique: "${section.id}"`);
    ids.add(section.id);
    const selector = section.select;
    const nodes = roots.filter((node) => remaining.has(node) && (
      selector === "*" || (typeof selector === "function" ? selector(node) : selector.includes(node.label) || selector.includes(node.key))
    ));
    nodes.forEach((node) => remaining.delete(node));
    const rank = (node: SchemaViewerNode) => {
      const index = section.order?.findIndex((field) => field === node.label || field === node.key) ?? -1;
      return index < 0 ? Number.POSITIVE_INFINITY : index;
    };
    return { ...section, nodes: nodes.sort((left, right) => rank(left) - rank(right)) };
  }).filter((section) => section.nodes.length > 0);
  if (remaining.size > 0) {
    let id = "__remaining";
    while (ids.has(id)) id = `_${id}`;
    result.push({ id, title: "Other fields", select: "*", nodes: [...remaining] });
  }
  return result;
}
