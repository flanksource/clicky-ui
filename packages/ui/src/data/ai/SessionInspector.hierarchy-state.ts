import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  branchKeys,
  buildSessionHierarchy,
  checkedSessionIds,
  collectionSession,
  filterSessionCollection,
  initialCheckedKeys,
  toggleHierarchyBranch,
  validateSessionCollection,
  type SessionCollectionInput,
  type SessionCollectionItem,
  type SessionHierarchyNode,
} from "./SessionInspector.collection";
import {
  openRemoteSession,
  type RemoteSessionHandle,
} from "./SessionInspector.remote";
import { useEventSourceFactory } from "../../hooks/event-source";
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

export interface SessionHierarchyOptions {
  /** Controlled session-level selection (collection item ids); `[]` selects
   *  nothing. Omit to start from the collection's own defaults. */
  selectedSessionIds?: readonly string[];
  /** Receives the session-level selection whenever it changes: a checkbox
   *  toggle that adds or drops a whole session, or controlled ids that name
   *  sessions the collection does not contain (reported with those dropped). */
  onSelectedSessionIdsChange?: (ids: string[]) => void;
  /** Follow override for items loaded from `src` (see RemoteSessionOptions). */
  follow?: boolean;
}

export function useSessionHierarchy(
  collection: SessionCollectionInput,
  {
    selectedSessionIds,
    onSelectedSessionIdsChange,
    follow,
  }: SessionHierarchyOptions = {}
): SessionHierarchyState {
  validateSessionCollection(collection);
  const [loaded, setLoaded] = useState<Map<string, UnifiedSessionInput>>(
    new Map()
  );
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const eventSourceFactory = useEventSourceFactory();
  // One live load per `src` item, keyed by item id; each reports into the
  // same loaded/loading/errors maps a `loadSession` load does.
  const remotes = useRef(
    new Map<string, { src: string; handle: RemoteSessionHandle }>()
  );
  const closeRemote = (id: string) => {
    remotes.current.get(id)?.handle.close();
    remotes.current.delete(id);
  };
  const openRemote = (item: SessionCollectionItem, src: string) => {
    const existing = remotes.current.get(item.id);
    if (existing?.src === src) return existing.handle.loaded;
    closeRemote(item.id);
    setLoading((previous) => new Set(previous).add(item.id));
    const handle = openRemoteSession(src, {
      ...(follow === undefined ? {} : { follow }),
      eventSourceFactory,
      onChange: ({ session, error, loading: busy }) => {
        if (session) setLoaded((previous) => new Map(previous).set(item.id, session));
        setLoading((previous) => withMember(previous, item.id, busy));
        setErrors((previous) => withEntry(previous, item.id, error));
      },
    });
    remotes.current.set(item.id, { src, handle });
    // A failed load is dropped so including the session again retries it; the
    // failure itself already reached `errors` through onChange.
    handle.loaded.catch(() => {
      if (remotes.current.get(item.id)?.handle === handle) closeRemote(item.id);
    });
    return handle.loaded;
  };
  useEffect(
    () => () => [...remotes.current.keys()].forEach(closeRemote),
    []
  );
  useEffect(() => {
    for (const [id, { src }] of remotes.current) {
      const item = collection.sessions.find((candidate) => candidate.id === id);
      if (item && !item.session && item.src === src) continue;
      closeRemote(id);
      setLoaded((previous) => withEntry(previous, id, undefined));
      setLoading((previous) => withMember(previous, id, false));
      setErrors((previous) => withEntry(previous, id, undefined));
    }
  }, [collection]);
  const roots = useMemo(
    () => buildSessionHierarchy(collection, loaded),
    [collection, loaded]
  );
  const controlled = selectedSessionIds !== undefined;
  const knownSelectedIds = (selectedSessionIds ?? []).filter((id) =>
    collection.sessions.some((item) => item.id === id)
  );
  const initialSessionIds = controlled
    ? knownSelectedIds
    : collection.defaultSelectedSessionIds?.length
      ? collection.defaultSelectedSessionIds
      : [collection.currentSessionId];
  const [checked, setChecked] = useState<Set<string>>(() =>
    initialCheckedKeys(roots, initialSessionIds)
  );
  // A controlled selection round-trips through the host (e.g. the URL) on every
  // toggle, so it must not be part of the identity — a reset would drop every
  // loaded session.
  const identity = `${collection.id}:${collection.currentSessionId}${
    controlled ? "" : `:${initialSessionIds.join(",")}`
  }`;
  const previousIdentity = useRef(identity);

  useEffect(() => {
    if (previousIdentity.current === identity) return;
    previousIdentity.current = identity;
    [...remotes.current.keys()].forEach(closeRemote);
    setLoaded(new Map());
    setLoading(new Set());
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
      if (item.src) return openRemote(item, item.src);
      if (!collection.loadSession) {
        throw new Error(
          `Session ${item.id} is not loaded and has neither a src nor a loader`
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

  const selectedKey = controlled ? (selectedSessionIds ?? []).join(",") : "";
  useEffect(() => {
    if (!controlled) return;
    if (knownSelectedIds.length !== selectedSessionIds.length) {
      onSelectedSessionIdsChange?.(knownSelectedIds);
    }
    if (!sameIds(knownSelectedIds, checkedSessionIds(roots, checked))) {
      setChecked(initialCheckedKeys(roots, knownSelectedIds));
    }
    for (const id of knownSelectedIds) {
      const item = collection.sessions.find((candidate) => candidate.id === id)!;
      if (collectionSession(item, loaded) || loading.has(id) || errors.has(id))
        continue;
      // The failure lands in `errors` and renders on the session's row.
      void ensureLoaded(item).catch(() => undefined);
    }
  }, [controlled, selectedKey, collection, roots, loaded, loading, errors]);

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
      const next = toggleHierarchyBranch(
        targetRoots,
        checked,
        nextNode.key,
        include
      );
      setChecked(next);
      const nextIds = checkedSessionIds(targetRoots, next);
      if (!sameIds(nextIds, checkedSessionIds(targetRoots, checked))) {
        onSelectedSessionIdsChange?.(nextIds);
      }
    },
    [checked, collection, ensureLoaded, loaded, onSelectedSessionIdsChange, roots]
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

function withMember(set: Set<string>, key: string, include: boolean) {
  if (set.has(key) === include) return set;
  const next = new Set(set);
  if (include) next.add(key);
  else next.delete(key);
  return next;
}

function withEntry<V>(map: Map<string, V>, key: string, value: V | undefined) {
  if (value === undefined ? !map.has(key) : map.get(key) === value) return map;
  const next = new Map(map);
  if (value === undefined) next.delete(key);
  else next.set(key, value);
  return next;
}

function sameIds(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id) => b.includes(id));
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
