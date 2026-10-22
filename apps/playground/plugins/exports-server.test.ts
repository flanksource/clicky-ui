import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import type { ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { EXPORTS_ROUTE, serveExport, storeExport } from "./exports-server";

function captureResponse() {
  const headers: Record<string, unknown> = {};
  let body: Buffer | undefined;
  const res = {
    statusCode: 0,
    setHeader: (key: string, value: unknown) => (headers[key] = value),
    end: (value: Buffer) => (body = value),
  } as unknown as ServerResponse;
  return { res, headers, body: () => body?.toString("utf8") };
}

describe("exports store", () => {
  let dir = "";
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"/>';

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "playground-exports-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("replaces an export and serves the latest as a download", () => {
    storeExport(dir, "page-card.svg", Buffer.from("<svg/>"));
    const url = storeExport(dir, "page-card.svg", Buffer.from(svg));
    const response = captureResponse();

    serveExport(dir, "page-card.svg", response.res);

    expect({
      url,
      stored: readFileSync(join(dir, "exports", "page-card.svg"), "utf8"),
      status: response.res.statusCode,
      type: response.headers["Content-Type"],
      disposition: response.headers["Content-Disposition"],
      body: response.body(),
    }).toEqual({
      url: `${EXPORTS_ROUTE}/page-card.svg`,
      stored: svg,
      status: 200,
      type: "image/svg+xml",
      disposition: 'attachment; filename="page-card.svg"',
      body: svg,
    });
  });

  it.each([
    ["../escape.svg", 400],
    ["page-card.js", 400],
    ["nested/page-card.svg", 400],
  ])("rejects export name %s", (name, statusCode) => {
    expect(() => storeExport(dir, name, Buffer.from(svg))).toThrow(
      expect.objectContaining({ statusCode }),
    );
  });

  it("rejects an empty export body", () => {
    expect(() => storeExport(dir, "page-card.png", Buffer.alloc(0))).toThrow(
      /between 1 byte/,
    );
  });

  it("reports a missing export as not found", () => {
    expect(() =>
      serveExport(dir, "page-card.html", captureResponse().res),
    ).toThrow(expect.objectContaining({ statusCode: 404 }));
  });
});
