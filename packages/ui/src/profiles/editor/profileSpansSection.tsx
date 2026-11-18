import { JsonSchemaForm } from "../../components/JsonSchemaForm";
import type { JsonSchemaObject } from "../../components/json-schema-form-types";
import { profileSchema } from "../profileApi";
import type { ProfileWizardDraft } from "../wizard/profileWizardModel";

export function ProfileSpansSection({draft, rows, normalizedRows, onChange}: {
  draft: ProfileWizardDraft;
  rows: Record<string, unknown>[];
  normalizedRows: Record<string, unknown>[];
  onChange: (draft: ProfileWizardDraft) => void;
}) {
  const fields = profileSchema().properties?.spans?.properties;
  if (!fields) throw new Error("Profile schema is missing canonical span mappings");
  const sources = [...new Set(rows.flatMap((row) => Object.keys(row)))].filter((key)=>key!=="_trace" && key!=="_span_layout").sort();
  const span = normalizedRows[0]?._trace as Record<string, unknown> | undefined;
  const mappings = (draft.spans ?? {}) as Record<string, Record<string, unknown>>;
  const update = (name: string, keys: string[], patch: Record<string, unknown>) => {
    const value = {...mappings[name]};
    for (const key of keys) {
      delete value[key];
      if (patch[key] !== undefined && patch[key] !== "") value[key] = patch[key];
    }
    const spans = {...mappings};
    for (const key of Object.keys(value)) if (value[key] === "" || value[key] === undefined) delete value[key];
    if (Object.keys(value).length) spans[name] = value;
    else delete spans[name];
    onChange({...draft, spans});
  };
  return <section>
    <h2 className="text-lg font-semibold">Canonical spans</h2>
    <p className="mb-4 text-sm text-muted-foreground">Map source values into the waterfall and inspector. Empty mappings use automatic detection.</p>
    <div className="grid gap-4 @3xl:grid-cols-2 @6xl:grid-cols-3">
      {Object.entries(fields).sort(([,a],[,b]) => Number(a["x-clicky-order"]) - Number(b["x-clicky-order"])).map(([name, field]) => {
        const properties = field.properties ?? {};
        const primary = Object.fromEntries(Object.entries(properties).filter(([key]) => key === "source" || key === "unit"));
        if (primary.source && sources.length) primary.source = {...primary.source, enum:sources, "x-enum-display":"combobox"};
        const advanced = Object.fromEntries(Object.entries(properties).filter(([key]) => key === "cel" || key === "jsonpath"));
        const schema = (properties: JsonSchemaObject["properties"]): JsonSchemaObject => ({type:"object",properties:properties ?? {}});
        const value = mappings[name] ?? {};
        const sample = span?.[name];
        return <div key={name} className="min-w-0 rounded-lg border bg-card p-4">
          <h3 className="font-medium">{field.title}</h3>
          <p className="my-2 truncate font-mono text-xs text-muted-foreground" title={JSON.stringify(sample)}>
            {sample === undefined ? "No sample value" : typeof sample === "object" && sample !== null ? `${Object.keys(sample).length} attributes` : JSON.stringify(sample)}
          </p>
          <JsonSchemaForm schema={schema(primary)} value={value} idPrefix={`span-${name}`} onChange={(next) => update(name,Object.keys(primary),next)} showPreferencesMenu={false} />
          <details className="mt-3"><summary className="cursor-pointer text-xs text-muted-foreground">Advanced: CEL / JSONPath</summary>
            <JsonSchemaForm schema={schema(advanced)} value={value} idPrefix={`span-${name}-advanced`} onChange={(next) => update(name,Object.keys(advanced),next)} showPreferencesMenu={false} />
          </details>
        </div>;
      })}
    </div>
  </section>;
}
