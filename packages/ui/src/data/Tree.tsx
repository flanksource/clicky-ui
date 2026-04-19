import type { ReactNode } from "react";
import { TreeNode, type TreeNodeProps } from "./TreeNode";

export type TreeProps<T> = Omit<TreeNodeProps<T>, "node" | "depth"> & {
  roots: T[];
  empty?: ReactNode;
  className?: string;
};

export function Tree<T>({ roots, empty, className, ...nodeProps }: TreeProps<T>) {
  if (roots.length === 0) return <>{empty ?? null}</>;
  return (
    <div role="tree" className={className}>
      {roots.map((root) => (
        <TreeNode<T> key={nodeProps.getKey(root)} node={root} {...nodeProps} />
      ))}
    </div>
  );
}
