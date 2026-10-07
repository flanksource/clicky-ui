// Two call graphs for the tests and stories. GO is uir's Go index (`GET /api/v1/modules/graph` for
// query.Pipeline.RunExpr, trimmed), with the package facts its responses carry. OIPA is the shape
// oipa-cli's reference graph takes: a transaction, its attached rule packet, a function that dispatches
// by plan to two copybooks, an unresolved name, and tiers as groups. Every GUID and name is invented.
import { UiBraces, UiForm, UiFunction, UiLedger, UiStack, UiWarningCircle } from "../../icons";
import {
  CALL_GRAPH_DATA_GLYPHS,
  callsItself,
  DATA_KIND_WORDS,
  dataNodeBacking,
  dataNodeGlyph,
  dataNodeStatus,
  isDataNode,
  type CallGraphVocabulary,
} from "./call-graph-vocabulary";
import type { CallGraph, CallGraphAccess, CallGraphEdge, CallGraphGroupFact, CallGraphNode, CallGraphSite } from "./types";

const QUERY = "github.com/flanksource/uir/query";
const UUID = "github.com/google/uuid";

type Declared = { id: string; type: string; method: string; path: string; line: number; depth: number; in: number; out: number };

const GO_DECLARED = {
  runModules: { id: "go-run-modules", type: "Pipeline", method: "RunModules", path: "query/modules.go", line: 79, depth: -1, in: 0, out: 1 },
  runExpr: { id: "go-run-expr", type: "Pipeline", method: "RunExpr", path: "query/modules.go", line: 120, depth: 0, in: 1, out: 2 },
  moduleScopes: { id: "go-module-scopes", type: "Pipeline", method: "moduleScopes", path: "query/modules_scope.go", line: 30, depth: 1, in: 1, out: 4 },
  runCompact: { id: "go-run-compact", type: "Pipeline", method: "runCompact", path: "query/compact_execute.go", line: 40, depth: 1, in: 1, out: 0 },
  headError: { id: "go-head-error", type: "", method: "headError", path: "query/modules_scope.go", line: 200, depth: 2, in: 1, out: 0 },
  broad: { id: "go-broad", type: "Pipeline", method: "broadModuleScopes", path: "query/modules_scope.go", line: 90, depth: 1, in: 1, out: 0 },
  fromHeads: { id: "go-from-heads", type: "Pipeline", method: "scopesFromHeads", path: "query/modules_scope.go", line: 140, depth: 1, in: 1, out: 0 },
} satisfies Record<string, Declared>;

const UUID_PARSE: CallGraphNode = {
  id: "go-uuid-parse", identifier: { package: UUID, method: "Parse", signature: "(s string) (UUID, error)", node_type: "method" },
  kind: "func", label: "Parse", group: UUID, depth: 2, in: 1, out: 0,
};

function goNode(symbol: Declared, depth = symbol.depth): CallGraphNode {
  return {
    id: symbol.id,
    identifier: { package: QUERY, ...(symbol.type ? { type: symbol.type } : {}), method: symbol.method, node_type: "method" },
    kind: symbol.type ? "method" : "func",
    label: symbol.type ? `${symbol.type}.${symbol.method}` : symbol.method,
    group: QUERY, depth, in: symbol.in, out: symbol.out,
    location: { path: symbol.path, line: symbol.line, column: 6, source_id: `src-${symbol.id}`, identity_key: symbol.id },
  };
}

function goEdge(from: { id: string }, to: { id: string }, sites: CallGraphSite[]): CallGraphEdge {
  return { id: `${from.id}|${to.id}|call`, from: from.id, to: to.id, type: "call", sites: sites.map((site) => ({ column: 2, ...site })) };
}

/** A uir response: the graph plus the package facts and effective exclusions it reports. */
export type GoGraph = CallGraph & { exclude: string[]; packages: CallGraphGroupFact[] };

export const GO_DEFAULT_EXCLUDE = ["std", "builtin", "gorm.io/..."];
export const GO_ROOT = GO_DECLARED.runExpr.id;
export const GO_EXPANDABLE = GO_DECLARED.moduleScopes;

export function goGraph(exclude: string[] = GO_DEFAULT_EXCLUDE): GoGraph {
  const { runModules, runExpr, moduleScopes, runCompact, headError } = GO_DECLARED;
  return {
    roots: [runExpr.id],
    nodes: [goNode(runModules), goNode(runExpr), goNode(moduleScopes), goNode(runCompact), goNode(headError), UUID_PARSE],
    edges: [
      goEdge(runModules, runExpr, [{ path: "query/modules.go", line: 84, text: "pipeline.RunExpr(ctx, input)" }]),
      goEdge(runExpr, moduleScopes, [{ path: "query/modules.go", line: 126, text: "pipeline.moduleScopes(ctx,\n\toptions.Scope)", guards: ["options.Scope != nil"] }]),
      goEdge(runExpr, runCompact, [{ path: "query/modules.go", line: 131, text: "pipeline.runCompact(ctx, input)" }]),
      goEdge(moduleScopes, headError, [{ path: "query/modules_scope.go", line: 44, text: "headError(location)", guards: ["err != nil"] }]),
      goEdge(moduleScopes, UUID_PARSE, [{ path: "query/modules_scope.go", line: 38, text: "uuid.Parse(options.Snapshot)" }]),
    ],
    groups: [{ id: QUERY, label: QUERY }, { id: UUID, label: UUID }],
    omitted: { beyond_depth: 4, excluded: { fmt: 3, builtin: 2, "gorm.io/gorm": 2, strings: 1 } },
    exclude,
    packages: [
      { name: QUERY, external: false, nodes: 5, excluded: false },
      { name: "fmt", external: true, nodes: 3, excluded: true },
      { name: "builtin", external: true, nodes: 2, excluded: true },
      { name: "gorm.io/gorm", external: true, nodes: 2, excluded: true },
      { name: UUID, external: true, nodes: 1, excluded: false },
      { name: "strings", external: true, nodes: 1, excluded: true },
    ],
  };
}

/** One hop of callees around moduleScopes: rooted at it, so its depths count from it. */
export function goModuleScopesExpansion(exclude: string[] = GO_DEFAULT_EXCLUDE): GoGraph {
  const { moduleScopes, headError, broad, fromHeads } = GO_DECLARED;
  return {
    roots: [moduleScopes.id],
    nodes: [goNode(moduleScopes, 0), goNode(headError, 1), { ...UUID_PARSE, depth: 1 }, goNode(broad), goNode(fromHeads)],
    edges: [
      goEdge(moduleScopes, headError, [{ path: "query/modules_scope.go", line: 44, text: "headError(location)", guards: ["err != nil"] }]),
      goEdge(moduleScopes, UUID_PARSE, [{ path: "query/modules_scope.go", line: 38, text: "uuid.Parse(options.Snapshot)" }]),
      goEdge(moduleScopes, broad, [{ path: "query/modules_scope.go", line: 52, text: "pipeline.broadModuleScopes(ctx)", guards: ["options.All"] }]),
      goEdge(moduleScopes, fromHeads, [{ path: "query/modules_scope.go", line: 57, text: "pipeline.scopesFromHeads(ctx)" }]),
    ],
    groups: [{ id: QUERY, label: QUERY }, { id: UUID, label: UUID }],
    omitted: {},
    exclude,
    packages: [],
  };
}

const PLAN = "Plan GL";
const PRODUCT = "Product Group Life";

function oipaNode(id: string, kind: string, label: string, group: string | undefined, depth: number, totals: { in: number; out: number }, ruleType?: string): CallGraphNode {
  const [entity, guid] = id.split(":");
  return {
    id, identifier: {}, kind, label, depth, ...totals, ...(group ? { group } : {}),
    properties: { guid: guid ?? id, tier: group ?? "standalone", ...(ruleType ? { ruleType } : {}), entity: entity ?? "" },
  };
}

function oipaEdge(from: string, to: string, type: CallGraphEdge["type"], kind: string, site: CallGraphSite, properties?: Record<string, string>): CallGraphEdge {
  return { id: `${from}|${to}|${type}`, from, to, type, kind, sites: [site], ...(properties ? { properties } : {}) };
}

export const OIPA_IDS = {
  transaction: "transaction:6A1F0C52-0000-4000-8000-000000000001",
  packet: "business-rule:6A1F0C52-0000-4000-8000-000000000002",
  premium: "business-rule:6A1F0C52-0000-4000-8000-000000000003",
  planCopybook: "business-rule:6A1F0C52-0000-4000-8000-000000000004",
  productCopybook: "business-rule:6A1F0C52-0000-4000-8000-000000000005",
  unresolved: "unresolved:function:LegacyRates",
  formatAmount: "business-rule:6A1F0C52-0000-4000-8000-000000000006",
  lookupRate: "business-rule:6A1F0C52-0000-4000-8000-000000000007",
} as const;

const ids = OIPA_IDS;
const PACKET_SITE: CallGraphSite = { path: "SchemeInstallPacket", line: 14, text: "<Function>CalculatePremium</Function>" };

/** A graph as oipa-cli serves it without guards: those are fetched for the selected edge only. */
export function oipaGraph(): CallGraph {
  return {
    roots: [ids.transaction],
    nodes: [
      oipaNode(ids.transaction, "transaction", "SchemeInstall", PLAN, 0, { in: 0, out: 1 }),
      oipaNode(ids.packet, "TransactionBusinessRulePacket", "SchemeInstallPacket", PLAN, 1, { in: 1, out: 1 }, "TransactionBusinessRulePacket"),
      oipaNode(ids.premium, "function", "CalculatePremium", PRODUCT, 2, { in: 1, out: 3 }, "Function"),
      oipaNode(ids.planCopybook, "copybook", "PremiumRates", PLAN, 3, { in: 1, out: 2 }, "CopyBook"),
      oipaNode(ids.productCopybook, "copybook", "PremiumRates", PRODUCT, 3, { in: 1, out: 0 }, "CopyBook"),
      { ...oipaNode(ids.unresolved, "function", "LegacyRates", undefined, 3, { in: 1, out: 0 }), unresolved: true },
    ],
    edges: [
      oipaEdge(ids.transaction, ids.packet, "call", "attached", { path: "SchemeInstall", line: 1, text: "<TransactionBusinessRulePacket>" }),
      oipaEdge(ids.packet, ids.premium, "call", "function", PACKET_SITE),
      oipaEdge(ids.premium, ids.planCopybook, "dispatch", "copybook", { path: "CalculatePremium", line: 9, text: "<CopyBook>PremiumRates</CopyBook>" }, { plans: "GL" }),
      oipaEdge(ids.premium, ids.productCopybook, "dispatch", "copybook", { path: "CalculatePremium", line: 9, text: "<CopyBook>PremiumRates</CopyBook>" }, { plans: "GLX, GL2", noPlan: "true" }),
      oipaEdge(ids.premium, ids.unresolved, "call", "function", { path: "CalculatePremium", line: 21, text: "<Function>LegacyRates</Function>" }),
    ],
    groups: [{ id: PLAN, label: PLAN }, { id: PRODUCT, label: PRODUCT }],
    omitted: { unresolved: 1 },
  };
}

/** One hop of callees around the plan copybook. */
export function oipaPlanCopybookExpansion(): CallGraph {
  return {
    roots: [ids.planCopybook],
    nodes: [
      oipaNode(ids.planCopybook, "copybook", "PremiumRates", PLAN, 0, { in: 1, out: 2 }, "CopyBook"),
      oipaNode(ids.formatAmount, "function", "FormatAmount", PRODUCT, 1, { in: 1, out: 0 }, "Function"),
      oipaNode(ids.lookupRate, "function", "LookupRate", PLAN, 1, { in: 1, out: 0 }, "Function"),
    ],
    edges: [
      oipaEdge(ids.planCopybook, ids.formatAmount, "call", "function", { path: "PremiumRates", line: 4, text: "<Function>FormatAmount</Function>" }),
      oipaEdge(ids.planCopybook, ids.lookupRate, "call", "function", { path: "PremiumRates", line: 7, text: "<Function>LookupRate</Function>" }),
    ],
    groups: [{ id: PLAN, label: PLAN }, { id: PRODUCT, label: PRODUCT }],
    omitted: {},
  };
}

const OIPA_KINDS: Record<string, string> = {
  transaction: "transaction",
  TransactionBusinessRulePacket: "rule packet",
  function: "function",
  copybook: "copybook",
  ...DATA_KIND_WORDS,
};

/** How a host names OIPA's kinds: every resolved node has a body to walk, located or not. */
export const OIPA_VOCABULARY: CallGraphVocabulary = {
  glyphs: [
    { id: "transaction", name: "transaction", icon: UiBraces },
    { id: "TransactionBusinessRulePacket", name: "rule packet", icon: UiForm },
    { id: "function", name: "function", icon: UiFunction },
    { id: "copybook", name: "copybook", icon: UiLedger },
    ...CALL_GRAPH_DATA_GLYPHS,
    { id: "unresolved", name: "unresolved name", icon: UiWarningCircle },
  ],
  glyphOf: (_graph, node) => (node.unresolved ? "unresolved" : dataNodeGlyph(node)),
  kindOf: (graph, node) => {
    if (node.unresolved) return `unresolved ${node.kind}`;
    const kind = OIPA_KINDS[node.kind];
    if (kind === undefined) throw new Error(`OIPA call graph: no words for kind "${node.kind}"`);
    return callsItself(graph, node) ? `recursive ${kind}` : kind;
  },
  hasSource: (node) => !node.unresolved && (!isDataNode(node) || node.kind === "procedure"),
  canRoot: (node) => !node.unresolved,
  isData: isDataNode,
  muted: (node) => Boolean(node.unresolved),
  status: (node) => {
    if (node.unresolved) return "Unresolved: no rule of this name in the request scope";
    return isDataNode(node) ? dataNodeStatus(node) : "Resolved";
  },
  backing: dataNodeBacking,
  group: { noun: "tier", plural: "tiers", icon: UiStack, patternHint: "Plan GL" },
};

type DataFact = { from: string; to: string; type: CallGraphEdge["type"]; kind: string; site: CallGraphSite };

export const DATA_IDS = {
  install: OIPA_IDS.transaction,
  packet: OIPA_IDS.packet,
  proc: "procedure:Update_ClassGroup",
  policyStatus: "field:Policy.PolicyStatus",
  planGuid: "column:AsPolicy.PLANGUID",
  statusCode: "column:AsPolicy.STATUSCODE",
  classGroupStatus: "column:AsClassGroup.STATUSCODE",
  schemeNumber: "field:Policy.SchemeNumber",
  activity: "table:AsActivity",
  client: "table:AsClient",
} as const;

/** The AsClient columns one SQL math variable reads: more than an edge shows as chips at first. */
export const DATA_CLIENT_COLUMNS = ["CLIENTGUID", "TYPECODE", "STATUSCODE", "FIRSTNAME", "LASTNAME", "DATEOFBIRTH", "SEXCODE", "TAXID", "COUNTRYCODE", "UPDATEDGMT"];

const STATUS_SQL = "MathVariable TYPE=SQL: SELECT PLANGUID, STATUSCODE FROM AsPolicy WHERE POLICYGUID = '[PolicyGUID]'";
const CLIENT_SQL = `MathVariable TYPE=SQL: SELECT ${DATA_CLIENT_COLUMNS.join(", ")} FROM AsClient WHERE CLIENTGUID = '[ClientGUID]'`;

// Each fact as the expanded graph holds it: one edge per column or field.
const DATA_FACTS: DataFact[] = [
  { from: DATA_IDS.install, to: DATA_IDS.packet, type: "call", kind: "attached", site: { path: "SchemeInstall", line: 1, text: "<TransactionBusinessRulePacket>" } },
  { from: DATA_IDS.packet, to: DATA_IDS.policyStatus, type: "read", kind: "field-ref", site: { path: "SchemeInstallPacket", line: 6, text: `<MathIF IF="Policy:PolicyStatus = '08'">` } },
  { from: DATA_IDS.packet, to: DATA_IDS.policyStatus, type: "write", kind: "mathupdate", site: { path: "SchemeInstallPacket", line: 8, text: `<MathUpdate TYPE="POLICYFIELD">PolicyStatus</MathUpdate>` } },
  { from: DATA_IDS.packet, to: DATA_IDS.schemeNumber, type: "read", kind: "field-ref", site: { path: "SchemeInstallPacket", line: 9, text: `<MathIF IF="Policy:SchemeNumber <> ''">` } },
  { from: DATA_IDS.packet, to: DATA_IDS.planGuid, type: "read", kind: "sql", site: { path: "SchemeInstallPacket", line: 11, text: STATUS_SQL } },
  { from: DATA_IDS.packet, to: DATA_IDS.statusCode, type: "read", kind: "sql", site: { path: "SchemeInstallPacket", line: 11, text: STATUS_SQL } },
  ...DATA_CLIENT_COLUMNS.map((column): DataFact => ({ from: DATA_IDS.packet, to: `column:AsClient.${column}`, type: "read", kind: "sql", site: { path: "SchemeInstallPacket", line: 13, text: CLIENT_SQL } })),
  { from: DATA_IDS.packet, to: DATA_IDS.activity, type: "read", kind: "sql-fill", site: { path: "SchemeInstallPacket", line: 15, text: "FILLBY-SQL: SELECT * FROM AsActivity WHERE POLICYGUID = '[PolicyGUID]'" } },
  { from: DATA_IDS.packet, to: DATA_IDS.proc, type: "call", kind: "exec", site: { path: "SchemeInstallPacket", line: 19, text: "EXEC Update_ClassGroup '[ClassGroupGUID]'" } },
  { from: DATA_IDS.proc, to: DATA_IDS.classGroupStatus, type: "write", kind: "sql", site: { path: "Update_ClassGroup", line: 4, text: "UPDATE AsClassGroup SET STATUSCODE = '01'" } },
];

const DEPTHS: Record<string, number> = { [DATA_IDS.install]: 0, [DATA_IDS.packet]: 1, [DATA_IDS.proc]: 2 };

const DATA_PROPERTIES: Record<string, Record<string, string>> = {
  [DATA_IDS.policyStatus]: { column: "AsPolicy.STATUSCODE" },
  [DATA_IDS.planGuid]: { sqlType: "uniqueidentifier" },
  [DATA_IDS.statusCode]: { sqlType: "nvarchar(2)" },
  [DATA_IDS.classGroupStatus]: { sqlType: "nvarchar(2)" },
  "column:AsClient.CLIENTGUID": { sqlType: "uniqueidentifier", primaryKey: "true" },
  "column:AsClient.TYPECODE": { sqlType: "nvarchar(2)" },
  "column:AsClient.STATUSCODE": { sqlType: "nvarchar(2)" },
  "column:AsClient.FIRSTNAME": { sqlType: "nvarchar(100)" },
  "column:AsClient.LASTNAME": { sqlType: "nvarchar(100)" },
  "column:AsClient.DATEOFBIRTH": { sqlType: "datetime2" },
  "column:AsClient.SEXCODE": { sqlType: "nvarchar(2)" },
  "column:AsClient.TAXID": { sqlType: "nvarchar(20)" },
  "column:AsClient.COUNTRYCODE": { sqlType: "nvarchar(3)" },
  "column:AsClient.UPDATEDGMT": { sqlType: "datetime2" },
};

function dataNode(id: string, depth: number): CallGraphNode {
  const [kind, name = ""] = id.split(":") as [string, string];
  const [owner = "", member = name] = name.split(".");
  const totals = { in: 0, out: 0 };
  if (id === DATA_IDS.install) return oipaNode(id, "transaction", "SchemeInstall", PLAN, depth, totals);
  if (id === DATA_IDS.packet) return oipaNode(id, "TransactionBusinessRulePacket", "SchemeInstallPacket", PLAN, depth, totals, "TransactionBusinessRulePacket");
  const group = kind === "column" || kind === "field" ? owner : kind === "entity" ? "Fields" : "Database";
  const label = kind === "column" || kind === "field" ? member : name;
  const properties = DATA_PROPERTIES[id];
  return { id, identifier: {}, kind, label, group, depth, ...totals, ...(properties ? { properties } : {}) };
}

/** A column or field's collapsed node, and the property its member name is gathered under. */
function collapsed(id: string): { id: string; member?: { key: "columns" | "fields"; name: string } } {
  const [kind, name = ""] = id.split(":") as [string, string];
  const [owner = "", member = ""] = name.split(".");
  if (kind === "column") return { id: `table:${owner}`, member: { key: "columns", name: member } };
  if (kind === "field") return { id: `entity:${owner}`, member: { key: "fields", name: member } };
  return { id };
}

/**
 * SchemeInstall's data access as a host serves it: collapsed into tables and entities unless `columns`,
 * and only the edge types `access` asks for. The totals count the edges the filter keeps.
 */
export function oipaDataGraph({ access, columns }: { access: readonly CallGraphAccess[]; columns: boolean }): CallGraph {
  const kept = DATA_FACTS.filter((fact) => access.includes(fact.type === "dispatch" ? "call" : (fact.type as CallGraphAccess)));
  const edges = new Map<string, CallGraphEdge>();
  for (const fact of kept) {
    const to = columns ? { id: fact.to } : collapsed(fact.to);
    const id = `${fact.from}|${to.id}|${fact.type}`;
    const held = edges.get(id) ?? { id, from: fact.from, to: to.id, type: fact.type, kind: fact.kind, sites: [] };
    if (held.kind !== fact.kind) throw new Error(`edge ${id} merges a ${held.kind} and a ${fact.kind}`);
    if (!held.sites.some((site) => site.line === fact.site.line)) held.sites.push(fact.site);
    if (to.member) {
      const members = held.properties?.[to.member.key]?.split(", ") ?? [];
      held.properties = { ...held.properties, [to.member.key]: [...members, to.member.name].join(", ") };
    }
    edges.set(id, held);
  }
  const ids = [...new Set([DATA_IDS.install, ...[...edges.values()].flatMap((edge) => [edge.from, edge.to])])];
  const nodes = ids.map((id) => {
    const depth = DEPTHS[id] ?? ([...edges.values()].some((edge) => edge.to === id && edge.from === DATA_IDS.proc) ? 3 : 2);
    const shaped = dataNode(id, depth);
    return { ...shaped, in: [...edges.values()].filter((edge) => edge.to === id).length, out: [...edges.values()].filter((edge) => edge.from === id).length };
  });
  const groups = [...new Set(nodes.map((node) => node.group).filter((group): group is string => group !== undefined))].map((group) => ({ id: group, label: group }));
  return { roots: [DATA_IDS.install], nodes, edges: [...edges.values()], groups, omitted: {} };
}

/** The guards oipa-cli computes on request, per edge: one site is guarded by its packet `Rule IF=`. */
export const OIPA_GUARDS: Record<string, CallGraphSite[]> = {
  [`${ids.packet}|${ids.premium}|call`]: [{ ...PACKET_SITE, guards: ["IsGroupScheme = 'Y'"] }],
};
