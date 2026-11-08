import { parseSync } from "rolldown/utils";
import { describe, expect, it } from "vitest";
import { buildBarrelIndex, shapeOf, sideEffectsRule } from "./barrels.ts";
import type { BarrelIndex } from "../schema.ts";

const UI = "ui@1.0.0";
const OTHER = "other@2.0.0";
const LOUD = "loud@1.0.0";

const MODULES: Record<string, string> = {
  [`${UI}/index.js`]: [
    'import { cn, helper as aid } from "./utils.js";',
    'import Table from "./table.js";',
    'import { default as Card } from "./card.js";',
    "export { cn, Table as DataTable, Card as InfoCard, aid as assist };",
    'export * from "./icons.js";',
    'export { Badge } from "./badge/index.js";',
    'export * as charts from "./charts.js";',
    'export const VERSION = "1";',
  ].join("\n"),
  [`${UI}/utils.js`]: "export function cn() {}\nexport function helper() {}",
  [`${UI}/table.js`]: "export default function Table() {}",
  [`${UI}/card.js`]: "export default function Card() {}",
  [`${UI}/icons.js`]: 'export * from "./icons/a.js";\nexport * from "./icons/b.js";',
  [`${UI}/icons/a.js`]: "export const IconA = 1;\nexport const Shared = 1;",
  [`${UI}/icons/b.js`]: "export const IconB = 1;\nexport const Shared = 2;",
  [`${UI}/badge/index.js`]: 'import "./badge.css";\nexport { Badge } from "./badge.js";',
  [`${UI}/badge/badge.js`]: "export const Badge = 1;",
  [`${UI}/charts.js`]: "export const Bar = 1;",
  [`${OTHER}/index.js`]: 'export { cn } from "ui";',
  [`${LOUD}/index.js`]: 'export { Thing } from "./thing.js";',
  [`${LOUD}/thing.js`]: "export const Thing = 1;",
};

function expand(index: BarrelIndex): Record<string, Record<string, string>> {
  return Object.fromEntries(
    Object.entries(index.barrels).map(([barrel, entries]) => [
      barrel,
      Object.fromEntries(
        Object.entries(entries).map(([name, entry]) => {
          const [position, imported] = typeof entry === "number" ? [entry, name] : entry;
          return [name, `${index.modules[position]}#${imported}`];
        }),
      ),
    ]),
  );
}

describe("buildBarrelIndex", () => {
  it("places each forwarded name in its defining module, stopping where skipping a module is unsafe", () => {
    const built = buildBarrelIndex({
      urls: Object.keys(MODULES),
      shape: (url) => {
        const code = MODULES[url];
        return code === undefined ? null : shapeOf(parseSync(url, code, { lang: "js", sourceType: "module" }).module);
      },
      resolve: (url, specifier) => {
        if (specifier === "ui") return `${UI}/index.js`;
        const resolved = new URL(specifier, `https://modules.invalid/${url}`).pathname.slice(1);
        return MODULES[resolved] === undefined ? null : resolved;
      },
      sideEffectFree: (url) => !url.startsWith(`${LOUD}/`),
    });
    expect({ barrels: expand(built.index), kept: built.kept, blocked: built.blocked, names: built.names }).toEqual({
      barrels: {
        [`${UI}/index.js`]: {
          cn: `${UI}/utils.js#cn`,
          DataTable: `${UI}/table.js#default`,
          InfoCard: `${UI}/card.js#default`,
          assist: `${UI}/utils.js#helper`,
          IconA: `${UI}/icons/a.js#IconA`,
          IconB: `${UI}/icons/b.js#IconB`,
          // Ambiguous through two stars: it stays where the browser would report the ambiguity.
          Shared: `${UI}/icons.js#Shared`,
          // badge/index.js imports CSS for its side effects, so it cannot be skipped.
          Badge: `${UI}/badge/index.js#Badge`,
        },
        [`${UI}/icons.js`]: { IconA: `${UI}/icons/a.js#IconA`, IconB: `${UI}/icons/b.js#IconB` },
        [`${OTHER}/index.js`]: { cn: `${UI}/utils.js#cn` },
      },
      kept: [{ url: `${UI}/badge/index.js`, reason: "imports ./badge.css for its side effects" }],
      blocked: [`${LOUD}/index.js`],
      names: 11,
    });
  });
});

describe("sideEffectsRule", () => {
  const ID = "ui@1.0.0";

  it.each([
    [false, "dist/index.js", true],
    [undefined, "dist/index.js", false],
    [true, "dist/index.js", false],
    [["**/*.css", "./src/styles/**"], "dist/data/DataTable.js", true],
    [["**/*.css"], "dist/styles.css", false],
    [["*.css"], "dist/nested/theme.css", false],
    [["./src/styles/**"], "src/styles/tokens.ts", false],
    [["dist/{polyfill,register}.js"], "dist/register.js", false],
  ])("sideEffects %j makes %s skippable: %s", (declaration, path, skippable) => {
    expect(sideEffectsRule(declaration, ID)(path)).toBe(skippable);
  });

  it("rejects a declaration that is neither a boolean nor a list of globs", () => {
    expect(() => sideEffectsRule("false", ID)).toThrow(/neither a boolean nor a list of globs/);
  });
});
