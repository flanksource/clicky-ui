import { SchemaBrowser, type JsonSchemaObject } from "@flanksource/clicky-ui";
import annotationsSchema from "@flanksource/clicky-ui/json-schema-form.schema.json";
import { DemoSection } from "./Section";

export function JsonSchemaFormAnnotationsDemo() {
  return (
    <DemoSection
      id="json-schema-form-annotations"
      title="JsonSchemaForm annotations"
      description="Every keyword JsonSchemaForm reads from a schema — the x-* presentation extensions and the standard keywords with form-specific meaning — browsed from the published meta-schema @flanksource/clicky-ui/json-schema-form.schema.json."
    >
      <div className="max-h-[48rem] overflow-auto">
        <SchemaBrowser
          schema={annotationsSchema as JsonSchemaObject}
          showControls
          defaultOpenDepth={0}
        />
      </div>
    </DemoSection>
  );
}
