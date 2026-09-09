import type { ReactNode } from "react";
import type { KeyValueListItem } from "../KeyValueList";

/** Value builders for the SessionInspector detail panels.
 *
 *  They live apart from the panel components in SessionInspector.panel-parts
 *  because they are not components: a module that mixes the two loses fast
 *  refresh for everything in it, so the components keep their own file and
 *  these keep this one. */

/** Renders a value the panel has nothing to show for. */
export function muted(value: ReactNode) {
  return <span className="text-muted-foreground">{value}</span>;
}

/** One key/value row, hidden and dashed out when the value is absent. */
export function kv(
  label: ReactNode,
  value: ReactNode | undefined | null
): KeyValueListItem {
  const absent = value === undefined || value === null || value === "";
  return {
    key: String(label),
    label,
    value: absent ? muted("-") : value,
    hidden: absent,
  };
}
