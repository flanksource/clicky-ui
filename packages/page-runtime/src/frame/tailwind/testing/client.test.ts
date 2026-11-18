// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { run } from "./client.ts";

afterEach(() => { history.replaceState(null, "", "/"); });

it.each(["constructor", "toString", "__proto__", "missing"])("rejects unregistered page %s before loading it", async (page) => {
  history.replaceState(null, "", `/?page=${page}`);
  await expect(run({
    libraries: [], candidates: [], base: [], pages: {}, data: null,
    loaders: {
      loadStylesheet: async () => { throw new Error("unexpected stylesheet load"); },
      loadModule: async () => { throw new Error("unexpected module load"); },
    },
  })).rejects.toThrow(`unknown page ${page}`);
});
