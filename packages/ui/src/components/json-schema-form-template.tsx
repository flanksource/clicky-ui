import type { ReactNode } from "react";
import type { FieldControl, FieldControlKind, PreExtension, PreExtensionContext } from "./json-schema-form-types";
import { TemplateVarMenu, type TemplateValuesLoader } from "./json-schema-form-template-menu";

export type { TemplateToken, TemplateValuesLoader } from "./json-schema-form-template-menu";

export interface TemplateValueOptions {
  tokens: TemplateValuesLoader;
  // Restrict the prefix to these field keys; default = every string/enum field.
  keys?: string[];
  kinds?: readonly FieldControlKind[];
  when?: (field: FieldControl, context: PreExtensionContext) => boolean;
  // Trigger aria-label and menu label; default "Insert template value".
  menuLabel?: string;
  // Optional nodes rendered above / below the token list inside the menu (e.g. a
  // "Show more…" link as the footer). The library only positions them.
  header?: ReactNode;
  footer?: ReactNode;
}

// Builds a JsonSchemaForm `pre` extension that hangs the {x} template-value menu off
// every string/enum field (or only `keys`). Enum fields also opt into
// allowCustomValue so an inserted token survives outside the option set.
export function templateValuePre(options: TemplateValueOptions): PreExtension {
  const { tokens, keys, kinds = ["string", "enum"], when, menuLabel = "Insert template value", header, footer } = options;
  return (field, context) => {
    if (!kinds.includes(field.kind)) return field;
    if (keys && !keys.includes(field.key)) return field;
    if (when && !when(field, context)) return field;
    const prefixed: FieldControl = {
      ...field,
      prefix: (
        <TemplateVarMenu field={field} tokens={tokens} menuLabel={menuLabel} header={header} footer={footer} />
      ),
    };
    return field.kind === "enum" || field.kind === "number" || field.kind === "date"
      ? { ...prefixed, allowCustomValue: true }
      : prefixed;
  };
}
