import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  branchKeys,
  buildSessionHierarchy,
  collectionSession,
  filterSessionCollection,
  initialCheckedKeys,
  toggleHierarchyBranch,
  validateSessionCollection,
  type SessionCollectionInput,
  type SessionCollectionItem,
  type SessionHierarchyNode,
} from "./SessionInspector.collection";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

export interface SessionHierarchyState {
  current: UnifiedSessionInput;
  filtered: UnifiedSessionInput;
  roots: SessionHierarchyNode[];
  checked: ReadonlySet<string>;
  setBranchChecked: (
    node: SessionHierarchyNode,
    include: boolean
  ) => Promise<void>;
  loadChildren: (node: SessionHierarchyNode) => Promise<SessionHierarchyNode[]>;
  loading: ReadonlySet<string>;
  loadedSessionIds: ReadonlySet<string>;
  errors: ReadonlyMap<string, string>;
}

export function useSessionHierarchy(
  collection: SessionCollectionInput
): SessionHierarchyState {
  validateSessionCollection(collection);
  const [loaded, setLoaded] = useState<Map<string, UnifiedSessionInput>>(
    new Map()
  );
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const roots = useMemo(
    () => buildSessionHierarchy(collection, loaded),
    [collection, loaded]
  );
  const initialSessionIds = collection.defaultSelectedSessionIds?.length
    ? collection.defaultSelectedSessionIds
    : [collection.currentSessionId];
  const [checked, setChecked] = useState<Set<string>>(() =>
    initialCheckedKeys(roots, initialSessionIds)
  );
  const identity = `${collection.id}:${
    collection.currentSessionId
  }:${initialSessionIds.join(",")}`;
  const previousIdentity = useRef(identity);

  useEffect(() => {
    if (previousIdentity.current === identity) return;
    previousIdentity.current = identity;
    setLoaded(new Map());
    setErrors(new Map());
    setChecked(
      initialCheckedKeys(
        buildSessionHierarchy(collection, new Map()),
        initialSessionIds
      )
    );
  }, [collection, identity]);

  useEffect(() => {
    setChecked((previous) => reconcileCheckedBranches(roots, previous));
  }, [roots]);

  const ensureLoaded = useCallback(
    async (item: SessionCollectionItem) => {
      const existing = collectionSession(item, loaded);
      if (existing) return existing;
      if (!collection.loadSession) {
        throw new Error(
          `Session ${item.id} is not loaded and no loader was provided`
        );
      }
      setLoading((previous) => new Set(previous).add(item.id));
      setErrors((previous) => {
        const next = new Map(previous);
        next.delete(item.id);
        return next;
      });
      try {
        const session = await collection.loadSession(item);
        if (!session.id) throw new Error(`Loaded session ${item.id} has no id`);
        setLoaded((previous) => new Map(previous).set(item.id, session));
        return session;
      } catch (reason) {
        const message =
          reason instanceof Error ? reason.message : String(reason);
        setErrors((previous) => new Map(previous).set(item.id, message));
        throw reason;
      } finally {
        setLoading((previous) => {
          const next = new Set(previous);
          next.delete(item.id);
          return next;
        });
      }
    },
    [collection, loaded]
  );

  const loadChildren = useCallback(
    async (node: SessionHierarchyNode) => {
      if (node.kind !== "session" || !node.item) return node.children;
      const session = await ensureLoaded(node.item);
      const nextLoaded = new Map(loaded).set(node.item.id, session);
      const nextRoots = buildSessionHierarchy(collection, nextLoaded);
      const nextNode = findNode(nextRoots, node.key);
      if (!nextNode) throw new Error(`Loaded hierarchy is missing ${node.key}`);
      if (checked.has(node.key)) {
        setChecked((previous) => {
          const next = new Set(previous);
          branchKeys(nextNode).forEach((key) => next.add(key));
          return next;
        });
      }
      return nextNode.children;
    },
    [checked, collection, ensureLoaded, loaded]
  );

  const setBranchChecked = useCallback(
    async (node: SessionHierarchyNode, include: boolean) => {
      let nextNode = node;
      let targetRoots = roots;
      if (
        include &&
        node.kind === "session" &&
        node.item &&
        !collectionSession(node.item, loaded)
      ) {
        const session = await ensureLoaded(node.item);
        targetRoots = buildSessionHierarchy(
          collection,
          new Map(loaded).set(node.item.id, session)
        );
        nextNode = findNode(targetRoots, node.key) ?? node;
      }
      setChecked((previous) =>
        toggleHierarchyBranch(targetRoots, previous, nextNode.key, include)
      );
    },
    [collection, ensureLoaded, loaded, roots]
  );

  const currentItem = collection.sessions.find(
    (item) => item.id === collection.currentSessionId
  )!;
  const current = collectionSession(currentItem, loaded)!;
  return {
    current,
    filtered: filterSessionCollection(collection, loaded, roots, checked),
    roots,
    checked,
    setBranchChecked,
    loadChildren,
    loading,
    loadedSessionIds: new Set([
      ...collection.sessions
        .filter((item) => Boolean(item.session))
        .map((item) => item.id),
      ...loaded.keys(),
    ]),
    errors,
  };
}

function findNode(
  roots: SessionHierarchyNode[],
  key: string
): SessionHierarchyNode | undefined {
  for (const root of roots) {
    if (root.key === key) return root;
    const child = findNode(root.children, key);
    if (child) return child;
  }
}

function reconcileCheckedBranches(
  roots: SessionHierarchyNode[],
  checked: ReadonlySet<string>
) {
  const next = new Set(checked);
  const visit = (node: SessionHierarchyNode) => {
    if (checked.has(node.key)) {
      branchKeys(node).forEach((key) => next.add(key));
      return;
    }
    node.children.forEach(visit);
  };
  roots.forEach(visit);
  return next;
}
