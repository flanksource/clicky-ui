import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QueryBrowserDiagnosticsPanel } from "./QueryBrowserDiagnosticsPanel";
import type { QueryBrowserDiagnostics } from "./QueryBrowser.types";

const diagnostics: QueryBrowserDiagnostics = {
  provider: "opensearch",
  request: {
    query: '{"query":{"range":{"startTimeMillis":{"gte":"now-3M"}}}}',
    method: "POST",
    url: "https://search.example.com/traces-*/_search?size=100",
    headers: { Authorization: "********", "Content-Type": "application/json" },
    details: { index: "traces-*", limit: "100" },
  },
  response: {
    status: 200,
    durationMs: 90,
    returnedRows: 100,
    headers: { "content-type": "application/json" },
    preview: '{"hits":{"total":{"value":10000}}}',
  },
};

describe("QueryBrowserDiagnosticsPanel", () => {
  it("shows the endpoint and headers the request went out with", () => {
    render(<QueryBrowserDiagnosticsPanel diagnostics={diagnostics} />);

    const request = screen.getByLabelText("Provider request");
    expect(within(request).getByLabelText("Provider endpoint")).toHaveTextContent(
      "POST https://search.example.com/traces-*/_search?size=100",
    );
    // The credential is reported as present and never as plaintext.
    expect(within(request).getByText(/Authorization/)).toBeVisible();
    expect(within(request).getByText(/\*{8}/)).toBeVisible();
    expect(screen.getByLabelText("Provider query")).toHaveTextContent(
      "startTimeMillis",
    );
  });

  it("keeps the response body out of the summary it sits beside", () => {
    render(<QueryBrowserDiagnosticsPanel diagnostics={diagnostics} />);

    const response = screen.getByLabelText("Provider response");
    const summary = within(response).getByLabelText("Response summary");
    expect(
      within(response).getByLabelText("Provider response headers"),
    ).toHaveTextContent("content-type");
    expect(summary).toHaveTextContent('"status": 200');
    expect(summary).not.toHaveTextContent("hits");
    expect(
      within(response).getByLabelText("Provider response preview"),
    ).toHaveTextContent("hits");
  });
});
