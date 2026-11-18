import { describe, expect, it } from "vitest";
import { rolldown } from "rolldown";
import { reactExternals } from "./react-externals.ts";

describe("shared React in browser bundles", () => {
  it("converts CommonJS React requires into imports of the shared ESM runtime", async () => {
    const bundle = await rolldown({ input: "entry", plugins: [
      { name: "fixture", resolveId: source => source === "entry" ? "\0entry" : null,
        load: id => id === "\0entry" ? 'module.exports = require("react").useState;' : null },
      reactExternals(),
    ] });
    try {
      const result = await bundle.generate({ format: "es" });
      const code = result.output.filter(item => item.type === "chunk").map(item => item.code).join("\n");
      expect(code).toMatch(/import .* from "react"/);
      expect(code).not.toContain('__require("react")');
    } finally { await bundle.close(); }
  });
});
