import type { ReactNode } from "react";
import { InputField } from "../components/InputField";
import type { JsonSchemaProperty } from "../components/json-schema-form-types";

/**
 * A hoisted host input composed with its port on one line: the host keeps the
 * form's own control, the port is a narrow input after a `:`.
 */
export function ConnectionHostPortField({
  host,
  port,
  portSchema,
  onPortChange,
}: {
  host: ReactNode;
  port: string;
  portSchema: JsonSchemaProperty;
  onPortChange: (next: string) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <div className="min-w-0 flex-1">{host}</div>
      <span aria-hidden className="text-muted-foreground">
        :
      </span>
      <InputField
        aria-label={portSchema.title ?? "Port"}
        placeholder={portSchema.title ?? "Port"}
        title={portSchema.description}
        inputMode="numeric"
        value={port}
        onChange={onPortChange}
        className="w-24 shrink-0"
      />
    </div>
  );
}
