import { useEffect, useState } from "react";
import { ActionError, Button, CodeDiff, Field, InputField, Modal, Properties, Select } from "@flanksource/clicky-ui";
import { chooseVersion, resolvePage, resolveSpecifier } from "@flanksource/page-runtime/sw";
import type { DependencyPolicy, RuntimeProfile } from "@flanksource/page-runtime/schema";
import type { StoredLink } from "@flanksource/page-runtime/host/link";
import { readPagesFile, writePagesFile } from "../editor/page-api";
import type { BrowserProject } from "./project";
import { SCOPE_LABELS, type RuntimeProblem } from "./problems";
import { updatePageDependency, readPageDependencies } from "./dependencies";
import { browserStorageKey, dependencyDocument, parseProfileLayer, readBrowserRuntime, readStored, saveBrowserDocument, updateDependencyDocument, type BrowserRuntime, type DependencyScope } from "./dependency-defaults";
import { browserScopesDisabled, dependencyChangeRejections, effectiveProfile, type ProfileLayers } from "./runtime-profile";

type Preview = { scope: DependencyScope; file: string; before: string; source: string; hash: string; versions: Record<string, string> };
const SCOPES: Array<{ value: DependencyScope; label: string }> = [
  { value: "page", label: "Current page header" }, { value: "browser-page", label: "Browser override for this page" }, { value: "browser-workspace", label: "Browser override for every page" },
  { value: "workspace", label: "package.json (pageRuntime)" }, { value: "profile", label: ".playground/runtime-profile.json" }, { value: "browser-default", label: "Browser runtime default" },
];
const DESCRIPTIONS: Record<DependencyScope, string> = {
  page: "Writes the YAML header of the page file. Applies only to this page.",
  "browser-page": "Stored in this browser's localStorage. Applies only to this page.",
  "browser-workspace": "Stored in this browser's localStorage. Applies to every page on this origin.",
  workspace: "Writes package.json → pageRuntime.dependencies. Under strict and ask, packages declared here are always allowed.",
  profile: "Writes .playground/runtime-profile.json at the git root, shared across browsers.",
  "browser-default": "Stored in this browser's localStorage as the lowest runtime profile layer.",
};
const isBrowser = (scope: DependencyScope): scope is "browser-default" | "browser-workspace" | "browser-page" => scope.startsWith("browser-");

/** Reads every layer a dependency change is evaluated against, as they are right now. */
async function readRuntimeState(options: { entryFile: string; slug: string }) {
  const [opened, workspace, runtime] = await Promise.all([readPagesFile(options.entryFile), dependencyDocument("workspace"), dependencyDocument("profile")]);
  const browser: BrowserRuntime = readBrowserRuntime(options.slug);
  const layers: ProfileLayers = { profile: { dependencies: runtime.dependencies, ...(runtime.policy ? { policy: runtime.policy } : {}) }, workspace: { dependencies: workspace.dependencies, packageNames: workspace.packageNames ?? [], ...(workspace.policy ? { policy: workspace.policy } : {}) } };
  return { opened, workspace, runtime, browser, layers, pageDependencies: readPageDependencies({ source: opened.source, file: opened.file }) };
}

/** Adds or (`remove`) deletes one dependency in a chosen scope, previewing the resulting lock before writing. */
export function DependencyFix({ project, problem, base, links, slug, sourceDirty, initialScope = "page", remove = false, onApplied, onClose }: { project: BrowserProject; problem: RuntimeProblem; base: RuntimeProfile; links: StoredLink[]; slug: string; sourceDirty: boolean; initialScope?: DependencyScope; remove?: boolean; onApplied: () => void; onClose: () => void }) {
  const [name, setName] = useState(problem.package ?? "");
  const [version, setVersion] = useState("");
  const [scope, setScope] = useState<DependencyScope>(initialScope);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [busy, setBusy] = useState(false);
  const [policy, setPolicy] = useState<DependencyPolicy | null>(null);
  const linkedLibraries = links.map(link => link.build.library).join("\u0000");
  useEffect(() => {
    let live = true;
    void (async () => {
      const state = await readRuntimeState({ entryFile: project.entryFile, slug });
      const effective = effectiveProfile({ base, browser: state.browser, layers: state.layers, page: { slug, dependencies: state.pageDependencies }, linked: linkedLibraries ? linkedLibraries.split("\u0000") : [] });
      if (live) setPolicy(effective.policy.dependencies);
    })().catch(cause => { if (live) setError(cause instanceof Error ? cause : new Error(String(cause))); });
    return () => { live = false; };
  }, [project.entryFile, slug, base, linkedLibraries]);
  const browserBlocked = policy !== null && browserScopesDisabled({ policy, remove });
  useEffect(() => {
    if (browserBlocked && isBrowser(scope)) { setScope("workspace"); setPreview(null); }
  }, [browserBlocked, scope]);
  useEffect(() => {
    let live = true;
    if (!problem.package || remove) return;
    void (async () => {
      const response = await fetch(`${base.registry.replace(/\/$/, "")}/${encodeURIComponent(problem.package!)}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Package metadata: HTTP ${response.status}`);
      const metadata = await response.json() as { time: Record<string, string> };
      const chosen = chooseVersion({ name: problem.package!, range: "*", times: metadata.time, ageDays: base.minReleaseAgeDays, now: Date.now() });
      if (live) setVersion(previous => previous || chosen);
    })().catch(cause => { if (live) setError(new Error(String(cause))); });
    return () => { live = false; };
  }, [problem.package, base, remove]);
  const run = async (apply: boolean) => {
    setBusy(true); setError(null);
    try {
      if (sourceDirty) throw new Error("Save or revert source edits before applying a dependency fix");
      if (apply) {
        if (!preview) throw new Error("Preview the dependency change before applying it");
        if (preview.scope === "page") {
          await writePagesFile(preview.file, preview.source, preview.hash);
          window.dispatchEvent(new CustomEvent("playground-source-saved", { detail: { file: preview.file } }));
        } else if (isBrowser(preview.scope)) saveBrowserDocument({ key: browserStorageKey(preview.scope, slug), source: preview.source, expected: preview.before });
        else await dependencyDocument(preview.scope, { source: preview.source, expectedHash: preview.hash });
        onApplied(); return;
      }
      if (!name) throw new Error("Missing package name");
      const next = remove ? null : version;
      const { opened, workspace, runtime, browser, layers: current, pageDependencies: currentPageDependencies } = await readRuntimeState({ entryFile: project.entryFile, slug });
      const linked = links.map(link => link.build.library);
      const before = effectiveProfile({ base, browser, layers: current, page: { slug, dependencies: currentPageDependencies }, linked });
      if (isBrowser(scope) && browserScopesDisabled({ policy: before.policy.dependencies, remove })) throw new Error(`Dependency policy ${before.policy.dependencies} only allows package.json declarations (pageRuntime.dependencies); choose ${SCOPE_LABELS.workspace} instead of ${SCOPE_LABELS[scope]}`);
      let document: { source: string; file: string; hash: string };
      let source: string;
      if (scope === "page") { document = opened; source = updatePageDependency({ source: opened.source, file: opened.file, name, version: next }); }
      else {
        document = isBrowser(scope) ? { source: readStored(browserStorageKey(scope, slug)), file: `Browser localStorage: ${browserStorageKey(scope, slug)}`, hash: "" } : scope === "workspace" ? workspace : runtime;
        source = updateDependencyDocument({ source: document.source, scope, name, version: next });
      }
      const layers = current;
      let pageDependencies = currentPageDependencies;
      if (scope === "page") pageDependencies = readPageDependencies({ source, file: opened.file });
      else if (scope === "browser-default") browser.default = parseProfileLayer({ source, scope });
      else if (scope === "browser-workspace") browser.workspace = JSON.parse(source) as Record<string, string>;
      else if (scope === "browser-page") browser.page = JSON.parse(source) as Record<string, string>;
      else if (scope === "workspace") layers.workspace = { ...layers.workspace, ...parseProfileLayer({ source, scope }) };
      else layers.profile = parseProfileLayer({ source, scope });
      const effective = effectiveProfile({ base, browser, layers, page: { slug, dependencies: pageDependencies }, linked });
      const rejected = dependencyChangeRejections({ name, before: before.policy.pending, after: effective.policy.pending });
      if (rejected.length) throw new Error(`After this change ${rejected.map(item => `${item.name} (${SCOPE_LABELS[item.scope]})`).join(", ")} would still be rejected by dependency policy ${effective.policy.dependencies}`);
      const lock = await resolvePage({ page: project.compatible ? project.page : project.entryFile, profile: effective.profile, manifest: { dependencies: effective.dependencies }, links, developerOverrides: true });
      if (!remove) for (const issue of problem.locations) if (issue.class === "external-package" && issue.specifier && !resolveSpecifier(lock.map, issue.specifier, `/src/${lock.page}`)) throw new Error(`${name}@${version} does not expose ${issue.specifier} to this page`);
      setPreview({ scope, file: document.file, before: document.source, source, hash: document.hash, versions: lock.versions });
    } catch (cause) { setError(cause instanceof Error ? cause : new Error(String(cause))); }
    finally { setBusy(false); }
  };
  return <Modal open title={remove ? `Remove ${problem.package} from ${SCOPE_LABELS[scope]}` : problem.package ? `Add runtime dependency: ${problem.package}` : "Add runtime dependency"} size="xl" onClose={onClose} confirmClose={busy}>
    <div className="space-y-4">
      {!problem.package && <Field label="Package name" htmlFor="runtime-package-name"><InputField id="runtime-package-name" value={name} disabled={busy} onChange={value => { setName(value); setPreview(null); }} /></Field>}
      <Field label={remove ? "Remove dependency from" : "Save dependency to"} htmlFor="runtime-dependency-scope"><Select id="runtime-dependency-scope" value={scope} disabled={busy || remove} options={SCOPES.map(item => ({ ...item, disabled: browserBlocked && isBrowser(item.value) }))} onChange={event => { setScope(event.target.value as DependencyScope); setPreview(null); }} /></Field>
      {browserBlocked && <p role="note" className="text-sm">Dependency policy is strict, which only allows package.json declarations (pageRuntime.dependencies), so the browser options cannot be used to add a dependency. They stay available when removing one.</p>}
      <p className="text-sm">{DESCRIPTIONS[scope]} Precedence, lowest first: browser runtime default, runtime-profile.json, package.json, browser override for every page, browser override for this page, page header.</p>
      {!remove && <Field label="Version or range" htmlFor="runtime-package-version"><InputField id="runtime-package-version" value={version} disabled={busy} onChange={value => { setVersion(value); setPreview(null); }} /></Field>}
      {error && <ActionError title="Dependency change failed" error={error} />}
      {preview && <><p className="break-all text-sm">Destination: <code>{preview.file}</code></p><CodeDiff original={preview.before} modified={preview.source} language={preview.scope === "page" ? "typescript" : "json"} originalLabel={preview.file} modifiedLabel={`Proposed ${SCOPE_LABELS[preview.scope]}`} /><Properties items={Object.entries(preview.versions).map(([key, value]) => ({ key, value }))} /></>}
      <div className="flex justify-end gap-2"><Button variant="ghost" disabled={busy} onClick={onClose}>Cancel</Button><Button variant="outline" disabled={busy || policy === null || !name || (!remove && !version) || sourceDirty} onClick={() => { void run(false); }}>Preview fix</Button><Button disabled={busy || !preview || sourceDirty} onClick={() => { void run(true); }}>Apply and recheck</Button></div>
      {sourceDirty && <p role="status" className="text-sm">Save or revert source edits before changing page dependencies.</p>}
    </div>
  </Modal>;
}
