import { fileURLToPath } from "node:url";
import { build } from "rolldown";
import { init, parse } from "es-module-lexer";
import { expect, it } from "vitest";

it("boots without loading page dependencies before the frame has an import map", async () => {
  const output = await build({
    input: fileURLToPath(new URL("./entry.ts", import.meta.url)), platform: "browser", tsconfig: false,
    external: ["./page-agent.js", "react", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "@flanksource/clicky-ui/comments"],
    transform: { jsx: { runtime: "automatic" }, define: { "process.env.NODE_ENV": JSON.stringify("development") } },
    output: { format: "es", codeSplitting: false }, write: false,
  });
  expect(output.output.map((file) => file.type)).toEqual(["chunk"]);
  const chunk = output.output[0];
  if (chunk?.type !== "chunk") throw new Error("boot did not emit a module");
  await init();
  const [imports] = parse(chunk.code);
  expect(imports.filter((item) => item.type === "static")).toEqual([]);
  expect(imports.map((item) => item.specifier)).toEqual(expect.arrayContaining(["react", "react-dom/client", "./page-agent.js"]));
});
