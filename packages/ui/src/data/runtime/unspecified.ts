// One vocabulary for "the user did not pick this" across every runtime
// control (model, effort, permission mode): the field is omitted from the
// request entirely and a lower layer (prompt default, `.gavel.yaml`,
// inherited profile, …) decides. Never spell this as the id `"default"` —
// that id is a real permission mode.
export const UNSPECIFIED_ID = "" as const;
// The visible text is a dash so an untouched control reads as blank, not as a
// value. Summaries and tooltips, where a bare dash means nothing, use the name.
export const UNSPECIFIED_LABEL = "-";
export const UNSPECIFIED_NAME = "Unspecified";
export const UNSPECIFIED_HINT = "not sent — configuration decides";

/** The hint text for an Unspecified choice, naming what it inherits when known. */
export function unspecifiedHint(inherited?: string | undefined): string {
  const trimmed = inherited?.trim();
  return trimmed ? `not sent — inherits ${trimmed}` : UNSPECIFIED_HINT;
}
