import type { RuntimeProfile } from "../schema.ts";
import { validateSourcePath } from "../host/validation.ts";
import type { LibraryLink } from "./types.ts";
import { validatePageSources } from "./page-sources.ts";
import { BASE_PACKAGES } from "../sw/composition.ts";

export function assertLinksAllowed(options: { profile: Pick<RuntimeProfile, "links">; developerOverrides: boolean }): void {
  if (options.profile.links !== "allow" || options.developerOverrides !== true) throw new Error("Library links require links: allow and host developer overrides");
}

export function linkUrl(id: string, path: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error(`Invalid link id ${id}`);
  validateSourcePath(path);
  return `/link/${id}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function validateLink(link: LibraryLink): void {
  linkUrl(link.id, "package.json");
  const build = link.build;
  if (BASE_PACKAGES.includes(build.library)) throw new Error(`${build.library}: singleton checkouts must be supplied by the clicky-ui runtime set`);
  if (build.pageSources !== undefined) validatePageSources(build.pageSources.map((root) => ({ ...root, link: link.id })));
  if (build.link !== 1 || !build.library || !build.version || build.fragment.fragment !== 1 || build.fragment.name !== build.library) throw new Error("Invalid checkout link manifest; rebuild with buildLinkRuntime (buildLibraryRuntime)");
  if (link.source.kind === "server") {
    const url = new URL(link.source.url);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error(`Invalid link server URL ${url}`);
  } else if (link.source.kind !== "folder") throw new Error("Unknown link source kind");
  if (!Object.keys(build.entries).length) throw new Error(`${build.library}: link must declare source entry points`);
  for (const [specifier, path] of Object.entries(build.entries)) {
    if (specifier !== build.library && !specifier.startsWith(`${build.library}/`)) throw new Error(`Link entry ${specifier} is outside ${build.library}`);
    validateSourcePath(path);
    if (!Object.hasOwn(build.modules, path)) throw new Error(`Link entry ${specifier}: missing source module ${path}`);
  }
  for (const path of [...Object.keys(build.modules), ...Object.keys(build.generated)]) validateSourcePath(path);
  for (const [path, conversion] of Object.entries(build.commonjs ?? {})) {
    validateSourcePath(path); validateSourcePath(conversion.target);
    if (!build.modules[path] || !/^[a-f0-9]{12}$/.test(conversion.hash) || !build.fragment.integrity[`${build.library}@${build.version}/${conversion.target}`]) throw new Error(`Invalid CommonJS conversion metadata for ${path}`);
  }
  for (const name of Object.keys(build.defines)) if (!/^[A-Za-z_$][\w$]*$/.test(name)) throw new Error(`Invalid checkout constant ${name}`);
}

export function missingLinkFile(link: LibraryLink, path: string): Error {
  const command = link.build.generated[path] ?? (link.build.library === "@flanksource/clicky-ui" && path.startsWith("src/icons") ? "pnpm --filter @flanksource/clicky-ui build:icons" : undefined);
  return new Error(`${link.build.library}: missing checkout file ${path}; ${command ? `run \`${command}\`` : "rebuild the checkout with buildLinkRuntime (buildLibraryRuntime)"}`);
}
