import type {
  PostExtension,
  PreExtension,
} from "../components/json-schema-form-runtime-types";
import { ConnectionLoggingField } from "./connectionLoggingField";
import {
  CONNECTION_LOGGING_WIDGET,
  connectionLoggingCapability,
} from "./connectionLoggingModel";

const connectionLoggingPre: PreExtension = (field) => {
  if (field.schema["x-clicky-component"] !== CONNECTION_LOGGING_WIDGET) return field;
  connectionLoggingCapability(field);
  return {
    ...field,
    kind: "display",
    displayVariant: "spacer",
    colSpan: "full",
  };
};

const connectionLoggingPost: PostExtension = (field, nodes, ctx) => {
  if (field.schema["x-clicky-component"] !== CONNECTION_LOGGING_WIDGET) return nodes;
  if (!ctx) throw new Error("connection logging form context is required");
  return {
    label: null,
    value: <ConnectionLoggingField field={field} ctx={ctx} />,
  };
};

/**
 * Renders the connection schema's `connection-logging-policy` field as the
 * ConnectionLoggingPolicy editor, writing its overrides into the connection's
 * `properties` map.
 */
export const connectionLoggingFormExtensions: {
  pre: PreExtension[];
  post: PostExtension[];
} = {
  pre: [connectionLoggingPre],
  post: [connectionLoggingPost],
};
