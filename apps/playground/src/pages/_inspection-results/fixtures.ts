import type {
  ConnectionInspection,
  InspectionResult,
  ProfileInspection,
} from "./model";

const providerLimits = [
  { label: "Default page", value: 100, origin: "Provider default" as const },
  { label: "Maximum page", value: 1_000, origin: "Provider default" as const },
  {
    label: "Export ceiling",
    value: 100_000,
    origin: "Provider default" as const,
  },
];

const telemetryTraces: InspectionResult = {
  name: "otel-traces-*",
  provider: "OpenSearch",
  connection: "connection://telemetry-search",
  scopeLabel: "Index pattern",
  scope: "otel-traces-* · 42 indexes",
  query: '{"query":{"match_all":{}}}',
  status: "Complete",
  statusNote: "Mappings and seven eligible columns inspected successfully.",
  durationMs: 486,
  cache: {
    policy: "column-cardinality",
    state: "Fresh",
    age: "18s",
    cached: true,
  },
  fields: [
    {
      id: "timestamp",
      name: "timestamp",
      databaseType: "date_nanos",
      semanticType: "datetime",
      filter: {
        label: "Time range",
        kind: "time",
        origin: "Inferred",
        field: "timestamp",
        reason: "A date mapping resolves to the shared time-range control.",
      },
    },
    {
      id: "service-name",
      name: "service.name",
      databaseType: "keyword",
      semanticType: "string",
      cardinality: { value: 23, relation: "Exact", cached: true },
      filter: {
        label: "Terms",
        kind: "terms",
        origin: "Inferred",
        field: "service.name",
        multi: true,
        reason: "23 distinct values is below the 50-option limit.",
      },
    },
    {
      id: "span-name",
      name: "span.name",
      databaseType: "wildcard",
      semanticType: "string",
      cardinality: { value: 1_842, relation: "Estimated", cached: true },
      filter: {
        label: "Typeahead",
        kind: "lookup",
        origin: "Inferred",
        field: "span.name",
        lookup: true,
        multi: true,
        reason:
          "The option head is capped; typing asks the backend for matching values.",
      },
    },
    {
      id: "trace-id",
      name: "trace.id",
      databaseType: "keyword (id)",
      semanticType: "string",
      cardinality: { value: 983_421, relation: "Estimated", cached: false },
      filter: {
        label: "Text",
        kind: "text",
        origin: "Inferred",
        field: "trace.id",
        reason:
          "High cardinality makes enumerating values misleading and expensive.",
      },
    },
    {
      id: "duration",
      name: "duration.ms",
      databaseType: "double",
      semanticType: "duration · ms",
      filter: {
        label: "Range",
        kind: "range",
        origin: "Inferred",
        field: "duration.ms",
        reason:
          "Numeric duration resolves to lower and upper bounds in milliseconds.",
      },
    },
    {
      id: "status-code",
      name: "status.code",
      databaseType: "constant_keyword",
      semanticType: "status",
      cardinality: { value: 3, relation: "Exact", cached: true },
      filter: {
        label: "Terms",
        kind: "terms",
        origin: "Inferred",
        field: "status.code",
        multi: true,
        reason: "Three stable status values fit in a compact multi-select.",
      },
    },
    {
      id: "resource-attributes",
      name: "resource.attributes",
      databaseType: "object",
      semanticType: "json",
      filter: {
        label: "None",
        kind: "none",
        origin: "Disabled",
        reason:
          "An object has no scalar backend field that can bind one filter value.",
      },
    },
  ],
  paging: {
    selected: "Offset",
    supported: ["Offset"],
    execution: "Native",
    order: "Provider result order",
    consistency: "Live",
    note: "The connection browser serves bounded offset pages; cursor selection requires a profile with a total order.",
    limits: providerLimits,
  },
};

const applicationLogs: InspectionResult = {
  name: "application-logs-*",
  provider: "OpenSearch",
  connection: "connection://telemetry-search",
  scopeLabel: "Index pattern",
  scope: "application-logs-* · 14 indexes",
  query: '{"query":{"range":{"@timestamp":{"gte":"now-1h"}}}}',
  status: "Partial",
  statusNote:
    "Field mappings are current; cardinality is using stale metadata after a refresh failed.",
  durationMs: 92,
  cache: {
    policy: "column-cardinality",
    state: "Stale",
    age: "2h 14m",
    cached: true,
  },
  fields: [
    {
      id: "log-time",
      name: "@timestamp",
      databaseType: "date",
      semanticType: "datetime",
      filter: {
        label: "Time range",
        kind: "time",
        origin: "Inferred",
        field: "@timestamp",
        reason: "The mapped timestamp becomes the table's time-range control.",
      },
    },
    {
      id: "level",
      name: "level",
      databaseType: "keyword",
      semanticType: "status",
      cardinality: { value: 6, relation: "Exact", cached: true },
      filter: {
        label: "Level",
        kind: "terms",
        origin: "Inferred",
        field: "level",
        multi: true,
        reason: "Six levels resolve to a compact multi-select.",
      },
    },
    {
      id: "message",
      name: "message",
      databaseType: "text",
      semanticType: "string",
      cardinality: { value: 382_006, relation: "Estimated", cached: true },
      filter: {
        label: "Text",
        kind: "text",
        origin: "Inferred",
        field: "message",
        reason: "Analyzed high-cardinality text stays a text query.",
      },
    },
    {
      id: "service",
      name: "service",
      databaseType: "keyword",
      semanticType: "string",
      cardinality: { value: 44, relation: "Exact", cached: true },
      filter: {
        label: "Terms",
        kind: "terms",
        origin: "Inferred",
        field: "service",
        multi: true,
        reason: "44 distinct services remains below the 50-option limit.",
      },
    },
    {
      id: "namespace",
      name: "kubernetes.namespace",
      databaseType: "keyword",
      semanticType: "string",
      cardinality: { value: 38, relation: "Exact", cached: true },
      filter: {
        label: "Terms",
        kind: "terms",
        origin: "Inferred",
        field: "kubernetes.namespace",
        multi: true,
        reason: "38 namespaces can be offered without a lookup round trip.",
      },
    },
  ],
  paging: {
    selected: "Offset",
    supported: ["Offset"],
    execution: "Native",
    order: "@timestamp desc",
    consistency: "Live",
    note: "This target is inspected through the connection browser's bounded result window.",
    limits: providerLimits,
  },
};

const ordersTable: InspectionResult = {
  name: "public.orders",
  provider: "PostgreSQL",
  connection: "connection://analytics-db",
  scopeLabel: "Table",
  scope: "analytics · public.orders",
  query: "SELECT * FROM public.orders",
  status: "Complete",
  statusNote: "Catalog types and four eligible columns inspected successfully.",
  durationMs: 164,
  cache: {
    policy: "column-cardinality",
    state: "Fresh",
    age: "44s",
    cached: true,
  },
  fields: [
    {
      id: "order-id",
      name: "order_id",
      databaseType: "UUID",
      semanticType: "string",
      cardinality: { value: 284_902, relation: "Exact", cached: true },
      filter: {
        label: "Text",
        kind: "text",
        origin: "Inferred",
        field: "order_id",
        reason: "A unique identifier is typed rather than enumerated.",
      },
    },
    {
      id: "region",
      name: "region",
      databaseType: "TEXT",
      semanticType: "string",
      cardinality: { value: 7, relation: "Exact", cached: true },
      filter: {
        label: "Terms",
        kind: "terms",
        origin: "Inferred",
        field: "region",
        multi: true,
        reason: "Seven regions fit in a multi-select.",
      },
    },
    {
      id: "amount",
      name: "amount",
      databaseType: "NUMERIC(14,2)",
      semanticType: "number · currency",
      filter: {
        label: "Range",
        kind: "range",
        origin: "Inferred",
        field: "amount",
        reason: "Numeric values resolve to lower and upper bounds.",
      },
    },
    {
      id: "created-at",
      name: "created_at",
      databaseType: "TIMESTAMPTZ",
      semanticType: "datetime",
      filter: {
        label: "Time range",
        kind: "time",
        origin: "Inferred",
        field: "created_at",
        reason: "The timestamp resolves to the shared time-range control.",
      },
    },
  ],
  paging: {
    selected: "Offset",
    supported: ["Offset"],
    execution: "Native",
    order: "No stable order declared",
    consistency: "Live",
    note: "The connection browser can page by offset, but a reusable cursor needs a declared total order.",
    limits: providerLimits,
  },
};

export const CONNECTION_INSPECTIONS: ConnectionInspection[] = [
  {
    id: "telemetry-search",
    label: "Telemetry search",
    provider: "OpenSearch",
    targets: [
      { id: "otel-traces", label: "otel-traces-*", result: telemetryTraces },
      {
        id: "application-logs",
        label: "application-logs-*",
        result: applicationLogs,
      },
    ],
  },
  {
    id: "analytics-db",
    label: "Analytics database",
    provider: "PostgreSQL",
    targets: [{ id: "orders", label: "public.orders", result: ordersTable }],
  },
];

export const PROFILE_INSPECTIONS: ProfileInspection[] = [
  {
    id: "checkout-latency",
    label: "Checkout latency",
    result: {
      ...telemetryTraces,
      name: "Checkout latency",
      scopeLabel: "Resolved target",
      scope: "otel-traces-* · service.name = checkout",
      query:
        '{"query":{"term":{"service.name":"checkout"}},"sort":[{"timestamp":"desc"},{"trace.id":"asc"}]}',
      statusNote:
        "Profile mapping, cardinality probes, filters, and paging resolved successfully.",
      fields: [
        {
          ...telemetryTraces.fields[0]!,
          id: "started-at",
          name: "Started at",
          source: "timestamp",
        },
        {
          ...telemetryTraces.fields[1]!,
          id: "service",
          name: "Service",
          source: "service.name",
        },
        {
          ...telemetryTraces.fields[2]!,
          id: "operation",
          name: "Operation",
          source: "span.name",
          cardinality: { value: 12, relation: "Exact", cached: false },
          filter: {
            label: "Terms",
            kind: "terms",
            origin: "Profile override",
            field: "span.name",
            multi: true,
            reason:
              "The profile explicitly chooses a terms control after narrowing to checkout spans.",
          },
        },
        {
          ...telemetryTraces.fields[4]!,
          id: "latency",
          name: "Latency",
          source: "duration.ms",
        },
        {
          ...telemetryTraces.fields[5]!,
          id: "outcome",
          name: "Outcome",
          source: "status.code",
        },
        {
          ...telemetryTraces.fields[3]!,
          id: "trace",
          name: "Trace ID",
          source: "trace.id",
        },
      ],
      paging: {
        selected: "Cursor",
        supported: ["Offset", "Cursor"],
        execution: "Native",
        order: "Started at desc, Trace ID asc · unique tiebreaker",
        consistency: "Snapshot",
        note: "A total order enables search-after paging inside one point-in-time snapshot.",
        limits: [
          { label: "Default page", value: 250, origin: "Profile override" },
          { label: "Maximum page", value: 1_000, origin: "Provider default" },
          {
            label: "Export ceiling",
            value: 25_000,
            origin: "Profile override",
          },
        ],
      },
    },
  },
  {
    id: "regional-orders",
    label: "Regional orders",
    result: {
      ...ordersTable,
      name: "Regional orders",
      scopeLabel: "Resolved source",
      scope: "analytics · public.orders",
      query:
        "SELECT order_id, region, amount, created_at FROM public.orders ORDER BY created_at DESC, order_id ASC",
      fields: ordersTable.fields.map((field) => ({ ...field })),
      paging: {
        selected: "Cursor",
        supported: ["Offset", "Cursor"],
        execution: "Native",
        order: "created_at desc, order_id asc · unique tiebreaker",
        consistency: "Live",
        note: "The profile's stable order makes cursor and offset paging valid.",
        limits: [
          { label: "Default page", value: 100, origin: "Provider default" },
          { label: "Maximum page", value: 500, origin: "Profile override" },
          {
            label: "Export ceiling",
            value: 100_000,
            origin: "Provider default",
          },
        ],
      },
    },
  },
];
