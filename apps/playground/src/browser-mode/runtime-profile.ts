import { allowsDependency } from "@flanksource/page-runtime/sw";
import type { DependencyPolicy, RuntimePolicy, RuntimeProfile } from "@flanksource/page-runtime/schema";
import type { BrowserRuntime, DependencyScope, ProfileLayer, ProfileScope } from "./dependency-defaults";

export type ProfileLayers = { profile: ProfileLayer; workspace: ProfileLayer & { packageNames: string[] } };
export type EffectivePolicy = {
  dependencies: DependencyPolicy;
  /** The profile layer that set the policy, or `served` when none did and `/profile.json` applies. */
  source: ProfileScope | "served";
  /** Declared packages the policy does not allow, with the scope that declared each. */
  pending: Array<{ name: string; scope: DependencyScope }>;
};
export type EffectiveProfile = { profile: RuntimeProfile; dependencies: Record<string, string>; sources: Record<string, DependencyScope>; declared: Record<DependencyScope, Record<string, string>>; policy: EffectivePolicy };

/**
 * The packages that make a dependency change unacceptable: the changed package if it is still pending afterwards, plus
 * any package that was not pending before the change and is now. Packages that were already rejected stay allowed to
 * remain so, otherwise one stale rejection would block every fix.
 */
export function dependencyChangeRejections(options: { name: string; before: EffectivePolicy["pending"]; after: EffectivePolicy["pending"] }): EffectivePolicy["pending"] {
  const wasPending = new Set(options.before.map(item => item.name));
  return options.after.filter(item => item.name === options.name || !wasPending.has(item.name));
}

/** Under `strict` only package.json declarations are allowed, so browser scopes can never satisfy an added dependency. */
export const browserScopesDisabled = (options: { policy: DependencyPolicy; remove: boolean }): boolean => !options.remove && options.policy === "strict";

/**
 * Layers the runtime profile for one page. Dependencies merge low → high: browser default, runtime-profile.json,
 * package.json `pageRuntime`, browser workspace override, browser page override, page header. Only the first three
 * may set the policy (the highest one wins). `strict` allows package.json `dependencies`, `peerDependencies` and
 * `pageRuntime.dependencies`; `ask` adds the browser's approvals for this page and workspace.
 */
export function effectiveProfile(options: { base: RuntimeProfile; browser: BrowserRuntime; layers: ProfileLayers; page: { slug: string; dependencies: Record<string, string> }; linked: string[] }): EffectiveProfile {
  const { base, browser, layers, page } = options;
  const declared: Array<[DependencyScope, Record<string, string>]> = [["browser-default", browser.default.dependencies], ["profile", layers.profile.dependencies], ["workspace", layers.workspace.dependencies], ["browser-workspace", browser.workspace], ["browser-page", browser.page], ["page", page.dependencies]];
  const dependencies: Record<string, string> = {}; const sources: Record<string, DependencyScope> = {};
  for (const [scope, entries] of declared) for (const [name, range] of Object.entries(entries)) { dependencies[name] = range; sources[name] = scope; }
  const setBy = ([["workspace", layers.workspace.policy], ["profile", layers.profile.policy], ["browser-default", browser.default.policy]] as const).find(([, policy]) => policy !== undefined);
  const chosen = setBy?.[1] ?? base.policy.dependencies;
  const allowed = chosen === "any" ? [] : [...layers.workspace.packageNames, ...Object.keys(layers.workspace.dependencies), ...(chosen === "ask" ? [...browser.approvals.workspace, ...(browser.approvals.pages[page.slug] ?? [])] : [])];
  const policy: RuntimePolicy = chosen === "any" ? { dependencies: "any" } : { dependencies: chosen, allow: [...new Set(allowed)].sort() };
  const pending = Object.keys(dependencies).filter(name => !Object.hasOwn(base.managed, name) && !options.linked.includes(name) && !allowsDependency(policy, name)).map(name => ({ name, scope: sources[name]! }));
  return { profile: { ...base, policy }, dependencies, sources, declared: Object.fromEntries(declared) as EffectiveProfile["declared"], policy: { dependencies: chosen, source: setBy?.[0] ?? "served", pending } };
}
