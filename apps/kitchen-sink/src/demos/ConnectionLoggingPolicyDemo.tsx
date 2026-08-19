import { useState } from "react";
import {
  ConnectionLoggingPolicy,
  type ConnectionLoggingCapability,
} from "@flanksource/clicky-ui";

const OPENSEARCH_CAPABILITY: ConnectionLoggingCapability = {
  family: "http",
  slowThreshold: "1s",
  thresholdLabel: "Slow threshold",
  events: [
    {
      event: "error",
      property: "log.level.error",
      label: "Errors",
      description: "Failed operations with a sanitized request identity.",
      default: "error",
      captures: ["error", "operation", "duration"],
      example: {
        event: "error",
        connection_level: "error",
        provider: "opensearch",
        connection: "search",
        duration_ms: 82,
        rows: 0,
        method: "POST",
        url: "https://api.example.test/_search",
        status: 503,
        error: "request timed out",
      },
      prettyExample:
        "[opensearch/search] ERROR >=[82ms] [rows:0] POST https://api.example.test/_search [503] request timed out",
    },
    {
      event: "slow",
      property: "log.level.slow",
      label: "Slow operations",
      description: "Successful requests at or above the slow threshold.",
      default: "warn",
      captures: ["operation", "duration", "slow threshold"],
      example: {
        event: "slow",
        connection_level: "warn",
        provider: "opensearch",
        connection: "search",
        duration_ms: 1200,
        rows: 1,
        method: "POST",
        url: "https://api.example.test/_search",
        status: 200,
        slow_threshold_ms: 1000,
      },
      prettyExample:
        "[opensearch/search] SLOW >= [1200ms] [rows:1] POST https://api.example.test/_search [200]",
    },
    {
      event: "http",
      property: "log.level.http",
      label: "Access summary",
      description:
        "One method, sanitized URL, status and duration record per request.",
      default: "debug",
      captures: ["method", "URL", "status", "duration"],
      example: {
        event: "http",
        connection_level: "debug",
        provider: "opensearch",
        connection: "search",
        duration_ms: 86,
        rows: 1,
        method: "POST",
        url: "https://api.example.test/_search",
        status: 200,
      },
      prettyExample:
        "[opensearch/search] POST https://api.example.test/_search 200 OK 86ms 512B",
    },
    {
      event: "http_headers",
      property: "log.level.http.headers",
      label: "Headers and parameters",
      description:
        "Sanitized request and response headers plus query parameters.",
      default: "trace",
      captures: ["headers", "query parameters"],
      example: {
        event: "http_headers",
        connection_level: "trace",
        provider: "opensearch",
        connection: "search",
        duration_ms: 86,
        rows: 1,
        method: "POST",
        url: "https://api.example.test/_search",
        status: 200,
        request_headers: [{ name: "Authorization", value: "Bearer ********" }],
      },
      prettyExample:
        "[opensearch/search] POST https://api.example.test/_search 200 OK 86ms 512B\nRequest Headers\nAuthorization: Bearer ********",
    },
    {
      event: "http_request_body",
      property: "log.level.http.request.body",
      label: "Request body",
      description: "A bounded sanitized request body.",
      default: "trace1",
      captures: ["request body"],
      example: {
        event: "http_request_body",
        connection_level: "trace1",
        provider: "opensearch",
        connection: "search",
        duration_ms: 86,
        rows: 1,
        method: "POST",
        url: "https://api.example.test/_search",
        status: 200,
        request_body: '{"query":{"match_all":{}}}',
        body_size: 68,
      },
      prettyExample:
        '[opensearch/search] POST https://api.example.test/_search 200 OK 86ms 512B\nRequest Body\n{\n  "query": {\n    "match_all": {}\n  }\n}',
    },
    {
      event: "http_response_body",
      property: "log.level.http.response.body",
      label: "Response body",
      description:
        "A bounded sanitized response body with explicit truncation metadata.",
      default: "trace2",
      captures: ["response body"],
      example: {
        event: "http_response_body",
        connection_level: "trace2",
        provider: "opensearch",
        connection: "search",
        duration_ms: 86,
        rows: 1,
        method: "POST",
        url: "https://api.example.test/_search",
        status: 200,
        response_body: '{"hits":["..."]}',
        body_size: 512,
        truncated: true,
      },
      prettyExample:
        '[opensearch/search] POST https://api.example.test/_search 200 OK 86ms 512B\nResponse Body (truncated)\n{\n  "hits": [\n    "..."\n  ]\n}',
    },
  ],
};

export function ConnectionLoggingPolicyDemo() {
  const [value, setValue] = useState<Record<string, string>>({});
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Connection logging policy</h2>
        <p className="text-sm text-muted-foreground">
          Shared editor for provider-aware levels, slow thresholds, and
          cumulative sanitized previews.
        </p>
      </div>
      <ConnectionLoggingPolicy
        definition={OPENSEARCH_CAPABILITY}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}
