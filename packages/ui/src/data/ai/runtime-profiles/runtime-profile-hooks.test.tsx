import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import type {
  ResolvedRuntimeProfile,
  RuntimePreset,
  RuntimeProfile,
} from "../runtime-profile";
import type { AISpecRuntimePermissionCatalog } from "../SpecRuntimeEditor.model";
import type { RuntimeProfilesClient } from "./types";
import { useRuntimeFamilies } from "./use-runtime-families";
import { useRuntimePermissionCatalog } from "./use-permission-catalog";
import { useRuntimeProfileResolution } from "./use-resolution";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

const OLD_FAMILY: SpecRuntimeFamily = {
  id: "old",
  label: "Old",
  provider: "old",
  modes: [{ id: "api", label: "API" }],
};
const NEW_FAMILY: SpecRuntimeFamily = {
  id: "new",
  label: "New",
  provider: "new",
  modes: [{ id: "api", label: "API" }],
};

afterEach(() => vi.useRealTimers());

describe("runtime profile hooks", () => {
  it("ignores an older fulfilled family request after a client change", async () => {
    const oldRequest = deferred<SpecRuntimeFamily[]>();
    const newRequest = deferred<SpecRuntimeFamily[]>();
    const oldClient = {
      loadFamilies: () => oldRequest.promise,
    } as RuntimeProfilesClient;
    const newClient = {
      loadFamilies: () => newRequest.promise,
    } as RuntimeProfilesClient;
    const { result, rerender } = renderHook(
      ({ client }) => useRuntimeFamilies(client),
      { initialProps: { client: oldClient } },
    );

    rerender({ client: newClient });
    await act(async () => newRequest.resolve([NEW_FAMILY]));
    expect(result.current.families).toEqual([NEW_FAMILY]);
    await act(async () => oldRequest.resolve([OLD_FAMILY]));
    expect(result.current.families).toEqual([NEW_FAMILY]);
  });

  it("ignores an older fulfilled permission request after a target change", async () => {
    const oldRequest = deferred<AISpecRuntimePermissionCatalog>();
    const newRequest = deferred<AISpecRuntimePermissionCatalog>();
    const loadPermissionCatalog = vi
      .fn()
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise);
    const client = {
      loadPermissionCatalog,
    } as unknown as RuntimeProfilesClient;
    const families: SpecRuntimeFamily[] = [
      {
        id: "gemini",
        label: "Gemini",
        provider: "google",
        catalogPrefix: "googleai",
        modes: [
          { id: "api", label: "API" },
          { id: "cli", label: "CLI" },
        ],
      },
    ];
    const { result, rerender } = renderHook(
      ({ mode }) =>
        useRuntimePermissionCatalog(
          client,
          { model: "googleai/gemini", mode },
          families,
        ),
      { initialProps: { mode: "api" } },
    );

    rerender({ mode: "cli" });
    await act(async () => newRequest.resolve({ tools: [{ id: "new" }] }));
    expect(result.current.catalog?.tools?.[0]?.id).toBe("new");
    await act(async () => oldRequest.resolve({ tools: [{ id: "old" }] }));
    expect(result.current.catalog?.tools?.[0]?.id).toBe("new");
  });

  it("ignores an older fulfilled resolution after a profile change", async () => {
    vi.useFakeTimers();
    const oldRequest = deferred<ResolvedRuntimeProfile>();
    const newRequest = deferred<ResolvedRuntimeProfile>();
    const resolve = vi
      .fn()
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise);
    const client = { resolve } as unknown as RuntimeProfilesClient;
    const oldProfile: RuntimeProfile = {
      id: "old",
      name: "Old",
      spec: {},
      presets: [],
    };
    const newProfile: RuntimeProfile = {
      id: "new",
      name: "New",
      spec: {},
      presets: [],
    };
    const presets: RuntimePreset[] = [];
    const { result, rerender } = renderHook(
      ({ profile }) => useRuntimeProfileResolution(client, profile, presets),
      { initialProps: { profile: oldProfile } },
    );
    act(() => vi.advanceTimersByTime(150));
    rerender({ profile: newProfile });
    act(() => vi.advanceTimersByTime(150));
    const oldResult = {
      effectivePolicy: { id: "old" },
    } as unknown as ResolvedRuntimeProfile;
    const newResult = {
      effectivePolicy: { id: "new" },
    } as unknown as ResolvedRuntimeProfile;

    await act(async () => oldRequest.resolve(oldResult));
    expect(result.current.status).toBe("loading");
    await act(async () => newRequest.resolve(newResult));
    expect(result.current.result).toBe(newResult);
  });
});
