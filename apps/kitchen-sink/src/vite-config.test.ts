import { describe, expect, it } from "vitest";

import config from "../vite.config";

describe("kitchen sink Vite config", () => {
  it("deduplicates React across the app and linked UI package", () => {
    expect(config.resolve?.dedupe).toEqual(["react", "react-dom"]);
  });
});
