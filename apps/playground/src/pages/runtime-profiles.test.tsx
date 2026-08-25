// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import RuntimeProfilesPlayground from "./runtime-profiles";

const RESOLUTION = {
  resolved: {
    spec: { model: "openai/gpt-5.6-terra", backend: "codex-agent" },
    constraints: {},
    trace: [],
  },
  tools: [],
  permissions: {},
  effectivePolicy: [],
};

const RUNTIMES = [
  {
    family: "codex",
    provider: "openai",
    catalogPrefix: "codex-agent",
    modes: [
      {
        mode: "agent",
        backend: "codex-agent",
        permissions: {
          modes: {
            default: { kind: "approximated" },
            plan: { kind: "native" },
          },
          toolPolicies: {},
          resources: {},
        },
      },
    ],
  },
];

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

describe("RuntimeProfilesPlayground", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("edits an ordered preset selection inside the profile spec editor", async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) =>
      Promise.resolve({
        ok: true,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () =>
          Promise.resolve(
            String(input).endsWith("/runtimes") ? RUNTIMES : RESOLUTION,
          ),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("crypto", { randomUUID: () => "new-record" });

    render(<RuntimeProfilesPlayground />);

    await waitFor(() => expect(screen.queryByText("Resolved")).not.toBeNull());
    expect(screen.queryByRole("button", { name: "Preset layers" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Run spec" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Prompt" })).not.toBeNull();
    expect(screen.queryByRole("region", { name: "Workspace" })).not.toBeNull();
    expect(screen.queryByRole("region", { name: "Verify" })).not.toBeNull();
    expect(screen.queryByRole("region", { name: "Commit" })).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Profile presets" }),
    ).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Profile presets" }));
    expect(
      screen.getByRole("menuitemcheckbox", { name: "Plan mode" }),
    ).toHaveProperty("checked", true);
    fireEvent.click(screen.getByRole("button", { name: "Profile presets" }));

    const presetOrder = screen.getByRole("list", { name: "Preset order" });
    expect(
      Array.from(
        presetOrder.querySelectorAll("li"),
        (item) => item.textContent,
      ),
    ).toEqual([
      expect.stringContaining("Organization defaults"),
      expect.stringContaining("Repository context"),
      expect.stringContaining("Autonomous coding"),
      expect.stringContaining("Plan mode"),
    ]);
    fireEvent.click(
      screen.getByRole("button", { name: "Move Autonomous coding down" }),
    );
    expect(
      Array.from(
        presetOrder.querySelectorAll("li"),
        (item) => item.textContent,
      ),
    ).toEqual([
      expect.stringContaining("Organization defaults"),
      expect.stringContaining("Repository context"),
      expect.stringContaining("Plan mode"),
      expect.stringContaining("Autonomous coding"),
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/__playground/runtime-profiles/resolve",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/__playground/runtime-profiles/runtimes",
      expect.objectContaining({ method: "GET" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "presets" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: /Plan mode Ask before write operations/,
      }),
    );
    expect(screen.queryByLabelText("Allowed models")).toBeNull();
    expect(screen.queryByLabelText("Max input tokens")).toBeNull();
    expect(screen.queryByText("Setup and auth references")).toBeNull();
    expect(screen.queryByRole("region", { name: "Prompt" })).toBeNull();
    expect(screen.getByRole("region", { name: "Workspace" })).not.toBeNull();
    expect(screen.getByRole("region", { name: "Environment" })).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Workspace.*03/ }));
    expect(screen.getByLabelText("Checkout source")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Sandbox.*04/ }));
    fireEvent.click(screen.getByRole("button", { name: /Execution identity/ }));
    expect(screen.getByText("Kubernetes service account")).not.toBeNull();
    expect(screen.getByText("EKS pod identity")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Environment.*06/ }));
    expect(screen.getByText("Environment variables")).not.toBeNull();
    expect(screen.getByLabelText("Connection config item")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "permissions" }));
    expect(screen.queryByText("Permission strategies")).not.toBeNull();
    expect(screen.queryByText(/Later rows win\./)).not.toBeNull();
    const projectStrategy = screen
      .getAllByRole("button", { name: /Group projects.*Ask/i })
      .find((button) => button.hasAttribute("aria-expanded"));
    expect(projectStrategy?.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: "profiles" }));
    fireEvent.click(screen.getByRole("button", { name: "Create Profiles" }));
    expect(
      (screen.getByLabelText("Profile name") as HTMLInputElement).value,
    ).toBe("New profile");
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(1));
    await waitFor(() => expect(screen.queryByText("Resolving…")).toBeNull());
  });
});
