import type { languages } from "monaco-editor";
import { conf as cssConf, language as cssLanguage } from "monaco-editor/esm/vs/basic-languages/css/css.js";
import { conf as htmlConf, language as htmlLanguage } from "monaco-editor/esm/vs/basic-languages/html/html.js";
import { conf as javascriptConf, language as javascriptLanguage } from "monaco-editor/esm/vs/basic-languages/javascript/javascript.js";
import { conf as lessConf, language as lessLanguage } from "monaco-editor/esm/vs/basic-languages/less/less.js";
import { conf as scssConf, language as scssLanguage } from "monaco-editor/esm/vs/basic-languages/scss/scss.js";
import { conf as typescriptConf, language as typescriptLanguage } from "monaco-editor/esm/vs/basic-languages/typescript/typescript.js";
import type { FindingsLanguageId } from "./monaco-language";

/** The slice of Monaco's `languages` namespace registration needs. */
export type FindingsLanguages = Pick<
  typeof languages,
  "getLanguages" | "register" | "setLanguageConfiguration" | "setMonarchTokensProvider"
>;

type Monarch = { conf: languages.LanguageConfiguration; language: languages.IMonarchLanguage };

const javascript: Monarch = { conf: javascriptConf, language: javascriptLanguage };

// Registration order is the order here. JSON has no basic-language of its own;
// the JavaScript tokenizer highlights it (strings, numbers, true/false/null).
const MONARCH: Record<FindingsLanguageId, Monarch> = {
  "findings-typescript": { conf: typescriptConf, language: typescriptLanguage },
  "findings-javascript": javascript,
  "findings-json": javascript,
  "findings-css": { conf: cssConf, language: cssLanguage },
  "findings-scss": { conf: scssConf, language: scssLanguage },
  "findings-less": { conf: lessConf, language: lessLanguage },
  "findings-html": { conf: htmlConf, language: htmlLanguage },
};

/**
 * Registers the highlight-only languages `findingsLanguageForPath` returns, on
 * `monaco.languages`. Idempotent: an id that is already registered is left as
 * it is, so it is safe from every editor mount. Nothing global is touched; in
 * particular not `typescriptDefaults`/`jsonDefaults`, which other editors use.
 */
export function registerFindingsLanguages(monacoLanguages: FindingsLanguages): void {
  const registered = new Set(monacoLanguages.getLanguages().map((language) => language.id));
  for (const [id, { conf, language }] of Object.entries(MONARCH)) {
    if (registered.has(id)) continue;
    monacoLanguages.register({ id });
    monacoLanguages.setMonarchTokensProvider(id, language);
    monacoLanguages.setLanguageConfiguration(id, conf);
  }
}
