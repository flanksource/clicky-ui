export { createRouter, frameDocument, verifyIntegrity, type RouterOptions, type RuntimeRouter } from "./router.ts";
export { resolvePage, checkPeers, esmEntries, allowsDependency, DependencyPolicyError, type ResolveOptions } from "./resolver.ts";
export { validateVersionRange } from "./versions.ts";
export { chooseVersion, satisfiesVersion } from "./versions.ts";
export { composeFragments, resolveSpecifier } from "./composition.ts";
export { validateProfile, validateDependencies, validatePolicy, permitsNetwork } from "./profile.ts";
export { compilePage, rewriteImports, BASE_PLUGINS, moduleUrl } from "./compiler.ts";
