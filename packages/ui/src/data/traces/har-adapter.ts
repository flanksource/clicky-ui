import { formatBytes } from "../../lib/format";
import type { HAREntry, HARHeader, HARRequest, HARResponse } from "../har/types";
import type { HttpExchangeRequest, HttpExchangeResponse, HttpExchangeRow, TraceBodyText } from "./types";

const REQUEST_BODY_PATH = "request.postData.text";
const RESPONSE_BODY_PATH = "response.content.text";

export type ExchangeToHarEntryOptions = {
  /** Stable per-request id, so an expanded HarPanel row survives a re-render. */
  id?: string;
};

/** A body as text: stored text verbatim, a body the store parsed into structure as indented JSON. */
function bodyText(body: TraceBodyText | null | undefined): string | undefined {
  if (body === undefined || body === null) return undefined;
  return typeof body === "string" ? body : JSON.stringify(body, null, 2);
}

function mimeTypeOf(body: TraceBodyText | null | undefined, declared: string | undefined): string | undefined {
  if (declared) return declared;
  return body !== undefined && body !== null && typeof body !== "string" ? "application/json" : undefined;
}

function headers(list: HARHeader[] | null | undefined): { headers?: HARHeader[] } {
  return list ? { headers: list } : {};
}

function requireObject<T>(value: T | undefined | null, part: string, row: HttpExchangeRow): T {
  if (value === undefined || value === null || typeof value !== "object") {
    throw new Error(`HTTP exchange ${row.method ?? "?"} ${row.url ?? "?"} has no ${part} object`);
  }
  return value;
}

function harRequest(request: HttpExchangeRequest, bodySize: number | undefined): HARRequest {
  const text = bodyText(request.postData?.text);
  return {
    method: request.method,
    url: request.url,
    ...(request.httpVersion ? { httpVersion: request.httpVersion } : {}),
    ...headers(request.headers),
    ...(request.queryString ? { queryString: request.queryString } : {}),
    ...(text !== undefined
      ? { postData: { mimeType: mimeTypeOf(request.postData?.text, request.postData?.mimeType) ?? "", text } }
      : {}),
    ...(request.headersSize !== undefined ? { headersSize: request.headersSize } : {}),
    ...(bodySize !== undefined ? { bodySize } : {}),
  };
}

function harResponse(
  response: HttpExchangeResponse,
  text: string | undefined,
  mimeType: string | undefined,
  bodySize: number,
  truncated: boolean,
): HARResponse {
  return {
    status: response.status,
    ...(response.statusText ? { statusText: response.statusText } : {}),
    ...(response.httpVersion ? { httpVersion: response.httpVersion } : {}),
    ...headers(response.headers),
    content: {
      size: response.content?.size ?? bodySize,
      ...(mimeType ? { mimeType } : {}),
      ...(text !== undefined ? { text } : {}),
      ...(truncated ? { truncated } : {}),
    },
    ...(response.redirectURL ? { redirectURL: response.redirectURL } : {}),
    ...(response.headersSize !== undefined ? { headersSize: response.headersSize } : {}),
    bodySize,
  };
}

function tunnelSummary(row: HttpExchangeRow): string {
  return `Tunnelled CONNECT relayed without decrypting it: ${formatBytes(row.bytesIn ?? 0)} in from the server, ${formatBytes(row.bytesOut ?? 0)} out from the client.`;
}

/**
 * Adapts one `http` / `http_proxy` trace row to the HAR entry `HarPanel`
 * renders. A tunnelled CONNECT has no request or response body to show, so its
 * byte counts stand in for the response body and fill the size columns.
 */
export function exchangeToHarEntry(row: HttpExchangeRow, options: ExchangeToHarEntryOptions = {}): HAREntry {
  const request = requireObject(row.request, "request", row);
  const response = requireObject(row.response, "response", row);
  const cut = new Set(row.truncated ?? []);
  const tunnelled = row.tunnelled === true;

  const responseBody = tunnelled ? tunnelSummary(row) : bodyText(response.content?.text);
  const responseMime = tunnelled ? "text/plain" : mimeTypeOf(response.content?.text, response.content?.mimeType);
  const responseSize = tunnelled ? (row.bytesIn ?? 0) : (response.bodySize ?? response.content?.size ?? 0);

  return {
    startedDateTime: row.startedAt,
    time: row.durationMs,
    request: harRequest(request, tunnelled ? (row.bytesOut ?? 0) : request.bodySize),
    response: harResponse(response, responseBody, responseMime, responseSize, cut.has(RESPONSE_BODY_PATH)),
    ...(row.timings ? { timings: row.timings } : {}),
    ...(options.id ? { _id: options.id } : {}),
    ...(row.error ? { _error: row.error } : {}),
    ...(row.serverIPAddress ? { serverIPAddress: row.serverIPAddress } : {}),
    ...(tunnelled ? { _tunnelled: true, _bytesIn: row.bytesIn ?? 0, _bytesOut: row.bytesOut ?? 0 } : {}),
    ...(row.comment ? { _comment: row.comment } : {}),
    ...(row.encoding ? { _encoding: row.encoding } : {}),
    ...(cut.has(REQUEST_BODY_PATH) ? { _requestBodyTruncated: true } : {}),
  };
}
