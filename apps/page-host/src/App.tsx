import { lazy, Suspense, useState } from "react";
import { AppShell, Button, DensitySwitcher, InputField, Select, Tabs, ThemeSwitcher, Tree, Workspace, useDensity, useResolvedTheme } from "@flanksource/clicky-ui";
import { bufferProvider } from "./providers/buffers";
import { folderProvider, opfsProvider } from "./providers/directory";
import { urlProvider } from "./providers/url";
import { manifestOf, sourceTree } from "./project";
import { PreviewPages } from "./PreviewPages";
import { Versions } from "./Versions";
import { useProject } from "./use-project";

const Editor = lazy(() => import("./Editor"));
const runtimeOrigin = import.meta.env.VITE_PAGE_RUNTIME_ORIGIN ?? "http://localhost:5811";

type ProjectHost = ReturnType<typeof useProject>;
type Project = NonNullable<ProjectHost["project"]>;

/** The package.json error that blocks Libraries and Preview, or "" when the manifest parses. */
function configurationErrorOf(project: Project | null): string {
  if (!project) return "";
  try { manifestOf(project.files); return ""; } catch (error) { return error instanceof Error ? error.message : String(error); }
}

function SourcePicker({ host }: { host: ProjectHost }) {
  const [sourceUrl, setSourceUrl] = useState("");
  return <div className="space-y-3 border-b border-border p-3 text-sm">
    <p className="break-all text-muted-foreground">{host.provider?.label ?? "Choose a source"}</p>
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={host.busy} onClick={() => { void host.run(() => host.open(async () => bufferProvider())); }}>Host buffers</Button>
      <Button size="sm" variant="outline" disabled={host.busy} onClick={() => { void host.run(() => host.open(opfsProvider)); }}>Open browser project</Button>
      <Button size="sm" variant="outline" disabled={host.busy || !("showDirectoryPicker" in window)} onClick={() => { void host.run(() => host.open(folderProvider)); }}>Open folder</Button>
    </div>
    <form className="space-y-2" onSubmit={(event) => {
      event.preventDefault();
      void host.run(() => host.open(async () => urlProvider({ url: sourceUrl, manifest: host.project?.files["package.json"] ?? '{"dependencies":{}}' })));
    }}>
      <label className="block space-y-1" htmlFor="source-url">Source URL
        <InputField id="source-url" type="url" required value={sourceUrl} onChange={setSourceUrl} placeholder="https://example.com/page.tsx" />
      </label>
      <p className="text-xs text-muted-foreground">A CORS-enabled TSX, JSX, MDX file or project JSON. Source files use this project’s library defaults.</p>
      <Button size="sm" variant="outline" type="submit" disabled={host.busy}>Open URL</Button>
    </form>
  </div>;
}

function SourceExplorer({ host, active, onSelect }: { host: ProjectHost; active: string | undefined; onSelect: (path: string) => void }) {
  const [sidebarTab, setSidebarTab] = useState("files");
  const [newPath, setNewPath] = useState("");
  const project = host.project;
  const configurationError = configurationErrorOf(project);
  return <div className="flex h-full min-h-0 flex-col overflow-auto">
    <SourcePicker host={host} />
    <Tabs tabs={[{ id: "files", label: "Files" }, { id: "versions", label: "Libraries" }]} value={sidebarTab} onChange={setSidebarTab} />
    {project && (sidebarTab === "versions" ? configurationError ? <p role="alert" className="p-3 text-destructive">Fix package.json in the editor: {configurationError}</p> :
      <Versions key={`${host.revision}:${project.entry}:${project.files["package.json"]}`} project={project} onApply={host.replace} /> : <>
      <Tree roots={sourceTree(project.files)} getKey={(node) => node.path} getChildren={(node) => node.children} getAriaLabel={(node) => node.path}
        selected={active ? { path: active, name: active.split("/").at(-1)! } : null}
        onSelect={(node) => { if (!node.children) onSelect(node.path); }} renderRow={({ node }) => <span className="truncate text-sm">{node.name}</span>}
        defaultOpen={() => true} ariaLabel="Source files" showSearch showControls={false} />
      <form className="space-y-2 p-3" onSubmit={(event) => {
        event.preventDefault();
        void host.run(async () => {
          const path = newPath.trim();
          if (project.files[path] !== undefined) throw new Error(`${path} already exists`);
          host.replace({ ...project, files: { ...project.files, [path]: "" } }); onSelect(path); setNewPath("");
        });
      }}>
        <label className="block space-y-1 text-sm" htmlFor="new-path">New file path<InputField id="new-path" value={newPath} onChange={setNewPath} required /></label>
        <Button size="sm" variant="outline" type="submit">Add file</Button>
      </form>
    </>)}
  </div>;
}

function HostActions({ host, onSelect }: { host: ProjectHost; onSelect: (path: string) => void }) {
  const project = host.project;
  return <>
    {project && <label className="flex items-center gap-2 whitespace-nowrap text-sm" htmlFor="preview-page">Preview page<Select id="preview-page" value={project.entry} onChange={(event) => {
      host.replace({ ...project, entry: event.target.value }); onSelect(event.target.value);
    }} options={Object.keys(project.files).filter((path) => /\.(tsx|jsx|mdx)$/.test(path)).sort().map((path) => ({ value: path, label: path }))} /></label>}
    <Button size="sm" disabled={!project || host.busy} onClick={() => { void host.run(host.save); }}>{host.provider?.saveLabel ?? "Save"}</Button>
    <Button size="sm" variant="outline" disabled={!project || host.busy} onClick={() => { void host.run(host.share); }}>Create share URL</Button>
  </>;
}

function EditorPane({ host, active, onSelect }: { host: ProjectHost; active: string | undefined; onSelect: (path: string) => void }) {
  const project = host.project;
  if (!project || !active) return <p className="p-4 text-sm text-muted-foreground">Open a source to edit.</p>;
  return <div className="flex h-full min-h-0 flex-col">
    <div className="shrink-0 overflow-x-auto"><Tabs tabs={Object.keys(project.files).map((path) => ({ id: path, label: path.split("/").at(-1)! }))} value={active} onChange={onSelect} /></div>
    <div className="min-h-0 flex-1 [&>div]:h-full [&>div>div]:h-full"><Suspense fallback={<p role="status" className="p-3">Loading editor…</p>}>
      <Editor path={active} projectId={host.provider!.id} source={project.files[active]!} onChange={(source) => host.edit({ path: active, source })} />
    </Suspense></div>
  </div>;
}

function PreviewPane({ host }: { host: ProjectHost }) {
  const theme = useResolvedTheme();
  const { density } = useDensity();
  const project = host.project;
  if (!project) return <p className="p-4 text-sm">No preview yet.</p>;
  const configurationError = configurationErrorOf(project);
  if (configurationError) return <p role="alert" className="p-4 text-sm text-destructive">Fix package.json to resume preview: {configurationError}</p>;
  return <PreviewPages key={`${host.provider!.id}:${host.revision}`} provider={host.provider!} project={project} runtimeOrigin={runtimeOrigin} theme={{ theme, density }} onLock={host.recordLock} onError={host.fail} />;
}

export function App() {
  const host = useProject();
  const [selected, setSelected] = useState<string | null>(null);
  const project = host.project;
  const active = selected && project?.files[selected] !== undefined ? selected : project?.entry;

  return <AppShell brand={<span className="font-semibold">Page host</span>}
    actions={<><ThemeSwitcher /><DensitySwitcher /></>}
    bodyHeader={<div className="flex flex-wrap items-center gap-3"><h1 className="font-medium">{project?.name ?? "Open a page project"}</h1><span data-testid="save-status" className="text-sm text-muted-foreground">{host.dirty ? "Unsaved changes" : "Saved"}</span></div>}
    bodyActions={<HostActions host={host} onSelect={setSelected} />}
    contentWidth="full" contentClassName="flex min-h-0 flex-col overflow-hidden p-0">
    {host.error && <p role="alert" className="shrink-0 border-b border-border p-3 text-sm text-destructive">{host.error}</p>}
    {host.provider?.id === "hash" && <label className="flex shrink-0 items-center gap-2 border-b border-border p-2 text-sm" htmlFor="share-url">Share URL<InputField id="share-url" readOnly value={location.href} /></label>}
    <Workspace className="min-h-0 flex-1" panes={[
      { id: "sources", label: "Sources", location: "left", width: 280, minWidth: 240, content: <SourceExplorer host={host} active={active} onSelect={setSelected} /> },
      { id: "editor", label: active ?? "Source", location: "center", collapsible: false, contentClassName: "overflow-hidden", content: <EditorPane host={host} active={active} onSelect={setSelected} /> },
      { id: "preview", label: "Preview", location: "right", width: 900, minWidth: 320, maxWidth: 1600, contentClassName: "overflow-hidden", content: <PreviewPane host={host} /> },
    ]} />
  </AppShell>;
}
