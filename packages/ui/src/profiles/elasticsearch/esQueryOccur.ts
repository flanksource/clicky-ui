/**
 * One leaf condition: which field, which operator, and the operand that
 * operator takes. Which operators a field may use and which advanced qualifiers
 * an operator emits both come from the schema vocabulary, so this file owns the
 * editing surface and never the vocabulary itself.
 */


export function occurOptions(occurs: string[]) {
  return occurs.map((occur) => ({
    value: occur,
    label: occurLabels[occur] ?? occur
  }));
}

// How each bool clause reads to an author. filter and must both narrow, but
// only must scores, which is the distinction the raw names hide.
const occurLabels: Record<string, string> = {
  filter: "AND",
  must: "AND (scored)",
  should: "OR",
  must_not: "NOT"
};
