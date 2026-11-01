import { describe, expect, it } from "vitest";
import { isLocalHostname } from "./local-path";

describe("local hostnames", () => {
  it("limits browsing to literal local hostnames", () => {
    expect(
      [
        "localhost",
        "127.0.0.1",
        "[::1]",
        "example.com",
        "localhost.example.com",
      ].map(isLocalHostname),
    ).toEqual([true, true, true, false, false]);
  });
});
