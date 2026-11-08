declare module "sucrase/dist/parser" {
  export * from "sucrase/dist/types/parser/index";
}

declare module "sucrase/dist/parser/tokenizer/types" {
  export * from "sucrase/dist/types/parser/tokenizer/types";
}

declare module "@flanksource/facet/remark/facet-redact" {
  const facetRedact: (options: { allow: Record<string, unknown> }) => unknown;
  export default facetRedact;
}
