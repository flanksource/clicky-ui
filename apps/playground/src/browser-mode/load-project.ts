import { resolvePage } from "@flanksource/page-runtime/sw";
import type { RuntimeProfile } from "@flanksource/page-runtime/schema";
import type { StoredLink } from "@flanksource/page-runtime/host/link";
import { connectPageLinks } from "./links";
import type { BrowserRuntime } from "./dependency-defaults";
import { requiredOverrides } from "./local-overrides";
import type { BrowserProject } from "./project";
import { effectiveProfile, type EffectiveProfile } from "./runtime-profile";

/** The page's project with its effective, layered dependencies; `effective` says how the policy judged them. */
export async function projectFor(options: { slug: string; packages: string[]; base: RuntimeProfile; browser: BrowserRuntime }): Promise<{ project: BrowserProject; effective: EffectiveProfile }> {
  const params = new URLSearchParams({ slug: options.slug });
  const browserNames = [...Object.keys(options.browser.default.dependencies), ...Object.keys(options.browser.workspace), ...Object.keys(options.browser.page)];
  for (const name of new Set([...options.packages, ...browserNames])) params.append("package", name);
  const response = await fetch(`/__playground/browser-project?${params}`, { cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  const project = await response.json() as BrowserProject;
  const { defaults } = project;
  const effective = effectiveProfile({ base: options.base, browser: options.browser, page: { slug: options.slug, dependencies: project.pageDependencies }, linked: options.packages,
    layers: { profile: { dependencies: defaults.profile, ...(defaults.policies.profile ? { policy: defaults.policies.profile } : {}) }, workspace: { dependencies: defaults.workspace, packageNames: defaults.packageNames, ...(defaults.policies.workspace ? { policy: defaults.policies.workspace } : {}) } } });
  project.manifest.dependencies = effective.dependencies;
  return { project, effective };
}

export async function runtimeProfile(): Promise<RuntimeProfile> {
  const response = await fetch("/profile.json");
  if (!response.ok) throw new Error(`Runtime profile: HTTP ${response.status}`);
  return await response.json() as RuntimeProfile;
}

export async function loadBrowserProject(options: {
  slug: string; browser: BrowserRuntime;
  overrides: { links: StoredLink[]; permissions: Record<string, PermissionState>; error: string | null };
}) {
  const base = await runtimeProfile();
  if (options.overrides.error) throw new Error(options.overrides.error);
  const { project, effective } = await projectFor({ slug: options.slug, packages: options.overrides.links.map(link => link.build.library), base, browser: options.browser });
  const local = requiredOverrides({ links: options.overrides.links, packages: [...project.requiredPackages, ...Object.keys(project.manifest.dependencies)] });
  for (const link of local) if (options.overrides.permissions[link.id] !== "granted") throw new Error(`${link.build.library}: folder read permission is ${options.overrides.permissions[link.id]}; open Local overrides and reconnect`);
  return { project, base, profile: effective.profile, effective, local };
}

export async function prepareBrowserProject(options: { project: Extract<BrowserProject, { compatible: true }>; profile: RuntimeProfile; local: StoredLink[] }) {
  const publishedLock = await resolvePage({ page: options.project.page, profile: options.profile, manifest: options.project.manifest, links: options.local, developerOverrides: true });
  const connected = await connectPageLinks(options.profile);
  try {
    const lock = await connected.install(options.project, publishedLock, options.local);
    return { lock, publishedLock, connected };
  } catch (error) { await connected.close(); throw error; }
}
