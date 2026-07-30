/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";

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

  it("mounts the demo with a React root", async () => {
    await import("./main");

    expect(reactRoot.create).toHaveBeenCalledWith(
      document.getElementById("app"),
    );
    expect(reactRoot.render).toHaveBeenCalledOnce();
  });
});
