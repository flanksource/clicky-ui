import { describe, expect, it } from "vitest";
import { OperationsApiClientError } from "./apiClient";
import { operationErrorDiagnostics } from "./operationErrorDiagnostics";

// The payload commons-db's profile execution endpoint returns on a failed
// query: a stable code, a human message, and the provider diagnostics that
// name the statement which actually failed.
const PROFILE_ERROR_BODY = {
  code: "query_failed",
  message: 'profile "om-malawi-scheme": failed to execute sql query: ERROR: column "premum" does not exist (SQLSTATE 42703)',
  diagnostics: {
    provider: "postgres",
    request: {
      query: "SELECT scheme, premum\nFROM policies\nWHERE start >= $1 AND start < $2",
      arguments: ["2026-07-01", "2026-08-11"],
      options: { database: "malawi" },
    },
    response: { durationMs: 12.5 },
  },
};

const PROFILE_ERROR_URL = "/api/v1/profile/profile-om-malawi-scheme?start=2026-07-01&end=2026-08-11";

function profileError() {
  return new OperationsApiClientError(PROFILE_ERROR_BODY.message, {
    status: 400,
    method: "GET",
    url: PROFILE_ERROR_URL,
    responseBody: JSON.stringify(PROFILE_ERROR_BODY),
    responseData: PROFILE_ERROR_BODY,
  });
}

function contextValue(context: Array<[string, string]>, label: string) {
  return context.find(([key]) => key === label)?.[1];
}

function detailValue(diagnostics: { details?: Array<{ label: string; value: string }> }, label: string) {
  return diagnostics.details?.find((detail) => detail.label === label)?.value;
}

describe("operationErrorDiagnostics", () => {
  it("keeps the server message rather than the generic request failure", () => {
    expect(operationErrorDiagnostics(profileError()).message).toBe(PROFILE_ERROR_BODY.message);
  });

  it("surfaces the request identity and the error code as context", () => {
    const { context } = operationErrorDiagnostics(profileError());
    expect(contextValue(context, "Method")).toBe("GET");
    expect(contextValue(context, "URL")).toBe(PROFILE_ERROR_URL);
    expect(contextValue(context, "Status")).toBe("400");
    expect(contextValue(context, "Code")).toBe("query_failed");
  });

  it("surfaces the provider and its duration from the diagnostics envelope", () => {
    const { context } = operationErrorDiagnostics(profileError());
    expect(contextValue(context, "Provider")).toBe("postgres");
    expect(contextValue(context, "Duration")).toBe("12.5ms");
  });

  it("carries the failing statement and its bound arguments as detail blocks", () => {
    const diagnostics = operationErrorDiagnostics(profileError());
    expect(detailValue(diagnostics, "Query")).toBe(PROFILE_ERROR_BODY.diagnostics.request.query);
    expect(detailValue(diagnostics, "Arguments")).toBe(
      JSON.stringify(PROFILE_ERROR_BODY.diagnostics.request.arguments, null, 2),
    );
  });

  it("keeps the raw body so an unmapped field is never hidden", () => {
    expect(detailValue(operationErrorDiagnostics(profileError()), "Response")).toBe(
      JSON.stringify(PROFILE_ERROR_BODY),
    );
  });

  it("falls back to the response body when the server sent no diagnostics", () => {
    const error = new OperationsApiClientError("GET /api/v1/profile/x failed with 502: upstream", {
      status: 502,
      method: "GET",
      url: "/api/v1/profile/x",
      responseBody: "upstream refused the connection",
    });
    const diagnostics = operationErrorDiagnostics(error);
    expect(diagnostics.message).toBe("GET /api/v1/profile/x failed with 502: upstream");
    expect(detailValue(diagnostics, "Response")).toBe("upstream refused the connection");
  });

  it("keeps the JS stack when the server supplied none", () => {
    const error = new Error("network unreachable");
    expect(operationErrorDiagnostics(error).stacktrace).toBe(error.stack);
  });

  it("prefers a server stack trace over the client one", () => {
    const error = new OperationsApiClientError("boom", {
      status: 500,
      responseData: { message: "boom", stack_trace: "--- at query/engine.go:41 Execute" },
    });
    expect(operationErrorDiagnostics(error).stacktrace).toBe("--- at query/engine.go:41 Execute");
  });

  it("renders a bare string error without inventing context", () => {
    const diagnostics = operationErrorDiagnostics("profile is not configured");
    expect(diagnostics.message).toBe("profile is not configured");
    expect(diagnostics.context).toEqual([]);
    expect(diagnostics.details).toBeUndefined();
  });
});
