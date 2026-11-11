import { expect, it } from "vitest";
import { draftOf, hasUnsavedChanges, settingsOf, switchBackend } from "./popup-model";

const runtime = { spec: { model: "example-model" } };

it("holds optional settings as empty strings in the form and omits them again when read back", () => {
  const draft = draftOf({ backend: "gavel", server: "http://localhost:9092", project: "acme" });
  expect(draft).toEqual({ backend: "gavel", server: "http://localhost:9092", project: "acme", runtime: undefined, grouping: "page", session: "", enabled: false });
  expect(settingsOf(draft)).toEqual({ backend: "gavel", server: "http://localhost:9092", project: "acme", grouping: "page" });
  expect(settingsOf({ ...draft, runtime, grouping: "shared", session: "s-1" })).toEqual({ backend: "gavel", server: "http://localhost:9092", project: "acme", runtime, grouping: "shared", session: "s-1" });
});

it("carries the site's enabled flag through the form and omits it again while off", () => {
  const draft = draftOf({ backend: "playground", server: "http://localhost:5274", enabled: true });
  expect(draft.enabled).toBe(true);
  expect(settingsOf(draft)).toEqual({ backend: "playground", server: "http://localhost:5274", grouping: "page", enabled: true });
  expect(settingsOf({ ...draft, enabled: false })).not.toHaveProperty("enabled");
});

it("moves the server to the new backend's default only while it is still the old backend's default", () => {
  const playground = draftOf({ backend: "playground", server: "http://localhost:5274" });
  expect(switchBackend(playground, "gavel")).toMatchObject({ backend: "gavel", server: "http://localhost:9092" });
  expect(switchBackend({ ...playground, server: "http://localhost:5275" }, "gavel")).toMatchObject({ backend: "gavel", server: "http://localhost:5275" });
  expect(switchBackend(switchBackend(playground, "gavel"), "playground")).toMatchObject({ backend: "playground", server: "http://localhost:5274" });
});

it("reports unsaved changes in the form but not a flipped enabled switch", () => {
  const saved = draftOf({ backend: "playground", server: "http://localhost:5274" });
  expect(hasUnsavedChanges({ draft: { ...saved, enabled: true }, saved })).toBe(false);
  expect(hasUnsavedChanges({ draft: { ...saved, server: "http://localhost:5275" }, saved })).toBe(true);
});

it("reports a changed runtime or grouping as unsaved, but an equal runtime in another key order as saved", () => {
  const saved = draftOf({ backend: "gavel", server: "http://localhost:9092", project: "acme", runtime: { spec: { model: "m", effort: "high" }, presets: ["fast"] } });
  expect(hasUnsavedChanges({ draft: { ...saved, runtime: { presets: ["fast"], spec: { effort: "high", model: "m" } } }, saved })).toBe(false);
  expect(hasUnsavedChanges({ draft: { ...saved, runtime: { spec: { model: "other" } } }, saved })).toBe(true);
  expect(hasUnsavedChanges({ draft: { ...saved, runtime: undefined }, saved })).toBe(true);
  expect(hasUnsavedChanges({ draft: { ...saved, grouping: "shared" }, saved })).toBe(true);
});
