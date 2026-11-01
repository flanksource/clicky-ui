import { useEffect, useState } from "react";

/** Keep hidden findings expanded, but discard state for findings removed from the run. */
export function useProblemExpansion(keys: readonly string[]) {
  const [expanded, setExpanded] = useState<string[]>([]);
  useEffect(() => {
    setExpanded((current) => {
      const next = current.filter((id) => keys.includes(id));
      return next.length === current.length ? current : next;
    });
  }, [keys]);
  return [expanded, setExpanded] as const;
}
