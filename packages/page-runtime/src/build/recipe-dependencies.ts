import { pathToFileURL } from "node:url";
import type { PageStylesRecipe } from "../schema.ts";
import type { ClosureTracer } from "./trace.ts";

export async function traceRecipeDependencies(tracer: ClosureTracer): Promise<void> {
  const entry = tracer.spec.entries.find(({ specifier }) => specifier === `${tracer.spec.name}/page-styles`);
  if (!entry) return;
  const loaded = await import(pathToFileURL(entry.path).href) as { pageStyles?: PageStylesRecipe; default?: PageStylesRecipe };
  const recipe = loaded.pageStyles ?? loaded.default;
  if (!recipe || !Array.isArray(recipe.runtimeDependencies) || recipe.runtimeDependencies.some((value) => typeof value !== "string" || !value || /^[a-z][a-z0-9+.-]*:/i.test(value))) {
    throw new Error(`${entry.specifier}: runtimeDependencies must declare package specifiers or relative files`);
  }
  tracer.traceDependencies({ path: entry.path, dependencies: recipe.runtimeDependencies });
}
