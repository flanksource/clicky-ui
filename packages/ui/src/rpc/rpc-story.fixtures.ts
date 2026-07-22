// Shared synthetic backend for the rpc stories: an in-memory OperationsApiClient
// over a small OpenAPI spec with x-clicky surface metadata, plus sample Clicky
// table/detail responses. Lets the connected rpc components (EntityExplorerApp,
// the operation pages, FilterForm, EndpointList) render real data with no
// network. The per-surface data lives in ./rpc-story-fixtures/*; this barrel
// assembles the spec + client and keeps the named exports the stories import.
// Not exported from rpc.ts — story support only. Plain .ts (no JSX) so it stays a
// data module and never trips the react-refresh component-export rule.

import { createElement, type ReactElement } from "react";
import type { RenderLinkArgs } from "./EndpointList";
import type { OperationsApiClient } from "./useOperations";
import type { DomainDefinition, ExecutionResponse, OpenAPISpec, ResolvedOperation } from "./types";
import {
  DEFAULT_PAGE_LIMIT,
  listPage,
  type SurfaceFixture,
} from "./rpc-story-fixtures/surface-fixture";
import { WIDGETS_FIXTURE } from "./rpc-story-fixtures/widgets.fixture";
import { ORDERS_FIXTURE } from "./rpc-story-fixtures/orders.fixture";
import { SERVICES_FIXTURE } from "./rpc-story-fixtures/services.fixture";

const FIXTURES: SurfaceFixture[] = [WIDGETS_FIXTURE, ORDERS_FIXTURE, SERVICES_FIXTURE];

export const SAMPLE_SPEC: OpenAPISpec = {
  openapi: "3.0.0",
  info: { title: "Acme Platform", version: "1.0.0" },
  "x-clicky": { surfaces: FIXTURES.map((fixture) => fixture.surface) },
  paths: Object.assign({}, ...FIXTURES.map((fixture) => fixture.paths)),
};

// Route maps: a collection path → its surface fixture (so each request is paged
// from the master row set); a `/{id}` path → its surface fixture (so the detail
// document is looked up per requested id).
const listFixtureByPath: Record<string, SurfaceFixture> = {};
const detailFixtureByPath: Record<string, SurfaceFixture> = {};
for (const fixture of FIXTURES) {
  for (const path of Object.keys(fixture.paths)) {
    if (path.includes("{")) detailFixtureByPath[path] = fixture;
    else listFixtureByPath[path] = fixture;
  }
}

/** Parses a query parameter the executor sent as a string. Returns undefined for
 *  absent/blank/non-numeric values so `listPage` applies its own default. */
function intParam(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === "") return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
}

export const FAKE_CLIENT: OperationsApiClient = {
  async getOpenAPISpec(): Promise<OpenAPISpec> {
    return SAMPLE_SPEC;
  },
  async executeCommand(path, method, params): Promise<ExecutionResponse> {
    if (method === "get") {
      // List routes page server-side: the response carries only the requested
      // slice plus a {total, limit, offset} envelope, exactly as a real backend
      // reports via X-Total-Count / X-Page-Limit / X-Page-Offset.
      const listFixture = listFixtureByPath[path];
      if (listFixture) {
        return listPage(
          listFixture,
          intParam(params?.limit) ?? DEFAULT_PAGE_LIMIT,
          intParam(params?.offset) ?? 0,
        );
      }
      const detailFixture = detailFixtureByPath[path];
      if (detailFixture) {
        const id = params?.id ?? "";
        const detail = detailFixture.detailById[id] ?? Object.values(detailFixture.detailById)[0];
        if (!detail) throw new Error(`No detail fixture for ${path} (id=${id})`);
        return detail;
      }
    }
    return {
      success: true,
      exit_code: 0,
      contentType: "text/plain",
      stdout: `Pretending to ${method.toUpperCase()} ${path}`,
    };
  },
};

/** The spec's operations flattened to the ResolvedOperation list components use. */
export const SAMPLE_OPERATIONS: ResolvedOperation[] = Object.entries(SAMPLE_SPEC.paths).flatMap(
  ([path, methods]) =>
    Object.entries(methods).map(([method, operation]) => ({ path, method, operation })),
);

/** Widgets list/detail responses — kept as named exports for the focused stories
 *  (CommandOutput, OperationEntityPage) that render a single document. The list
 *  export is the first page, matching what an unparameterised request returns. */
export const SAMPLE_LIST_RESPONSE: ExecutionResponse = listPage(
  WIDGETS_FIXTURE,
  DEFAULT_PAGE_LIMIT,
  0,
);
const widgetDetail = WIDGETS_FIXTURE.detailById.wgt_42;
if (!widgetDetail) throw new Error("Missing widget detail fixture (wgt_42)");
export const SAMPLE_DETAIL_RESPONSE: ExecutionResponse = widgetDetail;

export const WIDGET_DEFINITION: DomainDefinition = {
  key: "widgets",
  title: "Widgets",
  description: "Demo widget surface.",
  emptyTitle: "No widget operations",
  emptyDescription: "This domain exposes no endpoints yet.",
};

/** Plain-anchor renderLink for stories (components stay router-agnostic). */
export function anchorLink({ to, className, children, title }: RenderLinkArgs): ReactElement {
  return createElement("a", { href: to, className, title }, children);
}
