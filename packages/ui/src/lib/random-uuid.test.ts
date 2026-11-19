import { afterEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "./random-uuid";

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SAMPLES = 2_000;

describe("randomUUID", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns distinct RFC 4122 v4 UUIDs when crypto.randomUUID is missing, as on plain-HTTP origins", () => {
    vi.stubGlobal("crypto", { getRandomValues: globalThis.crypto.getRandomValues.bind(globalThis.crypto) });
    const ids = Array.from({ length: SAMPLES }, () => randomUUID());
    expect(ids.every((id) => V4.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(SAMPLES);
  });

  it("encodes the bytes from getRandomValues with the version and variant bits set", () => {
    vi.stubGlobal("crypto", { getRandomValues: (bytes: Uint8Array) => bytes.fill(0xff) });
    expect(randomUUID()).toBe("ffffffff-ffff-4fff-bfff-ffffffffffff");
    vi.stubGlobal("crypto", { getRandomValues: (bytes: Uint8Array) => bytes.fill(0x00) });
    expect(randomUUID()).toBe("00000000-0000-4000-8000-000000000000");
  });
});
