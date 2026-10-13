import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionInspector } from "./SessionInspector";
import { INSPECTOR_SESSION, SAMPLE_SESSION } from "./SessionViewer.fixtures";
import {
  jsonResponse,
  remoteSession,
  renderWithFakeStream,
  resetFakeEventSources,
  stubSessionFetch,
} from "../../test/fake-session-stream.test-utils";

const COMPOSER_TEXT = "Continue session";
const SRC = "/api/captain/sessions/remote";
// The first read asks for the tail; see SessionInspector.remote.
const TAIL = `${SRC}?tail=100`;

const SCROLL_CLASS = /(^|\s)overflow-(y-)?(auto|scroll)(\s|$)/;

function scrollAncestor(node: HTMLElement): HTMLElement | null {
  for (let el = node.parentElement; el; el = el.parentElement) {
    if (SCROLL_CLASS.test(el.className)) return el;
  }
  return null;
}

/** The pinned slot: a shrink-0 bar that is a direct child of the clipped
 *  inspector root, so no scroll container wraps it and the page never scrolls. */
function expectPinned(composer: HTMLElement) {
  const slot = composer.parentElement as HTMLElement;
  expect(slot).toHaveClass("shrink-0", "border-t");
  expect(slot.className).toContain("env(safe-area-inset-bottom)");
  expect(scrollAncestor(composer)).toBeNull();
  const root = slot.parentElement as HTMLElement;
  expect(root).toHaveClass("flex", "flex-col", "overflow-hidden", "h-full");
  expect(slot).toBe(root.lastElementChild);
  return root;
}

function composerNode() {
  return <div>{COMPOSER_TEXT}</div>;
}

beforeEach(resetFakeEventSources);
afterEach(() => vi.unstubAllGlobals());

describe("SessionInspector composer slot with an in-memory session", () => {
  it.each([
    { layout: "compact" as const, session: INSPECTOR_SESSION },
    { layout: "default" as const, session: INSPECTOR_SESSION },
  ])(
    "pins the $layout composer below a transcript region that is its sibling, not its ancestor",
    ({ layout, session }) => {
      render(
        <div className="h-[720px]">
          <SessionInspector
            session={session}
            layout={layout}
            composer={composerNode()}
          />
        </div>,
      );
      const root = expectPinned(screen.getByText(COMPOSER_TEXT));

      const body = root.querySelector("main") as HTMLElement;
      expect(body).toHaveClass("min-h-0", "flex-1", "overflow-hidden");
      expect(body.contains(screen.getByText(COMPOSER_TEXT))).toBe(false);
    },
  );

  it("pins the composer under a legacy transcript in both layouts", () => {
    for (const layout of ["compact", "default"] as const) {
      const { unmount } = render(
        <div className="h-[720px]">
          <SessionInspector
            session={SAMPLE_SESSION}
            layout={layout}
            composer={composerNode()}
          />
        </div>,
      );
      expectPinned(screen.getByText(COMPOSER_TEXT));
      unmount();
    }
  });
});

describe("SessionInspector composer slot with a session URL", () => {
  it.each(["compact", "default"] as const)(
    "renders the %s composer, pinned, while the session is still loading",
    (layout) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => new Promise<Response>(() => {})),
      );
      renderWithFakeStream(
        <div className="h-[720px]">
          <SessionInspector
            src={SRC}
            layout={layout}
            composer={composerNode()}
          />
        </div>,
      );

      const root = expectPinned(screen.getByText(COMPOSER_TEXT));
      expect(root).toHaveAttribute("aria-busy", "true");
      expect(screen.getByText("Loading session…")).toBeInTheDocument();
    },
  );

  it.each(["compact", "default"] as const)(
    "keeps the %s composer pinned beside the load error instead of dropping it",
    async (layout) => {
      stubSessionFetch({
        [TAIL]: [() => jsonResponse({ error: "session remote not found" }, 404)],
      });
      renderWithFakeStream(
        <div className="h-[720px]">
          <SessionInspector
            src={SRC}
            layout={layout}
            composer={composerNode()}
          />
        </div>,
      );

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("session remote not found");
      const root = expectPinned(screen.getByText(COMPOSER_TEXT));
      expect(root.contains(alert)).toBe(true);
      expect(alert.parentElement?.contains(screen.getByText(COMPOSER_TEXT))).toBe(false);
    },
  );

  it("hands the same single composer over to the loaded inspector", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession())] });
    renderWithFakeStream(
      <div className="h-[720px]">
        <SessionInspector
          src={SRC}
          layout="compact"
          composer={composerNode()}
        />
      </div>,
    );

    await waitFor(() =>
      expect(screen.queryByText("Loading session…")).not.toBeInTheDocument(),
    );
    expect(screen.getAllByText(COMPOSER_TEXT)).toHaveLength(1);
    expectPinned(screen.getByText(COMPOSER_TEXT));
  });
});
