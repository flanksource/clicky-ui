import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OperationsApiClientError } from "./apiClient";
import { isCursorStale, useCursorStaleRecovery } from "./cursorStale";
import type { ParameterValues } from "./formMetadata";
import type { OpenAPIParameter } from "./types";

const parameters: OpenAPIParameter[] = [
  { name: "cursor", in: "query", "x-clicky": { role: "cursor" } },
  { name: "Start", in: "query", "x-clicky": { role: "time-from" } },
];

function staleError() {
  return new OperationsApiClientError("cursor no longer matches this query", {
    status: 400,
    responseData: { code: "cursor_stale", message: "the filters changed" },
  });
}

function renderRecovery(error: unknown, values: ParameterValues) {
  const setValues = vi.fn();
  renderHook(() =>
    useCursorStaleRecovery({ error, parameters, values, setValues }),
  );
  return setValues;
}

// Applying the returned updater is what a real setState does, and it is where
// the hook's own re-entrancy guard lives.
function appliedUpdate(setValues: ReturnType<typeof vi.fn>, values: ParameterValues) {
  const updater = setValues.mock.calls[0][0] as (
    current: ParameterValues,
  ) => ParameterValues;
  return updater(values);
}

describe("isCursorStale", () => {
  it("reads the structured code rather than the message prose", () => {
    expect(isCursorStale(staleError())).toBe(true);
  });

  it("ignores every other failure", () => {
    const other = new OperationsApiClientError("boom", {
      status: 500,
      responseData: { code: "query_failed" },
    });
    expect(isCursorStale(other)).toBe(false);
    expect(isCursorStale(new Error("network down"))).toBe(false);
    expect(isCursorStale(null)).toBe(false);
  });
});

describe("useCursorStaleRecovery", () => {
  // The cursor lives in the URL as well as the form, so clearing it through
  // setValues is what stops a reload replaying the request the server refused.
  it("clears the cursor so the walk restarts at the first page", () => {
    const values = { cursor: "stale-token", Start: "now-2d" };
    const update = appliedUpdate(renderRecovery(staleError(), values), values);
    expect(update.cursor).toBe("");
    expect(update.Start).toBe("now-2d");
  });

  it("leaves every other failure alone", () => {
    const other = new OperationsApiClientError("boom", {
      status: 500,
      responseData: { code: "query_failed" },
    });
    expect(renderRecovery(other, { cursor: "stale-token" })).not.toHaveBeenCalled();
  });

  // A server answering cursor_stale to a request carrying no cursor would
  // otherwise spin: clear, re-request, be refused, clear again.
  it("does nothing when no cursor is set", () => {
    expect(renderRecovery(staleError(), { cursor: "" })).not.toHaveBeenCalled();
    expect(renderRecovery(staleError(), {})).not.toHaveBeenCalled();
  });

  it("makes no change when the cursor is already gone by the time it applies", () => {
    const values = { cursor: "stale-token" };
    const cleared = { cursor: "" };
    expect(appliedUpdate(renderRecovery(staleError(), values), cleared)).toBe(cleared);
  });
});
