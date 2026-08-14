/**
 * Monaco language support for the expression languages gomplate evaluates.
 *
 * Everything under `./lang` is vendored from gomplate by
 * `scripts/vendor-lang.ts` — the tokenizers are generated from cel-go's ANTLR
 * grammar and gomplate's live registries, which only a Go toolchain can read.
 * This entry is the published surface over that.
 */
export * from "./lang/index.ts";
