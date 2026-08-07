/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";

const reactRoot = vi.hoisted(() => ({
  create: vi.fn(),
  render: vi.fn(),
}));

vi.mock("react-dom/client", () => ({
  createRoot: reactRoot.create,
}));

vi.mock("./App", () => ({
  App: () => null,
}));

// This asserts main.tsx's mount wiring, nothing about the library itself.
// Importing the real barrel would pull every module in packages/ui/src through
// the Vite transform (seconds of work, and it tripped the 5s test timeout in
// CI), so stand in a named ErrorWrapper: main.tsx still has to import that
// exact export for the assertions below to hold.
vi.mock("@flanksource/clicky-ui", () => ({
  ErrorWrapper: function ErrorWrapper() {
    return null;
  },
}));

vi.mock("@flanksource/clicky-ui/styles.css", () => ({}));

describe("kitchen sink runtime", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    reactRoot.create.mockReturnValue({ render: reactRoot.render });
  });

  it("mounts the demo inside the full-page error wrapper", async () => {
    await import("./main");

    expect(reactRoot.create).toHaveBeenCalledWith(
      document.getElementById("app"),
    );
    expect(reactRoot.render).toHaveBeenCalledOnce();
    const mounted = reactRoot.render.mock.calls[0]?.[0] as ReactElement;
    expect(mounted.type).toHaveProperty("name", "ErrorWrapper");
    expect(
      (mounted.props as { children: ReactElement }).children.type,
    ).toHaveProperty("name", "App");
  });
});
