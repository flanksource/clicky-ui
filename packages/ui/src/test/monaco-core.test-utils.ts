// What Monaco's Monarch language modules (monaco-editor/esm/vs/basic-languages)
// read from the editor core while they evaluate. The real core cannot load in
// jsdom (it injects stylesheets jsdom cannot parse), so tests that reach those
// modules mock "monaco-editor" with this. The numbers are Monaco's own
// IndentAction enum.
export const monacoCoreStub = {
  languages: { IndentAction: { None: 0, Indent: 1, IndentOutdent: 2, Outdent: 3 } },
};
