import { useMemo, useState } from "react";
import { Button, DensityProvider, useDensity, useTheme } from "@flanksource/clicky-ui";
import type { FormDataProps } from "@flanksource/clicky-ui/components";
import { PageForm } from "@flanksource/page-runtime/host";
import type { FormExtensionSource } from "@flanksource/page-runtime/form";
import type { JsonValue } from "@flanksource/page-runtime/schema";
import schema from "../../../../packages/ui/src/components/examples/form-extensions/schema.json";
import initialValue from "../../../../packages/ui/src/components/examples/form-extensions/value.json";
import extensionSource from "../../../../packages/ui/src/components/examples/form-extensions/extension.tsx?raw";

/** An inline extension: an extra NoMatches slot plus a post hook that marks the Name label with its version. */
const inlineExtension = (version: number) => `import { defineFormExtension } from '@flanksource/clicky-ui/components'; export default defineFormExtension({ name: 'inline', slots: { NoMatches: () => <p data-extra-no-matches>No fields match the filter</p> }, post: [(field, nodes) => field.key === 'name' ? { ...nodes, label: <>{nodes.label}<span data-inline-version>v${version}</span></> } : nodes] });`;

/** The fixture schema declares its own extension as `examples/form-extensions/extension.tsx`; `files` serves that path. */
const files = { "examples/form-extensions/extension.tsx": extensionSource };
const formProps: FormDataProps = { title: "Service", layout: { mode: "cards" } };
const manifest = { dependencies: { "@flanksource/clicky-ui": "^0.3.57" } };
const { notes: _notes, ...propertiesWithoutNotes } = schema.properties;
const schemaWithoutNotes = { ...schema, "x-order": schema["x-order"].filter((key) => key !== "notes"), properties: propertiesWithoutNotes };

/** `?form-extensions`: the shared form-extension fixture rendered by `PageForm` in a same-origin runtime frame. */
function Demo() {
  const { resolvedTheme } = useTheme();
  const { density } = useDensity();
  const [value, setValue] = useState<JsonValue>(initialValue);
  const [error, setError] = useState<Error | null>(null);
  const [showNotes, setShowNotes] = useState(true);
  const [version, setVersion] = useState(1);
  const extensions = useMemo<FormExtensionSource[]>(() => [{ tsx: inlineExtension(version), name: "inline" }], [version]);
  return <main className="mx-auto max-w-3xl space-y-4 p-8">
    <header className="flex items-center justify-between"><a href="/" className="text-primary underline">Playground</a><h1 className="text-lg font-semibold">Form extensions in a page-runtime frame</h1></header>
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => setShowNotes(shown => !shown)}>{showNotes ? "Hide notes" : "Show notes"}</Button>
      <Button size="sm" variant="outline" onClick={() => setVersion(current => current + 1)}>Update inline extension</Button>
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
    <PageForm
      className="block w-full border border-border"
      title="Form extensions"
      runtimeOrigin={location.origin}
      origin="same-origin-local"
      theme={{ theme: resolvedTheme, density }}
      manifest={manifest}
      schema={showNotes ? schema : schemaWithoutNotes}
      value={value}
      onChange={setValue}
      formProps={formProps}
      extensions={extensions}
      files={files}
      onError={setError}
    />
    <p className="text-xs text-muted-foreground">Host-supplied extensions: <code data-testid="host-sources">{JSON.stringify(extensions.map(source => "ref" in source ? source.ref : source.name))}</code>. The fixture module comes from the schema's <code>x-clicky-extensions</code>.</p>
    <section aria-label="Host value"><h2 className="text-sm font-semibold">Host value</h2><pre data-testid="form-value" className="overflow-auto rounded border border-border p-2 text-xs">{JSON.stringify(value, null, 2)}</pre></section>
  </main>;
}

export function FormExtensionsDemo() {
  return <DensityProvider><Demo /></DensityProvider>;
}
