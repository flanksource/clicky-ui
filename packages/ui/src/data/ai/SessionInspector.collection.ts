import { costTotal } from "./session-cost";
import type {
  SessionAgent,
  SessionCost,
  SessionTurn,
  SessionUsage,
  UnifiedSessionInput,
} from "./SessionViewer.unified";
import type {
  SessionCollectionInput,
  SessionCollectionItem,
  SessionHierarchyNode,
  SessionInspectorInput,
} from "./SessionInspector.collection-types";

export type {
  SessionCollectionInput,
  SessionCollectionItem,
  SessionCollectionSummary,
  SessionHierarchyNode,
  SessionHierarchyNodeKind,
  SessionInspectorInput,
} from "./SessionInspector.collection-types";
export function isSessionCollectionInput(
  value: SessionInspectorInput
): value is SessionCollectionInput {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "kind" in value &&
    value.kind === "session-collection"
  );
}
export function validateSessionCollection(collection: SessionCollectionInput) {
  const current = collection.sessions.find(
    (item) => item.id === collection.currentSessionId
  );
  if (!current) {
    throw new Error(
      `Session collection ${collection.id} does not contain current session ${collection.currentSessionId}`
    );
  }
  if (!current.session) {
    throw new Error(
      `Current session ${collection.currentSessionId} must be loaded`
    );
  }
}
export function collectionSession(
  item: SessionCollectionItem,
  loaded: ReadonlyMap<string, UnifiedSessionInput>
) {
  return item.session ?? loaded.get(item.id);
}
export function buildSessionHierarchy(
  collection: SessionCollectionInput,
  loaded: ReadonlyMap<string, UnifiedSessionInput>
): SessionHierarchyNode[] {
  const nodes = new Map<string, SessionHierarchyNode>();
  for (const item of collection.sessions) {
    nodes.set(item.id, buildSessionNode(item, collectionSession(item, loaded)));
  }

  const roots: SessionHierarchyNode[] = [];
  for (const item of collection.sessions) {
    const node = nodes.get(item.id)!;
    const parent = item.parentId ? nodes.get(item.parentId) : undefined;
    if (parent) parent.children.unshift(node);
    else roots.push(node);
  }
  return roots;
}
function buildSessionNode(
  item: SessionCollectionItem,
  session?: UnifiedSessionInput
): SessionHierarchyNode {
  const summary = item.summary;
  const rootAgent =
    session?.root ?? session?.agents?.find((agent) => agent.isRoot);
  const agents = session ? agentForest(item.id, session, rootAgent?.id) : [];
  const rootTurns = session
    ? session.turns
        ?.filter(
          (turn) =>
            !turnAgentId(session, turn.id) ||
            turnAgentId(session, turn.id) === rootAgent?.id
        )
        .map((turn) => turnNode(item.id, turn, session)) ?? []
    : [];
  return {
    key: sessionKey(item.id),
    kind: "session",
    itemId: item.id,
    label: item.label || session?.title || session?.model || item.id,
    provider: summary?.provider ?? session?.provider,
    model: summary?.model ?? session?.model,
    effort: summary?.effort ?? session?.reasoningEffort,
    mode: item.mode ?? summary?.mode ?? session?.backend,
    status: item.status ?? summary?.status ?? session?.live?.status,
    pid: summary?.pid,
    durationMs: summary?.durationMs,
    updatedAt: summary?.updatedAt,
    cost: summary?.cost ?? costTotal(session?.cost),
    usage: session?.usage,
    costDetail: session?.cost,
    item,
    ...(rootAgent ? { agent: rootAgent } : {}),
    children: [...agents, ...rootTurns],
  };
}

function agentForest(
  itemId: string,
  session: UnifiedSessionInput,
  rootAgentId?: string
) {
  const agents = flattenAgents(session);
  const nodes = new Map<string, SessionHierarchyNode>();
  for (const agent of agents) {
    if (!agent.id || agent.id === rootAgentId || agent.isRoot) continue;
    nodes.set(agent.id, agentNode(itemId, session, agent));
  }
  const roots: SessionHierarchyNode[] = [];
  for (const agent of agents) {
    if (!agent.id || !nodes.has(agent.id)) continue;
    const node = nodes.get(agent.id)!;
    const parent = agent.parentId ? nodes.get(agent.parentId) : undefined;
    if (parent) parent.children.unshift(node);
    else roots.push(node);
  }
  return roots;
}

function flattenAgents(session: UnifiedSessionInput) {
  const agents = new Map<string, SessionAgent>();
  const visit = (agent: SessionAgent) => {
    if (agent.id && !agents.has(agent.id)) agents.set(agent.id, agent);
    agent.children?.forEach(visit);
  };
  if (session.root) visit(session.root);
  session.agents?.forEach(visit);
  return [...agents.values()];
}

function agentNode(
  itemId: string,
  session: UnifiedSessionInput,
  agent: SessionAgent
): SessionHierarchyNode {
  const turns =
    session.turns
      ?.filter((turn) => turnAgentId(session, turn.id) === agent.id)
      .map((turn) => turnNode(itemId, turn, session)) ?? [];
  return {
    key: `${itemId}:agent:${agent.id}`,
    kind: "agent",
    itemId,
    label: agent.desc || agent.type || `Agent ${agent.id}`,
    provider: session.provider,
    model: session.model,
    effort: session.reasoningEffort,
    mode: session.backend,
    status: undefined,
    pid: undefined,
    durationMs: undefined,
    updatedAt: undefined,
    cost: costTotal(agent.cost),
    usage: agent.usage,
    costDetail: agent.cost,
    agent,
    children: turns,
  };
}

function turnNode(
  itemId: string,
  turn: SessionTurn,
  session: UnifiedSessionInput
): SessionHierarchyNode {
  return {
    key: `${itemId}:turn:${turn.id}`,
    kind: "turn",
    itemId,
    label: `Turn ${turn.index}`,
    provider: session.provider,
    model: turn.model || session.model,
    effort: turn.reasoningEffort || session.reasoningEffort,
    mode: turn.backend || session.backend,
    status: turn.status,
    pid: undefined,
    durationMs: undefined,
    updatedAt: undefined,
    cost: costTotal(turn.cost),
    usage: turn.usage,
    costDetail: turn.cost,
    turn,
    children: [],
  };
}

function turnAgentId(session: UnifiedSessionInput, turnId: string) {
  return session.messages?.find((message) => message.turnId === turnId)
    ?.provenance?.agentId;
}

export function sessionKey(itemId: string) {
  return `${itemId}:session`;
}

export function branchKeys(node: SessionHierarchyNode): string[] {
  return [node.key, ...node.children.flatMap(branchKeys)];
}

export function initialCheckedKeys(
  roots: SessionHierarchyNode[],
  sessionIds: readonly string[]
) {
  const checked = new Set<string>();
  for (const sessionId of sessionIds) {
    const node = findNode(roots, sessionKey(sessionId));
    if (node) branchKeys(node).forEach((key) => checked.add(key));
  }
  return checked;
}

export function toggleHierarchyBranch(
  roots: SessionHierarchyNode[],
  checked: ReadonlySet<string>,
  key: string,
  include: boolean
) {
  const next = new Set(checked);
  const node = findNode(roots, key);
  if (!node) return next;
  for (const branchKey of branchKeys(node)) {
    if (include) next.add(branchKey);
    else next.delete(branchKey);
  }
  normalizeCheckedRoots(roots, next);
  return next;
}

function normalizeCheckedRoots(
  roots: SessionHierarchyNode[],
  checked: Set<string>
) {
  const visit = (node: SessionHierarchyNode): boolean => {
    if (node.children.length === 0) return checked.has(node.key);
    const complete = node.children.every(visit);
    if (complete) checked.add(node.key);
    else checked.delete(node.key);
    return complete;
  };
  roots.forEach(visit);
}

export function hierarchyCheckState(
  node: SessionHierarchyNode,
  checked: ReadonlySet<string>
) {
  if (checked.has(node.key)) return "checked" as const;
  if (node.children.some((child) => hasCheckedNode(child, checked)))
    return "indeterminate" as const;
  return "unchecked" as const;
}

function hasCheckedNode(
  node: SessionHierarchyNode,
  checked: ReadonlySet<string>
): boolean {
  return (
    checked.has(node.key) ||
    node.children.some((child) => hasCheckedNode(child, checked))
  );
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

export function selectedSessionCount(
  roots: SessionHierarchyNode[],
  checked: ReadonlySet<string>
) {
  let count = 0;
  const visit = (node: SessionHierarchyNode) => {
    if (node.kind === "session" && hasCheckedNode(node, checked)) count++;
    node.children.forEach(visit);
  };
  roots.forEach(visit);
  return count;
}

export function filterSessionCollection(
  collection: SessionCollectionInput,
  loaded: ReadonlyMap<string, UnifiedSessionInput>,
  roots: SessionHierarchyNode[],
  checked: ReadonlySet<string>
): UnifiedSessionInput {
  const current = collection.sessions.find(
    (item) => item.id === collection.currentSessionId
  )!;
  const base = collectionSession(current, loaded)!;
  const selected = collection.sessions.flatMap((item) => {
    const session = collectionSession(item, loaded);
    const node = findNode(roots, sessionKey(item.id));
    if (!session || !node || !hasCheckedNode(node, checked)) return [];
    return [
      { itemId: item.id, session: filterOneSession(session, node, checked) },
    ];
  });
  const sessions = selected.map(({ itemId, session }) =>
    selected.length > 1 ? namespaceSession(session, itemId) : session
  );
  const messages = sessions.flatMap((session) => session.messages ?? []);
  messages.sort((a, b) =>
    (a.provenance?.timestamp || "").localeCompare(b.provenance?.timestamp || "")
  );
  const usage = sumUsage(sessions.map((session) => session.usage));
  const cost = sumCosts(sessions.map((session) => session.cost));
  return {
    ...base,
    id: collection.id,
    messages,
    turns: sessions.flatMap((session) => session.turns ?? []),
    events: sessions.flatMap((session) => session.events ?? []),
    ...(usage ? { usage } : {}),
    ...(cost ? { cost } : {}),
    toolCosts: sessions.flatMap((session) => session.toolCosts ?? []),
  };
}

function namespaceSession(
  session: UnifiedSessionInput,
  itemId: string
): UnifiedSessionInput {
  const namespace = (id: string) => `${itemId}:${id}`;
  const messageIds = new Set(
    session.messages?.flatMap((message) => (message.id ? [message.id] : []))
  );
  const messages = session.messages?.map((message, index) => ({
    ...message,
    id: namespace(message.id || `message-${index + 1}`),
    ...(message.turnId ? { turnId: namespace(message.turnId) } : {}),
  }));
  const turns = session.turns?.map((turn) => ({
    ...turn,
    id: namespace(turn.id),
    ...(turn.messageIds ? { messageIds: turn.messageIds.map(namespace) } : {}),
  }));
  const events = session.events?.map((event) => ({
    ...event,
    ...(event.turnId ? { turnId: namespace(event.turnId) } : {}),
    ...(event.uuid && messageIds.has(event.uuid)
      ? { uuid: namespace(event.uuid) }
      : {}),
  }));
  return {
    ...session,
    ...(messages ? { messages } : {}),
    ...(turns ? { turns } : {}),
    ...(events ? { events } : {}),
  };
}

function filterOneSession(
  session: UnifiedSessionInput,
  node: SessionHierarchyNode,
  checked: ReadonlySet<string>
): UnifiedSessionInput {
  if (checked.has(node.key)) return session;
  const turnIds = new Set<string>();
  const agentIds = new Set<string>();
  const costNodes: SessionHierarchyNode[] = [];
  const visit = (child: SessionHierarchyNode) => {
    if (child.kind === "session") return;
    if (checked.has(child.key)) {
      costNodes.push(child);
      if (child.kind === "turn" && child.turn) turnIds.add(child.turn.id);
      if (child.kind === "agent" && child.agent?.id)
        collectAgentIds(child, agentIds);
      return;
    }
    child.children.forEach(visit);
  };
  node.children.forEach(visit);
  const messages = session.messages?.filter(
    (message) =>
      (message.turnId && turnIds.has(message.turnId)) ||
      (message.provenance?.agentId && agentIds.has(message.provenance.agentId))
  );
  const includedTurns = new Set(
    messages?.flatMap((message) => (message.turnId ? [message.turnId] : []))
  );
  turnIds.forEach((id) => includedTurns.add(id));
  const events = session.events?.filter(
    (event) =>
      (event.turnId && includedTurns.has(event.turnId)) ||
      (event.uuid && messages?.some((message) => message.id === event.uuid))
  );
  const usage = sumUsage(costNodes.map((entry) => entry.usage));
  const cost = sumCosts(costNodes.map((entry) => entry.costDetail));
  return {
    ...session,
    messages: messages ?? [],
    turns: session.turns?.filter((turn) => includedTurns.has(turn.id)) ?? [],
    ...(events ? { events } : {}),
    ...(usage ? { usage } : {}),
    ...(cost ? { cost } : {}),
    toolCosts: [],
  };
}

function collectAgentIds(node: SessionHierarchyNode, ids: Set<string>) {
  if (node.agent?.id) ids.add(node.agent.id);
  node.children.forEach((child) => collectAgentIds(child, ids));
}

function sumUsage(
  values: Array<SessionUsage | undefined>
): SessionUsage | undefined {
  const present = values.filter((value): value is SessionUsage =>
    Boolean(value)
  );
  if (!present.length) return undefined;
  return sumFields(present);
}

function sumCosts(
  values: Array<SessionCost | undefined>
): SessionCost | undefined {
  const present = values.filter((value): value is SessionCost =>
    Boolean(value)
  );
  if (!present.length) return undefined;
  const costFields = [
    "inputCost",
    "outputCost",
    "reasoningCost",
    "cacheReadCost",
    "cacheWriteCost",
  ] as const;
  const model = present.length === 1 ? present[0]?.model : undefined;
  return {
    ...sumFields(present),
    ...Object.fromEntries(
      costFields.map((field) => [
        field,
        present.reduce((sum, value) => sum + (value[field] ?? 0), 0),
      ])
    ),
    ...(model ? { model } : {}),
  };
}

function sumFields(values: SessionUsage[]): SessionUsage {
  const fields: Array<keyof SessionUsage> = [
    "inputTokens",
    "outputTokens",
    "reasoningTokens",
    "cacheReadTokens",
    "cacheWriteTokens",
    "totalTokens",
  ];
  return Object.fromEntries(
    fields.map((field) => [
      field,
      values.reduce((sum, value) => sum + (value[field] ?? 0), 0),
    ])
  );
}
