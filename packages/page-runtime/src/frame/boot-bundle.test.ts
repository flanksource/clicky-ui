import { fileURLToPath } from "node:url";
import { build } from "rolldown";
import { init, parse } from "es-module-lexer";
import { expect, it } from "vitest";
import { EXPORT_COMPILER_URL } from "../sw/runtime-module.ts";

it("boots without loading page dependencies before the frame has an import map", async () => {
  const output = await build({
    input: fileURLToPath(new URL("./entry.ts", import.meta.url)), platform: "browser", tsconfig: false,
    external: ["./page-agent.js", EXPORT_COMPILER_URL, "react", "react-dom", "react-dom/client"],
    transform: { jsx: { runtime: "automatic" }, define: { "process.env.NODE_ENV": JSON.stringify("development") } },
    output: { format: "es", codeSplitting: false }, write: false,
  });
  expect(output.output.map((file) => file.type)).toEqual(["chunk"]);
  const chunk = output.output[0];
  if (chunk?.type !== "chunk") throw new Error("boot did not emit a module");
  await init();
  const [imports] = parse(chunk.code);
  expect(imports.filter((item) => item.type === "static")).toEqual([]);
  expect(imports.map((item) => item.specifier)).toEqual(expect.arrayContaining(["react", "react-dom/client", "react-dom"]));
  const agent = imports.find(item => item.type === "dynamic" && chunk.code.slice(item.start, item.end).includes("PAGE_AGENT_URL"));
  expect(agent).toBeDefined();
  expect(chunk.code).toContain('"/__runtime/page-agent.js"');
});
