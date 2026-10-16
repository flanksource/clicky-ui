import { isConnectionLoggingCapability } from "../components/ConnectionLoggingPolicy.model";
import type { ConnectionLoggingCapability } from "../components/ConnectionLoggingPolicy.model";
import type { FieldControl } from "../components/json-schema-form-types";

/** The `x-clicky-component` the connection schema tags its logging field with. */
export const CONNECTION_LOGGING_WIDGET = "connection-logging-policy";

export function connectionLoggingCapability(field: FieldControl): ConnectionLoggingCapability {
  const value = field.schema["x-clicky-logging"];
  if (!isConnectionLoggingCapability(value)) {
    throw new Error(
      "connection logging schema is missing valid x-clicky-logging metadata",
    );
  }
  return value;
}
