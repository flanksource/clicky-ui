// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import SandboxRuntimePlayground from "./captain/sandbox-runtime";

beforeAll(() => {
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
});

describe("SandboxRuntimePlayground", () => {
  it("renders a consolidated agent runtime with a valid sandbox mode", () => {
    render(<SandboxRuntimePlayground />);

    expect(
      screen.getByRole("heading", { name: "Sandbox runtime editor" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("radiogroup", { name: "Sandbox mode" }),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("radio", { name: /^Git Agent\b/ })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      (screen.getByLabelText("Sandbox backend") as HTMLSelectElement).value,
    ).toBe("development-agents");
    expect(document.body.textContent).not.toContain("claude-code");
  });
});
