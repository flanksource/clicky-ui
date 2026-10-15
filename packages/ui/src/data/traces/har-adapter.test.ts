import { describe, expect, it } from "vitest";
import { httpExchangeRows } from "./fixtures";
import { exchangeToHarEntry } from "./har-adapter";
import type { HttpExchangeRow } from "./types";

const [jsonExchange, postExchange, tunnel, refused] = httpExchangeRows as [
  HttpExchangeRow,
  HttpExchangeRow,
  HttpExchangeRow,
  HttpExchangeRow,
];

describe("exchangeToHarEntry", () => {
  it("maps the exchange envelope onto a HAR entry", () => {
    const entry = exchangeToHarEntry(jsonExchange);
    expect(entry).toMatchObject({
      startedDateTime: jsonExchange.startedAt,
      time: 84,
      request: { method: "GET", url: jsonExchange.url, headers: [{ name: "Accept", value: "application/json" }] },
      response: { status: 200, statusText: "OK", bodySize: 42 },
      timings: { send: 1, wait: 80, receive: 3 },
    });
  });

  it("renders a JSON body the store parsed into structure as indented JSON text", () => {
    const entry = exchangeToHarEntry(jsonExchange);
    expect(entry.response.content?.text).toBe(
      JSON.stringify({ items: [{ id: "cfg-1" }, { id: "cfg-2" }] }, null, 2),
    );
    expect(entry.response.content?.mimeType).toBe("application/json");
  });

  it("keeps text bodies verbatim and defaults a structured request body to application/json", () => {
    const entry = exchangeToHarEntry({
      ...postExchange,
      request: { ...postExchange.request, postData: { text: { a: 1 } } },
    });
    expect(entry.response.content?.text).toBe("upstream not ready");
    expect(entry.request.postData).toEqual({ mimeType: "application/json", text: JSON.stringify({ a: 1 }, null, 2) });
  });

  it("omits postData when the request has no body", () => {
    expect(exchangeToHarEntry(jsonExchange).request.postData).toBeUndefined();
  });

  it("describes a tunnelled CONNECT by its bytes in and out instead of a body", () => {
    const entry = exchangeToHarEntry(tunnel);
    expect(entry.response.content?.text).toBe(
      "Tunnelled CONNECT relayed without decrypting it: 471 KB in from the server, 2 KB out from the client.",
    );
    expect(entry.response.bodySize).toBe(482_113);
    expect(entry.request.bodySize).toBe(2_048);
    expect(entry.request.postData).toBeUndefined();
  });

  it("carries a transport error as _error", () => {
    expect(exchangeToHarEntry(refused)._error).toBe(refused.error);
  });

  it("flags a body the capture cut as truncated", () => {
    const entry = exchangeToHarEntry({ ...postExchange, truncated: ["response.content.text"] });
    expect(entry.response.content?.truncated).toBe(true);
  });

  it("uses the supplied id as the entry's stable _id", () => {
    expect(exchangeToHarEntry(jsonExchange, { id: "row-7" })._id).toBe("row-7");
  });

  it("throws, naming the missing part, when the row is not an exchange", () => {
    const broken = { ...jsonExchange, response: undefined } as unknown as HttpExchangeRow;
    expect(() => exchangeToHarEntry(broken)).toThrow(/response/);
  });
});
