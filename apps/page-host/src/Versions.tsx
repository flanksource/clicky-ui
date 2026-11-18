import { useState } from "react";
import { Button, InputField } from "@flanksource/clicky-ui";
import { manifestOf, overrideVersions, type Project } from "./project";

export function Versions({ project, onApply }: { project: Project; onApply: (project: Project) => void }) {
  const manifest = manifestOf(project.files);
  const ranges = { ...manifest.dependencies, ...manifest.pageRuntime?.pages?.[project.entry] };
  const [clicky, setClicky] = useState(ranges["@flanksource/clicky-ui"] ?? "");
  const [facet, setFacet] = useState(ranges["@flanksource/facet"] ?? "");
  const [error, setError] = useState("");
  const lock = project.locks[project.entry];
  return <form className="space-y-4 p-4" onSubmit={(event) => {
    event.preventDefault();
    try { onApply(overrideVersions({ project, page: project.entry, versions: { "@flanksource/clicky-ui": clicky.trim(), "@flanksource/facet": facet.trim() } })); setError(""); }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
  }}>
    <p className="text-sm text-muted-foreground">Versions for {project.entry}. React follows clicky-ui.</p>
    <label className="block space-y-1 text-sm" htmlFor="clicky-version">clicky-ui version
      <InputField id="clicky-version" required value={clicky} onChange={setClicky} />
    </label>
    <label className="block space-y-1 text-sm" htmlFor="facet-version">facet version
      <InputField id="facet-version" required value={facet} onChange={setFacet} />
    </label>
    <Button type="submit">Apply page versions</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {lock && <>
      <dl className="space-y-2 text-sm" data-testid="resolved-versions">{Object.entries(lock.versions).map(([name, version]) => <div key={name}><dt className="text-muted-foreground">{name}</dt><dd>{version}</dd></div>)}</dl>
      <details><summary className="cursor-pointer text-sm">Page import map</summary><pre data-testid="page-import-map" className="overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(lock.map, null, 2)}</pre></details>
    </>}
  </form>;
}
