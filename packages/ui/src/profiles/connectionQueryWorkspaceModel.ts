/**
 * Which navigator tabs the query workspace offers, and which one it opens on.
 *
 * Kept apart from the workspace component so that module exports only
 * components (react/only-export-components).
 */

import type { BrowserDescriptor } from "./connectionBrowserModel";
import type { EsSearch } from "./esQueryBuilderModel";
import { operatorCatalogFromSchema } from "./esQueryOperators";

export type NavigatorTab = { id: "catalog" | "form" | "json"; label: string };

/**
 * A source supports the builder when the server described a structured search on
 * it. The operator catalog travels with the schema, so no provider name is
 * hardcoded here — adding a structured provider in Go reaches the editor on its
 * own.
 */
export function supportsQueryBuilder(descriptor: BrowserDescriptor): boolean {
  return operatorCatalogFromSchema(descriptor.optionsSchema).length > 0;
}

/**
 * navigatorTabs is what the left pane offers. Where the source has a structured
 * search, the two ways of authoring one — the form and the raw DSL — are tabs
 * rather than a one-way door: they are the same query, and the tab says which
 * of the two is stored. A source that picks one flat target has a combobox
 * pinned above the tabs instead of a catalog tree — its targets are a list of
 * index names, and a list is not worth navigating.
 */
export function navigatorTabs(input: {
  descriptor: BrowserDescriptor;
  builder: boolean;
}): NavigatorTab[] {
  const tabs: NavigatorTab[] = [];
  if (input.descriptor.catalog && !input.descriptor.targetLabel) {
    tabs.push({ id: "catalog", label: "Catalog" });
  }
  if (input.builder) {
    tabs.push({ id: "form", label: "Form" }, { id: "json", label: "JSON" });
  }
  return tabs;
}

/**
 * initialNavigatorTab opens on the form: filters are what the builder is for,
 * so it is where authoring starts rather than something to opt into. The one
 * thing that overrides it is a raw query already worth preserving — and the
 * starter query the descriptor supplies is not one, since nobody wrote it.
 */
export function initialNavigatorTab(input: {
  tabs: NavigatorTab[];
  search: EsSearch | undefined;
  query: string;
  defaultQuery?: string;
}): string | undefined {
  const has = (id: NavigatorTab["id"]) =>
    input.tabs.some((tab) => tab.id === id);
  if (!has("form")) return input.tabs[0]?.id;
  if (input.search) return "form";
  const authored = input.query.trim();
  return authored && authored !== (input.defaultQuery ?? "").trim()
    ? "json"
    : "form";
}
