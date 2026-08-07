// The value shape and cycle behind `TriStateToggle`, kept out of the component
// module so importing the cycle helper (or the type) does not pull a component
// in — `react/only-export-components` also forbids shipping both from one file.

/** A yes/no value that can also be unset — the shape of a nullable boolean. */
export type TriState = boolean | undefined;

/** Next state in the cycle: unset → on → off → unset. */
export function nextTriState(value: TriState): TriState {
  if (value === undefined) return true;
  return value ? false : undefined;
}
