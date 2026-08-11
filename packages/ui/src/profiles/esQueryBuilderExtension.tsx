/**
 * The JSON-schema form extension that swaps in the OpenSearch query builder.
 *
 * It lives apart from esQueryBuilder.tsx because it is not a component, and a
 * module that exports components must export nothing else for Fast Refresh to
 * work (react/only-export-components).
 */

import type { PostExtension } from "../components/json-schema-form-types";
import { EsQueryBuilderField } from "./esQueryBuilder";
import type { EsSearch } from "./esQueryBuilderModel";
import type { ProfileDraft } from "./profileBuilderWorkspace";

const esQueryBuilderPost: PostExtension = (field, nodes, ctx) => {
  if (field.schema["x-clicky-component"] !== "es-query-builder") return nodes;
  return {
    label: nodes.label,
    value: (
      <EsQueryBuilderField
        search={(field.value ?? {}) as EsSearch}
        onChange={field.onChange}
        schema={field.schema}
        rootValue={(ctx?.rootValue ?? {}) as ProfileDraft}
        onRootChange={ctx?.onRootChange}
      />
    ),
  };
};

export const esQueryBuilderFormExtensions = { post: [esQueryBuilderPost] };
