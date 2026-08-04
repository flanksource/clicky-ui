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
