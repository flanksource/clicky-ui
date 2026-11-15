import { useEffect, useState } from "react";
import { DensityProvider, useDensity, useTheme } from "@flanksource/clicky-ui";
import type { FormDataProps } from "@flanksource/clicky-ui/components";
import { PageForm } from "@flanksource/page-runtime/host";
import type { JsonValue } from "@flanksource/page-runtime/schema";
import { loadOipaConditions, type OipaConditionsBundle } from "./bundle";

const DEFAULT_FILE = "group-life.yaml";
const manifest = { dependencies: { "@flanksource/clicky-ui": "^0.3.57" } };
/** The oipa-cli server (PLAYGROUND_OIPA_URL), reached through the playground's `/oipa-api` dev proxy so frame calls stay same-origin. */
const connectionApiBase = `${location.origin}/oipa-api/api/v1`;

/** `?oipa-conditions[=<product>.yaml]`: a product file from the env folder (PLAYGROUND_OIPA_PRODUCTS_DIR) rendered by `PageForm` with its family schema's `oipa-pickers` extension. */
function Page() {
  const { resolvedTheme } = useTheme();
  const { density } = useDensity();
  const file = new URLSearchParams(location.search).get("oipa-conditions") || DEFAULT_FILE;
  const [bundle, setBundle] = useState<OipaConditionsBundle>();
  const [value, setValue] = useState<JsonValue>();
  const [error, setError] = useState<Error>();
  useEffect(() => {
    loadOipaConditions(file).then((loaded) => {
      setBundle(loaded);
      setValue(loaded.value);
    }, setError);
  }, [file]);
  const formProps: FormDataProps = { title: file, connectionApiBase };
  return <main className="mx-auto max-w-5xl space-y-4 p-8">
    <header className="flex items-center justify-between"><a href="/" className="text-primary underline">Playground</a><h1 className="text-lg font-semibold">OIPA product conditions</h1></header>
    {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
    {bundle && value !== undefined && <PageForm
      className="block w-full border border-border"
      title="OIPA product conditions"
      runtimeOrigin={location.origin}
      origin="same-origin-local"
      theme={{ theme: resolvedTheme, density }}
      manifest={manifest}
      schema={bundle.schema}
      value={value}
      onChange={setValue}
      formProps={formProps}
      extensions={[]}
      files={bundle.files}
      onError={setError}
    />}
    <section aria-label="Host value"><h2 className="text-sm font-semibold">Host value</h2><pre data-testid="form-value" className="max-h-96 overflow-auto rounded border border-border p-2 text-xs">{JSON.stringify(value, null, 2)}</pre></section>
  </main>;
}

export function OipaConditionsPage() {
  return <DensityProvider><Page /></DensityProvider>;
}
