import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SPEC_RUNTIME_FAMILIES } from "../../runtime/runtime-mode";
import type {
  ResolvedRuntimeProfile,
  RuntimePreset,
  RuntimeProfile,
} from "../runtime-profile";
import { RuntimeProfilesWorkspace } from "./RuntimeProfilesWorkspace";
import type {
  RuntimeProfilesClient,
  RuntimeProfilesPersistence,
  RuntimeProfilesStore,
  RuntimeProfilesView,
  RuntimeRecordMeta,
} from "./types";

const PRESETS: RuntimePreset[] = [
  {
    id: "organization-defaults",
    name: "Organization defaults",
    scope: "global",
    spec: { model: "anthropic/claude-sonnet-5", mode: "cli" },
  },
  { id: "plan-mode", name: "Plan mode", scope: "surface", spec: { mode: "cli" } },
];

const PROFILES: RuntimeProfile[] = [
  {
    id: "review-profile",
    name: "Plan and review",
    spec: {},
    presets: ["organization-defaults", "ghost-preset"],
  },
  { id: "coding-profile", name: "Autonomous coding", spec: {}, presets: [] },
];

const RESOLUTION: ResolvedRuntimeProfile = {
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
        name: "request",
        scope: "user",
        source: "request",
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

function fakeClient(): RuntimeProfilesClient {
  return {
    resolve: vi.fn(async () => RESOLUTION),
    loadPermissionCatalog: vi.fn(async () => ({
      tools: [{ id: "Read", label: "Read", group: "Agent tools" }],
    })),
  };
}

function Harness({
  client,
  persistence,
  recordMeta,
  onStore,
}: {
  client: RuntimeProfilesClient;
  persistence?: RuntimeProfilesPersistence | undefined;
  recordMeta?: ((id: string) => RuntimeRecordMeta) | undefined;
  onStore?: ((store: RuntimeProfilesStore) => void) | undefined;
}) {
  const [view, setView] = useState<RuntimeProfilesView>("profiles");
  const [presets, setPresets] = useState(PRESETS);
  const [profiles, setProfiles] = useState(PROFILES);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(
    PRESETS[0]?.id,
  );
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>(
    PROFILES[0]?.id,
  );
  const store: RuntimeProfilesStore = {
    createPreset: (preset) => setPresets((current) => [...current, preset]),
    updatePreset: (next) =>
      setPresets((current) => current.map((p) => (p.id === next.id ? next : p))),
    deletePreset: (id) => setPresets((current) => current.filter((p) => p.id !== id)),
    createProfile: (profile) => setProfiles((current) => [...current, profile]),
    updateProfile: (next) =>
      setProfiles((current) => current.map((p) => (p.id === next.id ? next : p))),
    deleteProfile: (id) => setProfiles((current) => current.filter((p) => p.id !== id)),
  };
  onStore?.(store);
  return (
    <>
      <RuntimeProfilesWorkspace
        presets={presets}
        profiles={profiles}
        view={view}
        onViewChange={setView}
        selectedPresetId={selectedPresetId}
        selectedProfileId={selectedProfileId}
        onSelectPreset={setSelectedPresetId}
        onSelectProfile={setSelectedProfileId}
        store={store}
        client={client}
        families={SPEC_RUNTIME_FAMILIES}
        persistence={persistence}
        recordMeta={recordMeta}
        newId={() => "new-record"}
      />
      <output data-testid="profiles-json">{JSON.stringify(profiles)}</output>
      <output data-testid="selection">{selectedProfileId ?? ""}</output>
    </>
  );
}

describe("RuntimeProfilesWorkspace", () => {
  afterEach(cleanup);

  it("resolves the selected profile and renders the trace, without a persistence bar", async () => {
    const client = fakeClient();
    render(<Harness client={client} />);

    expect(screen.queryByRole("group", { name: "Persistence" })).toBeNull();
    await waitFor(() => expect(screen.queryByText("Resolved")).not.toBeNull());
    expect(
      Array.from(
        screen.getByRole("list", { name: "Resolution order" }).querySelectorAll("li"),
        (item) => item.textContent,
      ),
    ).toEqual([
      expect.stringContaining("Organization defaults"),
      expect.stringContaining("request"),
    ]);
    expect(client.resolve).toHaveBeenCalledWith(
      expect.objectContaining({ profile: PROFILES[0], presets: PRESETS }),
      expect.any(AbortSignal),
    );
    await waitFor(() =>
      expect(client.loadPermissionCatalog).toHaveBeenCalledWith(
        { provider: "anthropic", mode: "cli" },
        expect.any(AbortSignal),
      ),
    );
  });

  it("renders the persistence bar only when supplied and wires its actions", () => {
    const persistence: RuntimeProfilesPersistence = {
      dirty: true,
      saving: false,
      error: "conflict on Plan and review",
      onSave: vi.fn(),
      onDiscard: vi.fn(),
    };
    render(<Harness client={fakeClient()} persistence={persistence} />);

    const bar = screen.getByRole("group", { name: "Persistence" });
    expect(within(bar).getByText("Unsaved changes")).not.toBeNull();
    expect(within(bar).getByRole("alert").textContent).toBe(
      "conflict on Plan and review",
    );
    fireEvent.click(within(bar).getByRole("button", { name: "Save" }));
    fireEvent.click(within(bar).getByRole("button", { name: "Discard" }));
    expect(persistence.onSave).toHaveBeenCalledTimes(1);
    expect(persistence.onDiscard).toHaveBeenCalledTimes(1);
  });

  it("badges record sources and disables delete for read-only records", () => {
    render(
      <Harness
        client={fakeClient()}
        recordMeta={(id) =>
          id === "review-profile"
            ? { sourceLabel: "file", writable: false }
            : { sourceLabel: "db", writable: true }
        }
      />,
    );

    const readOnly = screen.getByRole("button", { name: "Delete Plan and review" });
    expect(readOnly).toBeDisabled();
    expect(readOnly).toHaveAttribute("title", "file is read-only");
    expect(screen.getByRole("button", { name: "Delete Autonomous coding" })).toBeEnabled();
    expect(screen.getByText("file")).not.toBeNull();
  });

  it("renders a missing preset reference as a removable row", () => {
    render(<Harness client={fakeClient()} />);

    const order = screen.getByRole("list", { name: "Preset order" });
    expect(within(order).getByText("ghost-preset")).not.toBeNull();
    expect(within(order).getByText("missing")).not.toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Remove missing preset ghost-preset" }),
    );
    expect(
      JSON.parse(screen.getByTestId("profiles-json").textContent ?? "[]")[0].presets,
    ).toEqual(["organization-defaults"]);
  });

  it("creates and selects a new profile through the store", () => {
    render(<Harness client={fakeClient()} />);

    fireEvent.click(screen.getByRole("button", { name: "Create Profiles" }));
    expect(screen.getByTestId("selection").textContent).toBe("new-record");
    expect((screen.getByLabelText("Profile name") as HTMLInputElement).value).toBe(
      "New profile",
    );
  });
});
