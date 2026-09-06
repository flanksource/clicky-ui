import type { JsonSchemaObject } from "./json-schema-form-types";
import type { JsonSchemaFormError } from "./json-schema-form-error-types";

export const propertiesErrorSchema: JsonSchemaObject = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", title: "Name" },
    connection: {
      type: "object",
      title: "Connection",
      properties: {
        host: { type: "string", title: "Host" },
        retries: { type: "integer", title: "Retries", minimum: 0 },
      },
    },
    tags: { type: "array", title: "Tags", items: { type: "string" } },
    notes: { type: "string", title: "Notes", format: "md" },
  },
};

export const propertiesErrorValue = {
  name: "",
  connection: { host: "localhost", retries: -1 },
  tags: ["internal", "legacy"],
  notes: "**Review required** before enabling this service.",
};

export const propertiesServerErrors: JsonSchemaFormError[] = [
  {
    instancePath: "",
    message: "The service could not be saved. Review the highlighted fields.",
  },
  {
    instancePath: "/connection/host",
    message: "This host is already assigned to another service.",
  },
  {
    instancePath: "/connection/host",
    message: "Choose a host in the selected environment.",
  },
  { instancePath: "/tags/1", message: "The legacy tag is no longer allowed." },
  { instancePath: "/notes", message: "Add an owner to the release notes." },
];
