/**
 * The JSON-schema form extension that opens the profile builder for a query
 * field.
 *
 * It lives apart from profileBuilder.tsx because it is not a component, and a
 * module that exports components must export nothing else for Fast Refresh to
 * work (react/only-export-components).
 */

import type { PostExtension } from "../../components/json-schema-form-types";
import { ProfileQueryBuilderField } from "./profileBuilder";
import type { ProfileDraft } from "./profileBuilderWorkspace";

const profileQueryBuilderPost: PostExtension = (field, nodes, ctx) => {
  if (field.schema["x-clicky-component"] !== "profile-query-builder") {
    return nodes;
  }
  return {
    label: nodes.label,
    value: (
      <ProfileQueryBuilderField
        input={nodes.value}
        rootValue={(ctx?.rootValue ?? {}) as ProfileDraft}
        onRootChange={ctx?.onRootChange}
      />
    ),
  };
};

export const profileBuilderFormExtensions = {
  post: [profileQueryBuilderPost],
};
