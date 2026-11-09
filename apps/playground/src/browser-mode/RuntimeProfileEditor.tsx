import { useEffect, useState } from "react";
import { ActionError, Button, CodeDiff, Field, Properties, Select } from "@flanksource/clicky-ui";
import type { DependencyPolicy } from "@flanksource/page-runtime/schema";
import { BROWSER_PROFILE_KEY, dependencyDocument, parseProfileLayer, readBrowserRuntime, readStored, revokeApproval, saveBrowserDocument, updatePolicyDocument, useBrowserRuntimeVersion, type ProfileScope } from "./dependency-defaults";
import type { EffectivePolicy } from "./runtime-profile";

const LAYERS: Array<{ scope: ProfileScope; label: string }> = [{ scope: "workspace", label: "package.json (pageRuntime.policy)" }, { scope: "profile", label: ".playground/runtime-profile.json" }, { scope: "browser-default", label: "Browser runtime default" }];
const SOURCE_LABELS: Record<EffectivePolicy["source"], string> = { workspace: "package.json", profile: ".playground/runtime-profile.json", "browser-default": "the browser runtime default", served: "the served /profile.json" };
const OPTIONS = [{ value: "", label: "Inherit" }, { value: "strict", label: "strict: only package.json packages" }, { value: "ask", label: "ask: prompt for other packages" }, { value: "any", label: "any: every declared package" }];

type Document = { scope: ProfileScope; file: string; source: string; hash: string; policy: DependencyPolicy | undefined };
type Preview = { document: Document; source: string };

async function openDocument(scope: ProfileScope): Promise<Document> {
  if (scope === "browser-default") { const source = readStored(BROWSER_PROFILE_KEY); return { scope, file: `Browser localStorage: ${BROWSER_PROFILE_KEY}`, source, hash: source, policy: parseProfileLayer({ source, scope }).policy }; }
  const opened = await dependencyDocument(scope);
  return { scope, file: opened.file, source: opened.source, hash: opened.hash, policy: opened.policy };
}

/** The dependency policy of each profile layer, previewed and applied as a file diff, plus this browser's approvals. */
export function RuntimeProfileEditor({ slug, policy, onApplied }: { slug: string; policy: EffectivePolicy | null; onApplied: () => void }) {
  const [documents, setDocuments] = useState<Document[] | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [revision, setRevision] = useState(0);
  const browserVersion = useBrowserRuntimeVersion(slug);
  useEffect(() => {
    let live = true;
    void Promise.all(LAYERS.map(layer => openDocument(layer.scope))).then(opened => { if (live) setDocuments(opened); }).catch(cause => { if (live) setError(cause instanceof Error ? cause : new Error(String(cause))); });
    return () => { live = false; };
  }, [revision, browserVersion]);
  const approvals = readBrowserRuntime(slug).approvals;
  const propose = (document: Document, value: string) => {
    setError(null);
    try { setPreview({ document, source: updatePolicyDocument({ source: document.source, scope: document.scope, policy: value ? value as DependencyPolicy : null }) }); }
    catch (cause) { setError(cause instanceof Error ? cause : new Error(String(cause))); }
  };
  const apply = async () => {
    if (!preview) throw new Error("Preview the policy change before applying it");
    const { document, source } = preview;
    if (document.scope === "browser-default") saveBrowserDocument({ key: BROWSER_PROFILE_KEY, source, expected: document.hash });
    else await dependencyDocument(document.scope, { source, expectedHash: document.hash });
    setPreview(null); setRevision(value => value + 1); onApplied();
  };
  return <section aria-label="Runtime profile" className="space-y-3">
    <h3 className="text-sm font-semibold">Runtime profile</h3>
    <p className="text-sm">{policy ? <>Dependency policy <strong>{policy.dependencies}</strong>, set by {SOURCE_LABELS[policy.source]}.{policy.pending.length ? ` Rejected: ${policy.pending.map(item => item.name).join(", ")}.` : ""}</> : "The page has not loaded its runtime profile."}</p>
    <p className="text-xs text-muted-foreground">The highest layer that sets a policy wins: package.json, then runtime-profile.json, then the browser default. Browser overrides and page headers can add dependencies but never change the policy.</p>
    {error && <ActionError title="Runtime profile change failed" error={error} />}
    {documents?.map(document => <Field key={document.scope} label={LAYERS.find(layer => layer.scope === document.scope)!.label} htmlFor={`runtime-policy-${document.scope}`}>
      <Select id={`runtime-policy-${document.scope}`} value={preview?.document.scope === document.scope ? (parseProfileLayer({ source: preview.source, scope: document.scope }).policy ?? "") : (document.policy ?? "")} options={OPTIONS} onChange={event => propose(document, event.target.value)} />
    </Field>)}
    {preview && <div className="space-y-2">
      <p className="break-all text-sm">Destination: <code>{preview.document.file}</code></p>
      <CodeDiff original={preview.document.source} modified={preview.source} language="json" originalLabel={preview.document.file} modifiedLabel="Proposed policy" />
      <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setPreview(null)}>Discard</Button><Button onClick={() => { void apply().catch(cause => setError(cause instanceof Error ? cause : new Error(String(cause)))); }}>Apply and recheck</Button></div>
    </div>}
    <h3 className="text-sm font-semibold">Approved in this browser</h3>
    {approvals.workspace.length + (approvals.pages[slug]?.length ?? 0) === 0 ? <p className="text-sm text-muted-foreground">No packages have been approved. Approvals apply only under the ask policy.</p> : <Properties items={[
      ...approvals.workspace.map(name => ({ key: name, value: <span className="flex items-center gap-2">Every page<Button size="sm" variant="link" className="h-auto p-0" onClick={() => revokeApproval({ name, scope: "workspace", slug })}>Revoke</Button></span> })),
      ...(approvals.pages[slug] ?? []).map(name => ({ key: name, value: <span className="flex items-center gap-2">This page<Button size="sm" variant="link" className="h-auto p-0" onClick={() => revokeApproval({ name, scope: "page", slug })}>Revoke</Button></span> })),
    ]} />}
  </section>;
}
