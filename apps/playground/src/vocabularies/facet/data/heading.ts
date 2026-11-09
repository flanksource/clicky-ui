const item = (id: string, description: string) => ({
  catalog: "facet",
  type: "heading",
  id: `heading/${id}`,
  label: `heading/${id}`,
  description,
  references: ["apps/playground/src/vocabularies/facet/specimens/vocabulary/headings.tsx#HeadingStyles"],
  section: "heading-styles",
});

export default [
  item("underline", "Group a column or section with an uppercase title over a full-width rule instead of a container"),
  item("column-heads", "One underlined title per column on a shared baseline; members sit below unboxed or as plain boxes"),
  item("spanning", "A title whose underline spans several columns, with smaller sub-heads under it"),
  item("accent", "A title with a short accent bar beneath it, for the one emphasised group"),
  item("numbered", "A numbered title over a rule, for groups that read in order"),
  item("eyebrow", "A small mono label over a hairline, for secondary groups"),
  item("divider", "A title set into a horizontal rule, separating stacked bands"),
  item("row-heads", "Titles in a left gutter with rules between rows: lanes without lane fills"),
];
