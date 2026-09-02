// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RuntimeProfilesPlayground from "./captain/runtime-profiles";

const RESOLVE_ROUTE = "/__playground/runtime-profiles/resolve";
const RUNTIMES_ROUTE = "/__playground/runtime-profiles/runtimes";
const PERMISSIONS_ROUTE =
  "/__playground/runtime-profiles/permissions?provider=anthropic&mode=cli";

const RESOLUTION = {
  resolved: {
    spec: { model: "anthropic/claude-sonnet-5", mode: "cli" },
    constraints: {},
    trace: [
      {
        id: "organization-defaults",
        name: "Organization defaults",
        scope: "global",
        source: "preset",
        spec: {},
        constraints: {},
      },
      {
        id: "review-profile",
        name: "Plan and review",
        scope: "surface",
        source: "profile",
        spec: {},
        constraints: {},
      },
    ],
  },
  tools: [],
  permissions: {},
  permissionSupport: {},
  effectivePolicy: [],
};

const PERMISSION_CATALOG = {
  tools: [{ id: "Read", label: "Read", group: "Agent tools" }],
};

const RUNTIMES = [
  {
    family: "claude",
    provider: "anthropic",
    catalogPrefix: "anthropic",
    modes: [
      {
        mode: "cli",
        permissions: { modes: {}, toolPolicies: {}, resources: {} },
        schema: { type: "object", properties: { model: { type: "string" } } },
      },
    ],
  },
];

function stubRoutes() {
  const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    return Promise.resolve({
      ok: true,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () =>
        Promise.resolve(
          url === RUNTIMES_ROUTE
            ? RUNTIMES
            : url.startsWith("/__playground/runtime-profiles/permissions?")
              ? PERMISSION_CATALOG
              : RESOLUTION,
        ),
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("RuntimeProfilesPlayground", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders both views from the playground routes", async () => {
    const fetchMock = stubRoutes();

    render(<RuntimeProfilesPlayground />);

    expect(screen.getByText("Captain live resolver")).not.toBeNull();
    await waitFor(() => expect(screen.queryByText("Resolved")).not.toBeNull());
    expect(
      Array.from(
        screen.getByRole("list", { name: "Resolution order" }).querySelectorAll("li"),
        (item) => item.textContent,
      ),
    ).toEqual([
      expect.stringContaining("Organization defaults"),
      expect.stringContaining("Plan and review"),
    ]);
    expect(
      (screen.getByLabelText("Profile name") as HTMLInputElement).value,
    ).toBe("Plan and review");
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        PERMISSIONS_ROUTE,
        expect.objectContaining({ method: "GET" }),
      ),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      RUNTIMES_ROUTE,
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      RESOLVE_ROUTE,
      expect.objectContaining({ method: "POST" }),
    );

    fireEvent.click(screen.getByRole("radio", { name: "Presets" }));
    expect(
      (screen.getByLabelText("Preset name") as HTMLInputElement).value,
    ).toBe("Organization defaults");
    expect(screen.getByRole("tab", { name: "Permissions" })).not.toBeNull();
  });
});
