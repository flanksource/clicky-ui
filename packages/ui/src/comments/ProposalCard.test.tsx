import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProposalCard } from "./ProposalCard";
import { ME, sampleProposal, sampleProposalDiff } from "./comment-fixtures";
import type {
  CommentProposal,
  CommentProposalCallbacks,
} from "./comment-types";

// Stub the async highlighter so CodeDiff renders plain text deterministically.
vi.mock("../data/code-highlight", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/code-highlight")>()),
  highlightToLines: vi.fn(async () => null),
}));

const COMMENT_ID = "c1r3";

function callbacks(): Required<CommentProposalCallbacks> {
  return {
    onApplyProposal: vi.fn(async () => {}),
    onRejectProposal: vi.fn(async () => {}),
    onRequestRevision: vi.fn(async () => {}),
    loadProposalDiff: vi.fn(async () => sampleProposalDiff),
  };
}

function renderCard(
  cbs: CommentProposalCallbacks | undefined,
  proposal: CommentProposal = sampleProposal,
) {
  return render(
    <ProposalCard
      commentId={COMMENT_ID}
      proposal={proposal}
      {...(cbs ? { callbacks: cbs } : {})}
    />,
  );
}

describe("ProposalCard", () => {
  it("lists each changed file with its line counts and the state chip", () => {
    renderCard(callbacks());
    expect(screen.getByText("src/rollup/currency.ts")).toBeInTheDocument();
    expect(screen.getByText("src/rollup/currency.test.ts")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "12 additions, 3 deletions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "2 changed files, 32 additions, 3 deletions",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Proposed")).toBeInTheDocument();
  });

  it("loads the diff once, on first expand, and shows it", async () => {
    const cbs = callbacks();
    renderCard(cbs);
    expect(cbs.loadProposalDiff).not.toHaveBeenCalled();

    const toggle = screen.getByRole("button", { name: /show diff/i });
    fireEvent.click(toggle);
    expect(await screen.findByText(/Math\.round/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /hide diff/i }));
    fireEvent.click(screen.getByRole("button", { name: /show diff/i }));

    expect(cbs.loadProposalDiff).toHaveBeenCalledTimes(1);
    expect(cbs.loadProposalDiff).toHaveBeenCalledWith(COMMENT_ID);
  });

  it("shows a loading state, then the load error", async () => {
    const cbs = callbacks();
    cbs.loadProposalDiff = vi.fn(async () => {
      throw new Error("ref is gone");
    });
    renderCard(cbs);
    fireEvent.click(screen.getByRole("button", { name: /show diff/i }));
    expect(screen.getByText("Loading diff...")).toBeInTheDocument();
    expect(await screen.findByText("ref is gone")).toBeInTheDocument();
  });

  it("offers no diff toggle without a diff loader", () => {
    const { loadProposalDiff: _, ...rest } = callbacks();
    renderCard(rest);
    expect(
      screen.queryByRole("button", { name: /show diff/i }),
    ).not.toBeInTheDocument();
  });

  it("applies to the working tree from the primary button", async () => {
    const cbs = callbacks();
    renderCard(cbs);
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() =>
      expect(cbs.onApplyProposal).toHaveBeenCalledWith(COMMENT_ID, "apply"),
    );
  });

  it("stages from the split button menu", async () => {
    const cbs = callbacks();
    renderCard(cbs);
    fireEvent.click(screen.getByRole("button", { name: "More ways to apply" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Stage" }));
    await waitFor(() =>
      expect(cbs.onApplyProposal).toHaveBeenCalledWith(COMMENT_ID, "stage"),
    );
    expect(cbs.onApplyProposal).toHaveBeenCalledTimes(1);
  });

  it("rejects with an optional reason", async () => {
    const cbs = callbacks();
    renderCard(cbs);
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    fireEvent.change(screen.getByLabelText("Reason (optional)"), {
      target: { value: "touches the wrong module" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reject proposal" }));
    await waitFor(() =>
      expect(cbs.onRejectProposal).toHaveBeenCalledWith(
        COMMENT_ID,
        "touches the wrong module",
      ),
    );
  });

  it("rejects without a reason when none is typed", async () => {
    const cbs = callbacks();
    renderCard(cbs);
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    fireEvent.click(screen.getByRole("button", { name: "Reject proposal" }));
    await waitFor(() =>
      expect(cbs.onRejectProposal).toHaveBeenCalledWith(COMMENT_ID, undefined),
    );
  });

  it("requires feedback text to ask for revisions and passes it trimmed", async () => {
    const cbs = callbacks();
    renderCard(cbs);
    fireEvent.click(screen.getByRole("button", { name: "Ask for revisions" }));
    const send = screen.getByRole("button", { name: "Send feedback" });
    expect(send).toBeDisabled();

    const feedback = screen.getByLabelText("Revision feedback");
    fireEvent.change(feedback, { target: { value: "   " } });
    expect(send).toBeDisabled();

    fireEvent.change(feedback, { target: { value: "  also cover negatives " } });
    expect(send).toBeEnabled();
    fireEvent.click(send);
    await waitFor(() =>
      expect(cbs.onRequestRevision).toHaveBeenCalledWith(
        COMMENT_ID,
        "also cover negatives",
      ),
    );
  });

  it("disables every action while one is in flight", async () => {
    const cbs = callbacks();
    let finish: () => void = () => {};
    cbs.onApplyProposal = vi.fn(
      () => new Promise<void>((resolve) => (finish = resolve)),
    );
    renderCard(cbs);
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled(),
    );
    expect(screen.getByRole("button", { name: "Ask for revisions" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "More ways to apply" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(cbs.onRejectProposal).not.toHaveBeenCalled();

    finish();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Reject" })).toBeEnabled(),
    );
  });

  it("shows a failed action and re-enables the buttons", async () => {
    const cbs = callbacks();
    cbs.onApplyProposal = vi.fn(async () => {
      throw new Error("working tree has conflicting changes");
    });
    renderCard(cbs);
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Couldn't apply proposal");
    expect(alert).toHaveTextContent("working tree has conflicting changes");
    expect(screen.getByRole("button", { name: "Apply" })).toBeEnabled();
  });

  it("offers no actions when the host supplies no decision callbacks", () => {
    const { loadProposalDiff } = callbacks();
    renderCard({ loadProposalDiff });
    for (const name of ["Apply", "Reject", "Ask for revisions"])
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
  });

  it.each([
    { state: "applied", label: "Applied", feedback: undefined },
    { state: "staged", label: "Staged", feedback: undefined },
    { state: "rejected", label: "Rejected", feedback: "wrong module" },
    {
      state: "revision_requested",
      label: "Revision requested",
      feedback: "cover negatives",
    },
    { state: "superseded", label: "Superseded", feedback: undefined },
  ] as const)(
    "renders a $state proposal read-only",
    ({ state, label, feedback }) => {
      renderCard(callbacks(), {
        ...sampleProposal,
        state,
        decidedBy: ME,
        decidedAt: "2026-06-20T10:00:00.000Z",
        ...(feedback ? { feedback } : {}),
      });
      expect(screen.getByText(label)).toBeInTheDocument();
      for (const name of ["Apply", "Reject", "Ask for revisions", "More ways to apply"])
        expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
      if (feedback) expect(screen.getByText(feedback)).toBeInTheDocument();
      if (state !== "superseded")
        expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument();
    },
  );
});
