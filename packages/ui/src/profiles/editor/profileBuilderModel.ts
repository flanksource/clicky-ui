import type {
  JsonSchemaObject,
  JsonSchemaProperty,
} from "../../components/json-schema-form-types";
import type { ParamDraft } from "../wizard/profileWizardModel";

export function sampleParamSchema(params: ParamDraft[]): JsonSchemaObject {
  const properties: Record<string, JsonSchemaProperty> = {};
  const required: string[] = [];
  for (const param of params) {
    const name = param.name?.trim();
    if (!name) continue;
    const property: JsonSchemaProperty = {
      title: param.label || name,
      ...(param.description ? { description: param.description } : {}),
      ...(param.default !== undefined ? { default: param.default } : {}),
    };
    switch (param.type) {
      case "number":
        property.type = "number";
        break;
      case "boolean":
        property.type = "boolean";
        break;
      case "date":
        property.type = "string";
        property.format = "date";
        break;
      case "datetime":
        property.type = "string";
        property.format = "date-time";
        break;
      default:
        property.type = "string";
    }
    if (param.options?.length) property.enum = param.options;
    properties[name] = property;
    if (param.required) required.push(name);
  }
  return {
    type: "object",
    properties,
    ...(required.length ? { required } : {}),
  };
}
