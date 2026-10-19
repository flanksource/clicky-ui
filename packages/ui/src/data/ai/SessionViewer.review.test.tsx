import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionViewer } from "./SessionViewer";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

const prompt =
  "Think carefully before implementing.\n\n## Address feedback on PR #104\n\nResolve three lint violations.";
const promptMessage = {
  id: "prompt",
  role: "user",
  parts: [{ type: "text", text: prompt }],
};

describe("SessionViewer review presentation", () => {
  it("keeps the initial prompt readable as a summary until its full text is requested", () => {
    const session: UnifiedSessionInput = {
      id: "review",
      messages: [
        promptMessage,
        {
          id: "follow-up",
          role: "user",
          parts: [{ type: "text", text: "Run the focused checks." }],
        },
      ],
    };
    render(
      <SessionViewer
        session={session}
        initialPromptSummary="Address PR #104 feedback · three lint violations"
        showHeader={false}
        showMenu={false}
      />,
    );

    const toggle = screen.getByRole("button", {
      name: /Initial prompt.*Address PR #104 feedback/,
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByText("Think carefully before implementing."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Run the focused checks.")).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/Think carefully before implementing\./),
    ).toBeInTheDocument();
  });

  it("jumps to an unmounted initial prompt and resumes at the latest event from its toolbar", async () => {
    const session: UnifiedSessionInput = {
      id: "long-review",
      messages: [
        promptMessage,
        ...Array.from({ length: 20 }, (_, index) => ({
          id: `activity-${index}`,
          role: "assistant",
          parts: [{ type: "text", text: `Activity ${index + 1}` }],
        })),
      ],
    };
    const { container } = render(
      <SessionViewer
        session={session}
        initialPromptSummary="Address PR #104 feedback"
        scrollControls="toolbar"
        scrollable
        windowSize={5}
        showHeader={false}
        showMenu={false}
      />,
    );
    const scroller = container.querySelector(
      "div.overflow-y-auto",
    ) as HTMLElement;
    Object.defineProperty(scroller, "scrollHeight", {
      configurable: true,
      value: 900,
    });

    expect(
      screen.queryByRole("button", { name: /Initial prompt.*Address PR #104/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Initial prompt" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Initial prompt.*Address PR #104/ }),
      ).toBeInTheDocument(),
    );
    expect(scroller.scrollTop).toBe(0);
    expect(
      screen.queryByRole("button", { name: "Scroll to bottom" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Latest" }));
    expect(scroller.scrollTop).toBe(900);
  });

  it("jumps to the initial prompt when the full transcript is already mounted", () => {
    const session: UnifiedSessionInput = {
      id: "short-review",
      messages: [
        promptMessage,
        ...Array.from({ length: 4 }, (_, index) => ({
          id: `result-${index}`,
          role: "assistant",
          parts: [{ type: "text", text: `Done ${index + 1}.` }],
        })),
      ],
    };
    const { container } = render(
      <SessionViewer
        session={session}
        scrollControls="toolbar"
        scrollable
        windowSize={5}
        showHeader={false}
        showMenu={false}
      />,
    );
    const scroller = container.querySelector(
      "div.overflow-y-auto",
    ) as HTMLElement;
    scroller.scrollTop = 500;

    fireEvent.click(screen.getByRole("button", { name: "Initial prompt" }));

    expect(scroller.scrollTop).toBe(0);
  });
});
