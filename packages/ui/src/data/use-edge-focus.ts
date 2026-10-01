import { useMemo, useState } from "react";
import { edgeFocusOn, focusedEdgeIds, type GraphDiagramEdge, type GraphDiagramEdgeFocus } from "./graph-diagram-model";

export interface EdgeFocusState {
  /** Every edge in focus, by selection or by hover. Empty when nothing is. */
  focused: ReadonlySet<string>;
  /** The edges the selection put in focus. Their pills stay put, so they take the pointer. */
  pinned: ReadonlySet<string>;
  /** The nodes in focus: the selected one and the hovered one. */
  nodes: ReadonlySet<string>;
}

export interface EdgeFocus {
  /** Undefined when the diagram is not focused: every edge then draws in full, with its pill. */
  state: EdgeFocusState | undefined;
  onNodeHover: ((id: string | undefined) => void) | undefined;
  onEdgeHover: ((id: string | undefined) => void) | undefined;
}

export interface UseEdgeFocusOptions {
  mode: GraphDiagramEdgeFocus;
  edges: readonly GraphDiagramEdge[];
  selectedId: string | undefined;
  selectedEdgeId: string | undefined;
}

export function useEdgeFocus({ mode, edges, selectedId, selectedEdgeId }: UseEdgeFocusOptions): EdgeFocus {
  const [hoveredNode, setHoveredNode] = useState<string>();
  const [hoveredEdge, setHoveredEdge] = useState<string>();
  const on = edgeFocusOn(mode, edges.length);
  const state = useMemo(
    () =>
      on
        ? {
            focused: focusedEdgeIds(edges, { nodes: [selectedId, hoveredNode], edges: [selectedEdgeId, hoveredEdge] }),
            pinned: focusedEdgeIds(edges, { nodes: [selectedId], edges: [selectedEdgeId] }),
            nodes: new Set([selectedId, hoveredNode].filter((id): id is string => id !== undefined)),
          }
        : undefined,
    [on, edges, selectedId, selectedEdgeId, hoveredNode, hoveredEdge],
  );
  return { state, onNodeHover: on ? setHoveredNode : undefined, onEdgeHover: on ? setHoveredEdge : undefined };
}
