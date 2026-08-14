/**
 * The JSON-schema form extension that swaps in the CEL editor.
 *
 * It lives apart from celEditor.tsx because it is not a component, and a module
 * that exports components must export nothing else for Fast Refresh to work
 * (react/only-export-components).
 */

import type { PostExtension } from "../../components/json-schema-form-types";
import { CelField } from "./celEditor";
import { CEL_EDITOR_WIDGET } from "./celExpression";

const celEditorPost: PostExtension = (field, nodes, ctx) => {
  if (field.schema["x-clicky-component"] !== CEL_EDITOR_WIDGET) return nodes;
  return {
    label: nodes.label,
    value: <CelField field={field} {...(ctx ? { ctx } : {})} />,
  };
};

export const celEditorFormExtensions = { post: [celEditorPost] };
