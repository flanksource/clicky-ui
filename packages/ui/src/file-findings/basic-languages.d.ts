// monaco-editor ships its Monarch language definitions as untyped ES modules.
declare module "monaco-editor/esm/vs/basic-languages/*" {
  import type { languages } from "monaco-editor";
  export const conf: languages.LanguageConfiguration;
  export const language: languages.IMonarchLanguage;
}
