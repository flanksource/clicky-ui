import { createContext, useMemo } from "react";
import type {
  CommentCallbacks,
  CommentProposalCallbacks,
} from "./comment-types";

/**
 * What proposal cards under this subtree act through. `CommentProvider` and
 * `CommentThread` supply it from their callbacks, so `CommentCard` needs no
 * extra props; with none supplied a proposal renders read-only.
 */
export const CommentProposalContext = createContext<CommentProposalCallbacks>({});

/** The proposal callbacks of `callbacks`, or null when it carries none, with a stable identity. */
export function useProposalCallbacks(
  callbacks: CommentCallbacks,
): CommentProposalCallbacks | null {
  const {
    onApplyProposal,
    onRejectProposal,
    onRequestRevision,
    loadProposalDiff,
  } = callbacks;
  return useMemo(() => {
    if (
      !onApplyProposal &&
      !onRejectProposal &&
      !onRequestRevision &&
      !loadProposalDiff
    )
      return null;
    return {
      ...(onApplyProposal ? { onApplyProposal } : {}),
      ...(onRejectProposal ? { onRejectProposal } : {}),
      ...(onRequestRevision ? { onRequestRevision } : {}),
      ...(loadProposalDiff ? { loadProposalDiff } : {}),
    };
  }, [onApplyProposal, onRejectProposal, onRequestRevision, loadProposalDiff]);
}
