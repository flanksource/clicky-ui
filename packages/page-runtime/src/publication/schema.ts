export type PackageBuild = { name: string; version: string; build: string };
export type PackageCatalog = { revision: string; packages: Record<string, PackageBuild> };
export const BUILD_ID = /^[a-f0-9]{64}$/;

export function validateCatalog(value: unknown): PackageCatalog {
  if (!value || typeof value !== "object") throw new Error("Invalid package catalog");
  const catalog = value as PackageCatalog;
  if (!BUILD_ID.test(catalog.revision) || !catalog.packages || typeof catalog.packages !== "object" || Array.isArray(catalog.packages)) throw new Error("Invalid package catalog revision or packages");
  for (const [name, entry] of Object.entries(catalog.packages)) {
    if (!entry || entry.name !== name || typeof entry.version !== "string" || !BUILD_ID.test(entry.build)) throw new Error(`Invalid package catalog entry ${name}`);
  }
  return catalog;
}
