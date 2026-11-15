import type { MBeanDomain } from "../model/mbean-tree";

export type MBeanBrowserNode =
  | { kind: "domain"; key: string; label: string; count: number; children: MBeanBrowserNode[] }
  | { kind: "type"; key: string; label: string; count: number; children: MBeanBrowserNode[] }
  | { kind: "mbean"; key: string; label: string; metadata: string };

/** The browser's tree: domains, then type groups, then MBeans keyed by ObjectName. */
export function mbeanBrowserNodes(domains: MBeanDomain[]): MBeanBrowserNode[] {
  return domains.map((domain) => ({
    kind: "domain",
    key: `domain:${domain.domain}`,
    label: domain.domain,
    count: domain.count,
    children: domain.types.map((group) => ({
      kind: "type",
      key: `type:${domain.domain}:${group.type}`,
      label: group.type,
      count: group.mbeans.length,
      children: group.mbeans.map((mbean) => ({ kind: "mbean", key: mbean.objectName, label: mbean.label, metadata: mbean.metadata })),
    })),
  }));
}

export function findMBeanNode(nodes: MBeanBrowserNode[], objectName: string): MBeanBrowserNode | null {
  for (const node of nodes) {
    if (node.kind === "mbean") {
      if (node.key === objectName) return node;
    } else {
      const found = findMBeanNode(node.children, objectName);
      if (found) return found;
    }
  }
  return null;
}
