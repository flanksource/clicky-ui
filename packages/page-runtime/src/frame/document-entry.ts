import type { DocumentSource, FrameConfig, RuntimeProfile } from "../schema.ts";
import { fetchJson, resolvePage } from "../sw/resolver.ts";
import { validateSourcePath } from "../host/validation.ts";
import { DOCUMENT_ORIGIN, documentSourceURL } from "./document-assets.ts";
import { documentModules } from "./document-modules.ts";
import { documentError, mount } from "./document-mount.ts";
import { baseStylesheets, loadLibraries } from "./tailwind/load.ts";
import { prepareTailwind } from "./tailwind/runtime.ts";
import { insertBaseStyles } from "./tailwind/stylesheets.ts";
import type { PageLayout, PageModule, ReactRuntime } from "./mount-page.ts";

async function documentProfile(source: DocumentSource): Promise<RuntimeProfile> {
  if (source.profileUrl) {
    const profile = await fetchJson<RuntimeProfile>(fetch, source.profileUrl);
    const rebase = (url: string) => new URL(`.${new URL(url).pathname}`, source.profileUrl).href;
    return { ...profile, packageOrigin: rebase(profile.packageOrigin), registry: rebase(profile.registry) };
  }
  return {
    runtimeDomain: new URL(DOCUMENT_ORIGIN).hostname, embedders: [], packageOrigin: "https://unpkg.com",
    registry: "https://registry.npmjs.org", managed: source.managed, policy: { dependencies: "any" },
    minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "deny", sources: ["host"], readinessTimeoutMs: 30000,
  };
}

async function launch(source: DocumentSource): Promise<void> {
  for (const path of Object.keys(source.files)) validateSourcePath(path);
  const entry = documentSourceURL(source.page);
  const layout = documentSourceURL(source.layout);
  const profile = await documentProfile(source);
  const lock = await resolvePage({ page: source.page, profile, manifest: { dependencies: source.dependencies },
    ...(source.profileUrl ? { runtimeExportsUrl: new URL("runtime-exports.json", source.profileUrl).href } : {}),
  });
  const modules = documentModules({ source, lock });
  await modules.enableCompilerPlugins();
  const react = ["react", "react-dom/client", "react-dom"].map(id => modules.resolve(id, entry));
  const [page, wrapper, ...runtime] = await modules.importModules([entry, layout, ...react]);
  const config: FrameConfig = { page: source.page, entry, layout, lock, profile, runtimeVersion: "document" };
  const styles = await documentStyles({ config, modules });
  await mount(page as PageModule, runtime as unknown as ReactRuntime, {
    layout: wrapper as PageLayout,
    prepareStyles: async root => {
      if (source.dynamicStyles === false) return;
      const dynamic = await prepareTailwind({ ...styles, root, runtimeVersion: config.runtimeVersion,
        candidates: [...modules.candidates], timeoutMs: profile.readinessTimeoutMs, onError: documentError,
      });
      await dynamic.ready();
    },
  });
}

async function documentStyles(options: { config: FrameConfig; modules: ReturnType<typeof documentModules> }) {
  const { config, modules } = options;
  const resolve = ({ id, base }: { id: string; base: string }) => /^(?:[./]|https?:)/.test(id)
    ? new URL(id, base).href : new URL(modules.resolve(id, base), DOCUMENT_ORIGIN).href;
  const styles = await loadLibraries({ config, resolve,
    importModule: async url => (await modules.importModules([new URL(url).pathname]))[0]!,
    fetch: async url => new Response(await modules.assets.css(new URL(String(url)).pathname), { headers: { "content-type": "text/css" } }),
  });
  const stylesheets = await Promise.all(baseStylesheets({ ...styles, config, resolve }).map(async sheet => ({
    ...sheet, url: await modules.assets.url(new URL(sheet.url).pathname),
  })));
  await insertBaseStyles({ document, stylesheets, timeoutMs: config.profile.readinessTimeoutMs }).ready;
  return styles;
}

const source = document.getElementById("facet-document-source");
if (!source) documentError(new Error("Document sources are missing"));
else void Promise.resolve().then(() => launch(JSON.parse(source.textContent ?? "") as DocumentSource)).catch(documentError);
