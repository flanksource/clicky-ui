import { afterEach, describe, expect, it, vi } from "vitest";

import { configureProfiles } from "../profileApi";
import {
  previewProfileProcessors,
  processorPreviewRequestProfile,
} from "./processorPreview";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("processor preview requests", () => {
  it("keeps the draft transforms and processors while dropping UI-only state", () => {
    expect(
      processorPreviewRequestProfile({
        profile: "logs",
        provider: { type: "loki", connection: "connection://prod" },
        query: '{app="api"}',
        columns: [{ name: "message" }],
        aliases: [{ name: "severity", cel: "row.level" }],
        ignore: ["stream"],
        filters: [{ name: "errors", cel: "row.severity == 'error'" }],
        processors: [{ use: "logs.json" }],
        limits: { maxPageSize: 50 },
        _id: "ui-only",
      }),
    ).toEqual({
      profile: "logs",
      provider: { type: "loki", connection: "connection://prod" },
      query: '{app="api"}',
      columns: [{ name: "message" }],
      aliases: [{ name: "severity", cel: "row.level" }],
      ignore: ["stream"],
      filters: [{ name: "errors", cel: "row.severity == 'error'" }],
      processors: [{ use: "logs.json" }],
      limits: { maxPageSize: 50 },
    });
  });

  it("asks the configured sample endpoint to execute processors", async () => {
    configureProfiles({
      schema: { type: "object", properties: {} },
      basePath: "/query/api",
    });
    const response = {
      rows: [{ message: "started", severity: "info" }],
      processorPreview: {
        input: [{ message: '{"level":"info","msg":"started"}' }],
        stages: [
          {
            index: 0,
            label: "logs.json",
            type: "logs.parse",
            rowsIn: 1,
            rowsOut: 1,
            rows: [{ message: "started", severity: "info" }],
          },
        ],
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      previewProfileProcessors(
        {
          profile: "logs",
          provider: { type: "loki" },
          processors: [{ use: "logs.json" }],
        },
        { namespace: "prod" },
      ),
    ).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/query/api/profile/sample");
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      profile: {
        profile: "logs",
        provider: { type: "loki" },
        processors: [{ use: "logs.json" }],
      },
      params: { namespace: "prod" },
      previewProcessors: true,
    });
  });
});
