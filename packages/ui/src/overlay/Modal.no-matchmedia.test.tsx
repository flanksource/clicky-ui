import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Modal } from "./Modal";
import { ThemeProvider } from "../hooks/theme-provider";

/**
 * The environment a CONSUMER's test suite actually runs in.
 *
 * jsdom ships no window.matchMedia. This library's own src/test/setup.ts
 * installs a stub, which is precisely what hid the bug these tests pin: an
 * unguarded matchMedia call passed here and threw
 * "window.matchMedia is not a function" in every downstream test file that
 * happened to render the component — reported against the consumer's test, not
 * against this library.
 *
 * So this file takes the stub away and renders for real. Delete these and the
 * only thing standing between a new unguarded call and eight broken files in a
 * consuming repo is somebody remembering.
 */
const stub = window.matchMedia;

function withoutMatchMedia() {
  // @ts-expect-error removing a browser API jsdom does not provide either
  delete window.matchMedia;
}

afterEach(() => {
  window.matchMedia = stub;
});

describe("rendering where matchMedia does not exist", () => {
  it("opens a Modal", () => {
    withoutMatchMedia();

    expect(() =>
      render(
        <Modal open onClose={() => {}} title="Instrument method">
          <p>body</p>
        </Modal>,
      ),
    ).not.toThrow();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  // The desktop path, which is the one an environment that cannot answer should
  // take: present follows open with no deferred unmount waiting on a transition
  // that will never run.
  it("closes a Modal immediately rather than waiting on an animation", () => {
    withoutMatchMedia();

    const { rerender } = render(
      <Modal open onClose={() => {}} title="Instrument method">
        <p>body</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    rerender(
      <Modal open={false} onClose={() => {}} title="Instrument method">
        <p>body</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // ThemeProvider subscribes to the colour-scheme query on mount and
  // unsubscribes on unmount. An absent API has to survive BOTH halves: a
  // subscribe that returns nothing turns the cleanup into a crash on unmount,
  // which is a failure in a different test from the one that caused it.
  it("mounts and unmounts a ThemeProvider on the system theme", () => {
    withoutMatchMedia();

    const { unmount } = render(
      <ThemeProvider defaultTheme="system">
        <span>content</span>
      </ThemeProvider>,
    );
    expect(screen.getByText("content")).toBeInTheDocument();

    expect(() => unmount()).not.toThrow();
  });
});
