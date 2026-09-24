import type { ClickyRow } from "../data/Clicky";
import type {
  ExecutionResponse,
  OpenAPISpec,
  OperationLookupResponse,
} from "./types";
import type { OperationsApiClient } from "./useOperations";

// Fixture for the row-picking specs and story: a "schemes" surface with a
// search param, two lookup-backed filters (status, product), paging, a detail
// operation (so row navigation is live unless picking suppresses it) and a
// collection "create" action (so the action bar has something to render).

const text = (plain: string) => ({ kind: "text" as const, plain, text: plain });

export const SCHEMES_PATH = "/api/v1/schemes";

export function schemeRow(id: string, company: string, status: string): ClickyRow {
  return {
    cells: {
      id: text(id),
      customer_number: text(id),
      company: text(company),
      status: text(status),
    },
  };
}

export const SCHEME_ROWS: ClickyRow[] = [
  schemeRow("G0000011", "Acme Mining", "Active"),
  schemeRow("G0000012", "Example Retail", "Pending"),
];

export function schemesSpec(): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "test", version: "1" },
    "x-clicky": {
      surfaces: [{ key: "schemes", entity: "scheme", title: "Schemes" }],
    },
    paths: {
      [SCHEMES_PATH]: {
        get: {
          operationId: "scheme_list",
          parameters: [
            { name: "q", in: "query", "x-clicky": { role: "search" } },
            { name: "status", in: "query", "x-clicky": { role: "filter" } },
            { name: "product", in: "query", "x-clicky": { role: "filter" } },
            { name: "limit", in: "query", "x-clicky": { role: "limit" } },
            { name: "offset", in: "query", "x-clicky": { role: "offset" } },
          ],
          "x-clicky": { surface: "schemes", verb: "list", scope: "collection" },
          responses: {},
        },
        post: {
          operationId: "scheme_create",
          summary: "Create scheme",
          "x-clicky": {
            surface: "schemes",
            verb: "create",
            scope: "collection",
          },
          responses: {},
        },
      },
      [`${SCHEMES_PATH}/{id}`]: {
        get: {
          operationId: "scheme_get",
          parameters: [{ name: "id", in: "path" }],
          "x-clicky": {
            surface: "schemes",
            verb: "get",
            scope: "entity",
            idParam: "id",
          },
          responses: {},
        },
      },
    },
  };
}

export function schemesResponse(rows: ClickyRow[] = SCHEME_ROWS): ExecutionResponse {
  return {
    success: true,
    exit_code: 0,
    contentType: "application/json+clicky",
    parsed: {
      version: 1,
      node: {
        kind: "table",
        columns: [
          { name: "customer_number", label: "Customer Number" },
          { name: "company", label: "Company" },
          { name: "status", label: "Status" },
        ],
        rows,
      },
    },
  };
}

export const SCHEMES_LOOKUP: OperationLookupResponse = {
  filters: {
    status: {
      label: "Status",
      options: { Active: text("Active"), Pending: text("Pending") },
    },
    product: {
      label: "Product",
      options: { "gl-guid": text("Group Life") },
    },
  },
};

export const executeSchemes = async (): Promise<ExecutionResponse> => schemesResponse();
export const lookupSchemes = async (): Promise<OperationLookupResponse> => SCHEMES_LOOKUP;

export function schemesClient(overrides: Partial<OperationsApiClient> = {}): OperationsApiClient {
  return {
    getOpenAPISpec: async () => schemesSpec(),
    executeCommand: executeSchemes,
    lookupFilters: lookupSchemes,
    ...overrides,
  };
}
