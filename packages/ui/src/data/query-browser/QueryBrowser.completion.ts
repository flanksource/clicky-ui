import {
  type Completion,
  type CompletionContext,
  type CompletionSource,
} from "@codemirror/autocomplete";
import {
  MSSQL,
  MySQL,
  PostgreSQL,
  StandardSQL,
  type SQLNamespace,
} from "@codemirror/lang-sql";

export type QueryBrowserCompletionField = {
  name: string;
  types?: string[];
  searchable?: boolean;
  aggregatable?: boolean;
  conflicting?: boolean;
};

export type QueryBrowserCompletionRelation = {
  name: string;
  type?: "table" | "view";
  columns: QueryBrowserCompletionField[];
};

export type QueryBrowserCompletionSchema = {
  name: string;
  relations: QueryBrowserCompletionRelation[];
};

export type QueryBrowserCompletion =
  | {
      kind: "sql";
      dialect: "postgresql" | "mysql" | "mssql" | "standard";
      defaultSchema?: string;
      schemas: QueryBrowserCompletionSchema[];
    }
  | {
      kind: "json-fields";
      vocabulary: "opensearch";
      fields: QueryBrowserCompletionField[];
    };

export function dialectFor(
  name: Extract<QueryBrowserCompletion, { kind: "sql" }>["dialect"],
) {
  switch (name) {
    case "postgresql":
      return PostgreSQL;
    case "mysql":
      return MySQL;
    case "mssql":
      return MSSQL;
    default:
      return StandardSQL;
  }
}

export function sqlCompletionNamespace(
  schemas: QueryBrowserCompletionSchema[],
): SQLNamespace {
  const namespace: Record<string, SQLNamespace> = {};
  for (const schema of schemas) {
    const relations: Record<string, SQLNamespace> = {};
    for (const relation of schema.relations) {
      const columns: Completion[] = relation.columns.map((column) => {
        const detail = column.types?.join(" | ");
        return {
          label: column.name,
          type: "property",
          ...(detail ? { detail } : {}),
        };
      });
      relations[relation.name] = {
        self: {
          label: relation.name,
          type: relation.type === "view" ? "interface" : "class",
        },
        children: columns,
      } as SQLNamespace;
    }
    namespace[schema.name] = relations;
  }
  return namespace;
}

const OPENSEARCH_VOCABULARY: Completion[] = [
  "query",
  "bool",
  "must",
  "filter",
  "should",
  "must_not",
  "match",
  "match_phrase",
  "term",
  "terms",
  "range",
  "exists",
  "sort",
  "aggs",
  "aggregations",
  "field",
  "_source",
  "includes",
  "excludes",
  "size",
].map((label) => ({ label, type: "keyword" }));

function completionRange(context: CompletionContext) {
  const word = context.matchBefore(/[\w.@-]*/);
  return word?.from ?? context.pos;
}

function isOpenSearchFieldContext(before: string) {
  const tail = before.slice(-2000);
  return (
    /"(?:match|match_phrase|term|terms|range)"\s*:\s*\{[^{}]*"?[\w.@-]*$/s.test(
      tail,
    ) ||
    /"sort"\s*:\s*\[[^\]]*(?:\{|,)\s*"?[\w.@-]*$/s.test(tail) ||
    /"(?:field|includes|excludes)"\s*:\s*(?:\[\s*)?"?[\w.@-]*$/s.test(tail)
  );
}

export function openSearchJSONCompletionSource(
  fields: QueryBrowserCompletionField[],
): CompletionSource {
  const fieldOptions: Completion[] = fields.map((field) => ({
    label: field.name,
    type: "property",
    detail: [
      field.types?.join(" | "),
      field.conflicting ? "type conflict" : undefined,
    ]
      .filter(Boolean)
      .join(" · "),
  }));
  return (context) => {
    const before = context.state.sliceDoc(0, context.pos);
    const options = isOpenSearchFieldContext(before)
      ? fieldOptions
      : OPENSEARCH_VOCABULARY;
    const word = context.matchBefore(/[\w.@-]*/);
    if (
      !context.explicit &&
      (!word || (word.from === word.to && !isOpenSearchFieldContext(before)))
    )
      return null;
    return { from: completionRange(context), options, validFor: /^[\w.@-]*$/ };
  };
}
