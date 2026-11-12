import { readFile } from "node:fs/promises";
import type { Fragment, RuntimeProfile } from "../../src/schema.ts";
import type { PackageManifest } from "../../src/sw/resolver.ts";

export const CONVERTER = "https://converter.example";
export const UI = "@flanksource/clicky-ui";
export const FACET = "@flanksource/facet";
export const PROFILE: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://packages.example", registry: "https://registry.example", managed: { [UI]: "^0.3", [FACET]: "^0.1" }, policy: { dependencies: "strict", allow: ["react-copy-to-clipboard"] }, convert: { origin: CONVERTER }, minReleaseAgeDays: 3, network: { allow: [] }, csp: { add: {} }, links: "deny", sources: ["host"], readinessTimeoutMs: 15000 };
export const MANIFESTS: Record<string, PackageManifest> = {
  [UI]: { name: UI, version: "0.3.0", sideEffects: false },
  [FACET]: { name: FACET, version: "0.1.0", sideEffects: false, peerDependencies: { [UI]: "^0.3" } },
  "react-copy-to-clipboard": { name: "react-copy-to-clipboard", version: "5.1.1", main: "lib/index.js", dependencies: { "copy-to-clipboard": "^3.3.1" }, peerDependencies: { react: "^15.3.0 || 16 || 17 || 18 || 19" } },
  "copy-to-clipboard": { name: "copy-to-clipboard", version: "3.3.3", main: "index.js", dependencies: { "toggle-selection": "^1.0.6" } },
  "toggle-selection": { name: "toggle-selection", version: "1.0.6", main: "index.js" },
};

export async function recordedModules(): Promise<Map<string, string>> {
  const modules = new Map<string, string>();
  for (const name of ["react-copy-to-clipboard", "copy-to-clipboard", "toggle-selection"]) {
    const root = `${name}@${MANIFESTS[name]!.version}`;
    modules.set(`/*${root}?dev&target=es2022`, await readFile(new URL(`./fixtures/${name}-entry.mjs.txt`, import.meta.url), "utf8"));
    modules.set(`/*${root}/es2022/${name}.development.mjs`, await readFile(new URL(`./fixtures/${name}-module.mjs.txt`, import.meta.url), "utf8"));
  }
  return modules;
}

export function registryResponse(name: string, manifests = MANIFESTS): Response {
  const manifest = manifests[name];
  if (!manifest) throw new Error(`fixture has no manifest for ${name}`);
  return Response.json({ time: { [manifest.version]: "2026-01-01T00:00:00Z" }, versions: { [manifest.version]: manifest } });
}

export function fragment(name: string): Fragment {
  const root = `${name}@${MANIFESTS[name]!.version}`;
  return { fragment: 1, name, imports: { [name]: `${root}/index.js`, ...(name === UI ? { react: "react@18.3.1/index.js" } : {}) }, scopes: { [`${root}/`]: {} }, remaps: {}, aliases: {}, inherits: [], integrity: { [`${root}/index.js`]: "sha384-fixture", ...(name === UI ? { "react@18.3.1/index.js": "sha384-react" } : {}) } };
}

export async function conversionFixture(options: { manifests?: Record<string, PackageManifest> } = {}) {
  const modules = await recordedModules();
  const calls: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = String(input); calls.push(url);
    if (url.startsWith(`${PROFILE.registry}/`)) return registryResponse(decodeURIComponent(url.slice(PROFILE.registry.length + 1)), options.manifests);
    if (url.endsWith("barrels.json")) return Response.json({ modules: [], barrels: {} });
    if (url.endsWith("importmap.json")) return Response.json(fragment(url.includes(UI) ? UI : FACET));
    if (url.startsWith(CONVERTER)) {
      const source = modules.get(url.slice(CONVERTER.length));
      if (source === undefined) throw new Error(`unrecorded converter URL ${url}`);
      return new Response(source);
    }
    throw new Error(`unexpected fixture URL ${url}`);
  };
  return { modules, calls, fetcher };
}
