import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ConnectionLoggingPolicy } from "./ConnectionLoggingPolicy";
import {
  parseConnectionLoggingThreshold,
  visibleConnectionLogEvents,
  type ConnectionLoggingCapability,
} from "./ConnectionLoggingPolicy.model";

const HTTP_CAPABILITY: ConnectionLoggingCapability = {
  family: "http",
  slowThreshold: "1s",
  thresholdLabel: "Slow threshold",
  events: [
    {
      event: "error",
      property: "log.level.error",
      label: "Errors",
      description: "Failed requests.",
      default: "error",
      captures: ["error", "duration"],
      example: { level: "error", error: "connection refused" },
      prettyExample:
        "[http/inline] ERROR >=[82ms] [rows:0] GET https://api.example.test [503] connection refused",
    },
    {
      event: "slow",
      property: "log.level.slow",
      label: "Slow operations",
      description: "Requests over the threshold.",
      default: "warn",
      captures: ["duration"],
      example: { level: "warn", duration: "1.2s" },
      prettyExample:
        "[http/inline] SLOW >= [1200ms] [rows:1] GET https://api.example.test [200]",
    },
    {
      event: "http",
      property: "log.level.http",
      label: "Access summary",
      description: "Method, URL and status.",
      default: "debug",
      captures: ["method", "URL", "status"],
      example: { level: "debug", method: "POST", status: 200 },
      prettyExample:
        "[http/inline] POST https://api.example.test/_search 200 OK 86ms 512B",
    },
    {
      event: "http_headers",
      property: "log.level.http.headers",
      label: "Headers and parameters",
      description: "Sanitized headers.",
      default: "trace",
      captures: ["headers"],
      example: { level: "trace", Authorization: "********" },
      prettyExample:
        "[http/inline] POST https://api.example.test/_search 200 OK 86ms 512B\nRequest Headers\nAuthorization: ********",
    },
    {
      event: "http_response_body",
      property: "log.level.http.response.body",
      label: "Response body",
      description: "Bounded response body.",
      default: "trace2",
      captures: ["response body"],
      example: { level: "trace2", token: "********" },
      prettyExample:
        '[http/inline] POST https://api.example.test/_search 200 OK 86ms 512B\nResponse Body\n{\n  "token": "********"\n}',
    },
  ],
};

function ControlledPolicy() {
  const [value, setValue] = useState<Record<string, string>>({});
  return (
    <>
      <ConnectionLoggingPolicy
        definition={HTTP_CAPABILITY}
        value={value}
        onChange={setValue}
      />
      <output data-testid="value">{JSON.stringify(value)}</output>
    </>
  );
}

describe("ConnectionLoggingPolicy", () => {
  it("shows the cumulative records emitted at the selected logger level", () => {
    expect(
      visibleConnectionLogEvents(HTTP_CAPABILITY, {}, "debug").map(
        (event) => event.event,
      ),
    ).toEqual(["error", "slow", "http"]);
    expect(
      visibleConnectionLogEvents(HTTP_CAPABILITY, {}, "trace2"),
    ).toHaveLength(5);
  });

  it("stores only explicit level and threshold overrides", () => {
    render(<ControlledPolicy />);

    fireEvent.click(
      within(
        screen.getByRole("radiogroup", { name: "Response body level" }),
      ).getByRole("radio", { name: "Off" }),
    );
    expect(screen.getByTestId("value")).toHaveTextContent(
      JSON.stringify({ "log.level.http.response.body": "off" }),
    );

    fireEvent.click(
      within(
        screen.getByRole("radiogroup", { name: "Response body level" }),
      ).getByRole("radio", { name: "Trace2" }),
    );
    expect(screen.getByTestId("value")).toHaveTextContent("{}");

    fireEvent.change(screen.getByLabelText("Slow threshold value"), {
      target: { value: "2" },
    });
    expect(screen.getByTestId("value")).toHaveTextContent(
      JSON.stringify({ "log.slowThreshold": "2s" }),
    );
  });

  it("uses compact segmented level controls without capture tags", () => {
    render(<ControlledPolicy />);

    const control = screen.getByRole("radiogroup", { name: "Errors level" });
    expect(within(control).getAllByRole("radio")).toHaveLength(10);
    expect(within(control).getByRole("radio", { name: "Error" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByText("Captures error, duration")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Errors captured fields"),
    ).not.toBeInTheDocument();
  });

  it("rejects an invalid slow threshold from the capability", () => {
    expect(() => parseConnectionLoggingThreshold("later")).toThrowError(
      'invalid connection logging threshold "later"',
    );
  });

  it("renders sanitized preview examples instead of hidden higher-level records", () => {
    render(<ControlledPolicy />);
    const preview = screen.getByTestId("connection-log-preview");
    expect(
      within(preview).getAllByTestId("connection-log-preview-event"),
    ).toHaveLength(3);
    expect(
      within(preview).queryByText(/Authorization/),
    ).not.toBeInTheDocument();
    expect(
      within(preview).getByText(/POST https:\/\/api\.example\.test/),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Preview logger level"), {
      target: { value: "trace" },
    });
    expect(within(preview).getByText(/Authorization/)).toHaveTextContent(
      "********",
    );

    fireEvent.click(screen.getByRole("radio", { name: "JSON" }));
    expect(within(preview).getByText(/Authorization/)).toHaveTextContent(
      '"Authorization": "********"',
    );
  });
});
