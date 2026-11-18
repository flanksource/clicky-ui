import { useEffect, useState, useRef } from "react";
import type { ProfileColumn } from "../wizard/profileWizardModel";
import { OtelTraceTable } from "../../data/traces/otel/OtelTraceTable";
import { profileSpans } from "../../data/traces/otel/profile-spans";
import { profileTraceListing } from "../../data/traces/otel/profile-listing";
import { Clicky, type ClickyNode } from "../../data/Clicky";
import { profileApiPath } from "../profileApi";
import type { ProfileWizardDraft } from "../wizard/profileWizardModel";

export function ProfileMappingPreview({
  profile,
  rows,
  onNormalized,
}: {
  profile: ProfileWizardDraft;
  rows: Record<string, unknown>[];
  onNormalized?: (rows: Record<string, unknown>[], columns: ProfileColumn[]) => void;
}) {
  const normalizedCallback = useRef(onNormalized);
  normalizedCallback.current = onNormalized;
  const [result, setResult] = useState<{
    rows: Record<string, unknown>[];
    document: { node: ClickyNode };
  }>();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [trace, setTrace] = useState<string>();
  const [span, setSpan] = useState<string>();
  const body = JSON.stringify({
    profile: {
      profile: profile.profile,
      provider: profile.provider,
      spans: profile.spans,
      search:profile.search,
      render: profile.render,
      columns: profile.columns,
      aliases: profile.aliases,
      ignore: profile.ignore,
      filters: profile.filters,
    },
    rows,
  });
  useEffect(() => {
    if (rows.length === 0) return;
    const controller = new AbortController();
    setPending(true);
    setError("");
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const response = await fetch(
            profileApiPath("profile/sample/mapping"),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body,
              signal: controller.signal,
            },
          );
          if (!response.ok) throw new Error(await response.text());
          const next = (await response.json()) as {
            normalizedRows: Record<string, unknown>[];
            availableColumns: ProfileColumn[];
            rows: Record<string, unknown>[];
            document: { node: ClickyNode };
          };
          if (!controller.signal.aborted) {
            setResult(next);
            normalizedCallback.current?.(next.normalizedRows, next.availableColumns);
          }
        } catch (error) {
          if (!controller.signal.aborted)
            setError(error instanceof Error ? error.message : String(error));
        } finally {
          if (!controller.signal.aborted) setPending(false);
        }
      })();
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [body, rows.length]);
  if (rows.length === 0)
    return <p>Run a sample in Source &amp; Query to preview mappings.</p>;
  if (error) return <p role="alert">Cannot preview mappings: {error}</p>;
  if (pending || !result) return <p role="status">Updating mapping preview…</p>;
  if (profile.render !== "traces")
    return <Clicky data={result.document.node} />;
  try {
    return (
      <OtelTraceTable
        spans={profileSpans(result.rows)}
        listing={{
          ...profileTraceListing(result.rows, result.document.node),
          linkRows: false,
        }}
        onSelectTrace={(id) => {
          setTrace(id);
          setSpan(undefined);
        }}
        onSelectSpan={setSpan}
        traceHref={(id) => `#trace=${encodeURIComponent(id)}`}
        {...(trace ? { selectedTraceId: trace } : {})}
        {...(span ? { selectedSpanId: span } : {})}
      />
    );
  } catch (error) {
    return (
      <p role="alert">
        Cannot preview traces:{" "}
        {error instanceof Error ? error.message : String(error)}
      </p>
    );
  }
}
