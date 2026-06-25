import { describe, expect, it } from "vitest";
import {
  UiActivity,
  UiCommand,
  UiDatabase,
  UiSearch,
  UiSqlQuery,
  UiTerminal,
} from "../icons";
import { resolveSurfaceIcon } from "./surfaceIconMap";

describe("resolveSurfaceIcon", () => {
  it("maps a canonical name to its glyph component", () => {
    expect(resolveSurfaceIcon("database")).toBe(UiDatabase);
  });

  it("maps cmd/query profile names to their glyphs", () => {
    // The cmd/query surfaces clicky emits for command-backed entities must
    // resolve so they render with an icon in the AppShell rail.
    expect(resolveSurfaceIcon("command")).toBe(UiCommand);
    expect(resolveSurfaceIcon("cmd")).toBe(UiCommand);
    expect(resolveSurfaceIcon("terminal")).toBe(UiTerminal);
    expect(resolveSurfaceIcon("query")).toBe(UiSqlQuery);
    expect(resolveSurfaceIcon("sql-query")).toBe(UiSqlQuery);
    expect(resolveSurfaceIcon("search")).toBe(UiSearch);
  });

  it("resolves aliases to the same glyph as their canonical name", () => {
    expect(resolveSurfaceIcon("logs")).toBe(UiActivity);
    expect(resolveSurfaceIcon("activity")).toBe(UiActivity);
  });

  it("is case-insensitive on the backend icon name", () => {
    expect(resolveSurfaceIcon("Command")).toBe(UiCommand);
    expect(resolveSurfaceIcon("DATABASE")).toBe(UiDatabase);
  });

  it("returns undefined for an unknown name so the nav item renders without an icon", () => {
    expect(resolveSurfaceIcon("not-a-real-icon")).toBeUndefined();
  });

  it("returns undefined when no icon name is set", () => {
    expect(resolveSurfaceIcon(undefined)).toBeUndefined();
  });
});
