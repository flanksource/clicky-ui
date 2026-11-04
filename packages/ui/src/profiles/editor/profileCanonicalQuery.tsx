import { useEffect, useState } from "react";
import { Button } from "../../components/button";
import { JsonSchemaForm } from "../../components/JsonSchemaForm";
import { EsQueryBuilder } from "../elasticsearch/esQueryBuilder";
import {
  esBuilderVocabulary,
  type EsFieldMapping,
} from "../elasticsearch/esQueryOperators";
import { defaultParamValues } from "../elasticsearch/esQueryBuilderForm";
import type { EsSearch } from "../elasticsearch/esQueryBuilderModel";
import { profileApiPath, profileSchema } from "../profileApi";
import { sampleRequestProfile } from "../query/jsonPathSample";
import type { ProfileSample } from "../wizard/profileWizardQueryStep";
import type { ProfileWizardDraft } from "../wizard/profileWizardModel";
import { providerOptionsSchema } from "./profileEditorModel";

type Translation = {
  search: EsSearch;
  native: unknown;
  layout: { fields: Record<string, { type?: string }> };
};

async function translate(
  draft: ProfileWizardDraft,
  {
    direction,
    signal,
    layoutOnly = false,
  }: {
    direction: "source" | "canonical";
    signal?: AbortSignal;
    layoutOnly?: boolean;
  },
): Promise<Translation> {
  const response = await fetch(profileApiPath("profile/sample/query"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile: {
        profile: draft.profile,
        provider: draft.provider,
        search: draft.search,
        spans: draft.spans,
        params: draft.params,
      },
      direction,
      params: defaultParamValues(draft.params),
      ...(layoutOnly
        ? { query: {} }
        : direction === "canonical" && draft.query
          ? { query: JSON.parse(draft.query) }
          : {}),
    }),
    ...(signal ? { signal } : {}),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<Translation>;
}

export function ProfileCanonicalQuery({
  draft,
  onChange,
  onSample,
}: {
  draft: ProfileWizardDraft;
  onChange: (next: ProfileWizardDraft) => void;
  onSample: (sample: ProfileSample) => void;
}) {
  const [translation, setTranslation] = useState<Translation>();
  const [catalog, setCatalog] = useState<Translation["layout"]>();
  const [layoutError, setLayoutError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const search = draft.search as EsSearch | undefined;
  const signature = JSON.stringify({
    profile: draft.profile,
    provider: draft.provider,
    search: draft.search,
    spans: draft.spans,
    params: draft.params,
  });
  const sourceSignature = JSON.stringify({
    profile: draft.profile,
    provider: draft.provider,
    spans: draft.spans,
    params: draft.params,
  });
  useEffect(() => {
    if (!search) return;
    setCatalog(undefined);
    setLayoutError("");
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void translate(JSON.parse(sourceSignature) as ProfileWizardDraft, {
        direction: "source",
        signal: controller.signal,
        layoutOnly: true,
      })
        .then((result) => {
          if (!controller.signal.aborted) setCatalog(result.layout);
        })
        .catch((failure: unknown) => {
          if (!controller.signal.aborted) setLayoutError(String(failure));
        });
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [sourceSignature, Boolean(search)]);
  useEffect(() => {
    if (!search) return;
    setTranslation(undefined);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setError("");
      void translate(JSON.parse(signature) as ProfileWizardDraft, {
        direction: "source",
        signal: controller.signal,
      })
        .then((result) => {
          if (!controller.signal.aborted) setTranslation(result);
        })
        .catch((failure: unknown) => {
          if (!controller.signal.aborted) setError(String(failure));
        });
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [signature, Boolean(search)]);
  const convert = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await translate(draft, { direction: "canonical" });
      const options = { ...draft.provider?.options };
      delete options.search;
      onChange({
        ...draft,
        query: "",
        search: result.search,
        provider: { ...draft.provider, options },
      });
      setTranslation(result);
      setCatalog(result.layout);
    } catch (failure) {
      setError(String(failure));
    } finally {
      setBusy(false);
    }
  };
  const sample = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(profileApiPath("profile/sample"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: sampleRequestProfile(draft),
          params: defaultParamValues(draft.params),
          previewProcessors: true,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      const result = (await response.json()) as Omit<
        ProfileSample,
        "sourceDraft"
      >;
      onSample({ ...result, sourceDraft: draft });
    } catch (failure) {
      setError(String(failure));
    } finally {
      setBusy(false);
    }
  };
  const fields: EsFieldMapping[] = Object.entries(catalog?.fields ?? {}).map(
    ([name, field]) => ({
      name,
      dataType:
        name === "timestamp"
          ? "date"
          : name === "duration_ms"
            ? "double"
            : name === "status"
              ? "keyword"
              : (field.type ?? "keyword"),
      searchable: true,
      aggregatable: true,
    }),
  );
  const optionsSchema = structuredClone(
    providerOptionsSchema(draft.provider?.type ?? ""),
  );
  if (optionsSchema.properties) delete optionsSchema.properties.search;
  return (
    <section className="space-y-4 rounded-lg border bg-card p-4">
      <h2 className="text-lg font-semibold">Logical span conditions</h2>
      <p className="text-sm text-muted-foreground">
        Canonical conditions stay with the profile. Each connection resolves its
        index fields and units.
      </p>
      {error || layoutError ? (
        <p role="alert" className="text-sm text-destructive">
          {error || layoutError}
        </p>
      ) : null}
      {search ? (
        <>
          <JsonSchemaForm
            schema={optionsSchema}
            value={draft.provider?.options ?? {}}
            onChange={(options) =>
              onChange({ ...draft, provider: { ...draft.provider, options } })
            }
            idPrefix="canonical-source"
            showPreferencesMenu={false}
          />
          <EsQueryBuilder
            search={search}
            fields={fields}
            vocabulary={esBuilderVocabulary(profileSchema())}
            params={draft.params ?? []}
            onChange={(next) => onChange({ ...draft, search: next })}
            onMappingChange={(edit) =>
              onChange({ ...draft, search: edit.search, params: edit.params })
            }
          />
          <Button type="button" disabled={busy} onClick={() => void sample()}>
            {busy ? "Running…" : "Run sample"}
          </Button>
          <details open>
            <summary className="cursor-pointer text-sm font-medium">
              Resolved OpenSearch query
            </summary>
            <pre className="mt-2 overflow-auto text-xs">
              {translation
                ? JSON.stringify(translation.native, null, 2)
                : "Resolving connection layout…"}
            </pre>
          </details>
        </>
      ) : (
        <Button type="button" disabled={busy} onClick={() => void convert()}>
          {busy ? "Resolving layout…" : "Use canonical conditions"}
        </Button>
      )}
    </section>
  );
}
