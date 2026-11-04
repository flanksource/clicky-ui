import type { TaskSnapshot } from "./TaskSnapshot";

export interface TaskGroupNode {
  group: TaskSnapshot;
  tasks: TaskSnapshot[];
  allTasks: TaskSnapshot[];
  children: TaskGroupNode[];
}

export function taskGroupTree(snapshots: TaskSnapshot[]): TaskGroupNode[] {
  const groups = snapshots.filter((snapshot) => snapshot.type === "group");
  const nodes = new Map<string, TaskGroupNode>();
  for (const group of groups) {
    const id = group.groupId || group.id;
    if (nodes.has(id)) throw new Error(`Duplicate task group ${id}`);
    const tasks = snapshots.filter(
      (task) =>
        task.type === "task" &&
        (group.groupId ? task.groupId === id : task.group === id),
    );
    nodes.set(id, { group, tasks, allTasks: [...tasks], children: [] });
  }
  const roots: TaskGroupNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.group.parentGroupId
      ? nodes.get(node.group.parentGroupId)
      : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  let visited = 0;
  const aggregate = (node: TaskGroupNode) => {
    visited++;
    for (const child of node.children) {
      aggregate(child);
      node.allTasks.push(...child.allTasks);
    }
  };
  roots.forEach(aggregate);
  if (visited !== nodes.size)
    throw new Error("Task groups contain a parent cycle");
  return roots;
}
