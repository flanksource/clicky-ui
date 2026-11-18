// @vitest-environment node
import { expect, it } from "vitest";
import { DEFAULT_GAVEL_URL, fixedGavel } from "./gavel-launch-server";

it("reaches the gavel launch server at its default address unless told otherwise", async () => {
  expect({ default: await fixedGavel().url(), explicit: await fixedGavel("http://gavel.local").url(), address: DEFAULT_GAVEL_URL }).toEqual({
    default: "http://127.0.0.1:9330",
    explicit: "http://gavel.local",
    address: "http://127.0.0.1:9330",
  });
});
