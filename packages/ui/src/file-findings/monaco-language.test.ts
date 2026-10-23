import { describe, expect, it } from "vitest";
import { findingsLanguageForPath, monacoLanguageForPath } from "./monaco-language";

describe("findingsLanguageForPath", () => {
  // Highlight-only ids: Monaco's own typescript/javascript/json/css/html modes
  // start language-service workers that hosts do not provide.
  it.each([
    ["web/src/App.tsx", "findings-typescript"],
    ["web/src/util.mts", "findings-typescript"],
    ["web/src/util.mjs", "findings-javascript"],
    ["web/src/App.jsx", "findings-javascript"],
    ["package.json", "findings-json"],
    ["tsconfig.jsonc", "findings-json"],
    ["web/src/app.css", "findings-css"],
    ["web/src/app.scss", "findings-scss"],
    ["web/src/app.less", "findings-less"],
    ["web/index.html", "findings-html"],
  ])("maps %s to the highlight-only %s", (path, language) => {
    expect(findingsLanguageForPath(path)).toBe(language);
  });

  it.each([
    ["pkg/server/handler.go", "go"],
    ["config/.gavel.yaml", "yaml"],
    ["docs/README.md", "markdown"],
    ["scripts/run.sh", "shell"],
    ["tools/lint.py", "python"],
    ["LICENSE", "plaintext"],
  ])("leaves the Monarch-only %s as %s", (path, language) => {
    expect(findingsLanguageForPath(path)).toBe(language);
  });
});

describe("monacoLanguageForPath", () => {
  it.each([
    ["pkg/server/handler.go", "go"],
    ["web/src/App.tsx", "typescript"],
    ["web/src/util.mjs", "javascript"],
    ["config/.gavel.yaml", "yaml"],
    ["docs/README.MD", "markdown"],
    ["scripts/run.sh", "shell"],
  ])("maps %s to %s", (path, language) => {
    expect(monacoLanguageForPath(path)).toBe(language);
  });

  it.each(["LICENSE", "notes.unknownext", ".gitignore"])("uses plaintext for %s", (path) => {
    expect(monacoLanguageForPath(path)).toBe("plaintext");
  });
});
