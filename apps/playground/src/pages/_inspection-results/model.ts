export type InspectionMode = "connection" | "profile";

export type FilterResolution = {
  label: string;
  kind: "terms" | "lookup" | "range" | "time" | "text" | "none";
  origin: "Inferred" | "Profile override" | "Disabled";
  field?: string;
  lookup?: boolean;
  multi?: boolean;
  reason: string;
};

export type Cardinality = {
  value: number;
  relation: "Exact" | "Estimated";
  cached: boolean;
};

export type InspectedField = Record<string, unknown> & {
  id: string;
  name: string;
  source?: string;
  databaseType: string;
  semanticType: string;
  cardinality?: Cardinality;
  filter: FilterResolution;
};

export type ResolvedLimit = {
  label: string;
  value: number;
  origin: "Provider default" | "Profile override";
};

export type PagingResolution = {
  selected: "Offset" | "Cursor";
  supported: Array<"Offset" | "Cursor">;
  execution: "Native" | "Buffered";
  order: string;
  consistency: "Live" | "Snapshot";
  note: string;
  limits: ResolvedLimit[];
};

export type InspectionResult = {
  name: string;
  provider: string;
  connection: string;
  scopeLabel: string;
  scope: string;
  query: string;
  status: "Complete" | "Partial";
  statusNote: string;
  durationMs: number;
  cache: {
    policy: string;
    state: "Fresh" | "Stale";
    age: string;
    cached: boolean;
  };
  fields: InspectedField[];
  paging: PagingResolution;
};

export type ConnectionInspection = {
  id: string;
  label: string;
  provider: string;
  targets: Array<{
    id: string;
    label: string;
    result: InspectionResult;
  }>;
};

export type ProfileInspection = {
  id: string;
  label: string;
  result: InspectionResult;
};

export function requiredFixture<T extends { id: string }>(
  values: readonly T[],
  id: string,
  kind: string,
): T {
  const value = values.find((candidate) => candidate.id === id);
  if (!value)
    throw new Error(`Unknown inspection ${kind} ${JSON.stringify(id)}`);
  return value;
}

export function firstFixture<T>(values: readonly T[], kind: string): T {
  const value = values[0];
  if (!value) throw new Error(`Inspection playground has no ${kind} fixtures`);
  return value;
}
