import { useCallback, useEffect, useRef, useState } from "react";
import type { EditableRoot } from "./editable-dom";

export function useEditableSelection({ page, enabled }: { page: string | undefined; enabled: boolean }) {
  const [selected, setSelected] = useState<{ node: EditableRoot; key: number } | null>(null);
  const [facetPending, setFacetPending] = useState(false);
  const [svgPending, setSvgPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const nextKey = useRef(0);
  const pending = facetPending || svgPending;
  useEffect(() => {
    setSelected(null);
    setFacetPending(false);
    setSvgPending(false);
    setNotice(null);
  }, [page]);
  useEffect(() => { if (!enabled && !pending) setSelected(null); }, [enabled, pending]);

  const select = useCallback((node: EditableRoot | null) => {
    if (!enabled) {
      setNotice("Visual editing requires a live preview with clean source and the source editor closed");
      return;
    }
    if (node?.element === selected?.node.element) return;
    if (pending) {
      setNotice("Save or revert the current visual edit before selecting another element");
      return;
    }
    setNotice(null);
    setSelected(node ? { node, key: ++nextKey.current } : null);
  }, [enabled, selected, pending]);
  const close = useCallback(() => { setSelected(null); setNotice(null); }, []);
  const beginCssEdit = useCallback(() => {
    if (pending) {
      setNotice("Save or revert the current visual edit before selecting another element");
      return false;
    }
    close();
    return true;
  }, [pending, close]);
  return { selected, pending, notice, select, close, beginCssEdit, onFacetPendingChange: setFacetPending, onSvgPendingChange: setSvgPending };
}
