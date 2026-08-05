import { beforeEach, describe, expect, it } from "vitest";
import {
  isTourFinished,
  localStorageTourStorage,
  memoryTourStorage,
  type TourCompletion,
} from "./tour-progress";
import type { TourDefinition } from "./tour-types";

const KEY = "clicky-ui-tours-test";

function completion(overrides: Partial<TourCompletion> = {}): TourCompletion {
  return {
    tourId: "first-hour",
    status: "completed",
    version: 1,
    at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function definition(version?: number): TourDefinition {
  return {
    id: "first-hour",
    steps: [{ id: "a", title: "A" }],
    ...(version === undefined ? {} : { version }),
  };
}

describe("localStorageTourStorage", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips an entry", () => {
    const storage = localStorageTourStorage(KEY);
    storage.write(completion());

    expect(storage.read()).toEqual([completion()]);
  });

  it("replaces the entry for a tour rather than accumulating duplicates", () => {
    const storage = localStorageTourStorage(KEY);
    storage.write(completion({ status: "dismissed" }));
    storage.write(completion({ status: "completed", version: 2 }));

    expect(storage.read()).toEqual([completion({ status: "completed", version: 2 })]);
  });

  it("clears one tour or all of them", () => {
    const storage = localStorageTourStorage(KEY);
    storage.write(completion());
    storage.write(completion({ tourId: "test-runner" }));

    storage.clear("first-hour");
    expect(storage.read()).toEqual([completion({ tourId: "test-runner" })]);

    storage.clear();
    expect(storage.read()).toEqual([]);
  });

  it("reads corrupt storage as nothing recorded instead of throwing at boot", () => {
    localStorage.setItem(KEY, "{not json");

    expect(localStorageTourStorage(KEY).read()).toEqual([]);
  });

  it("drops entries that are not completions", () => {
    localStorage.setItem(KEY, JSON.stringify([completion(), { tourId: 7 }, null]));

    expect(localStorageTourStorage(KEY).read()).toEqual([completion()]);
  });
});

describe("memoryTourStorage", () => {
  it("starts from its seed and records writes", () => {
    const storage = memoryTourStorage([completion({ tourId: "test-runner" })]);
    storage.write(completion());

    expect(storage.read()).toHaveLength(2);
  });
});

describe("isTourFinished", () => {
  it("is false with nothing recorded", () => {
    expect(isTourFinished([], definition())).toBe(false);
  });

  it("is true for a completion at the current version", () => {
    expect(isTourFinished([completion()], definition())).toBe(true);
  });

  it("counts a dismissal as finished, so 'not now' is not asked again", () => {
    expect(isTourFinished([completion({ status: "dismissed" })], definition())).toBe(true);
  });

  it("goes stale when the definition version is bumped, re-offering a reworked tour", () => {
    expect(isTourFinished([completion({ version: 1 })], definition(2))).toBe(false);
  });
});
