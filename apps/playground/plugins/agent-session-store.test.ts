// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { agentSessionsPath, readAgentSessions } from "./agent-session-store";

describe("agent session file", () => {
  let dir: string;
  beforeEach(() => {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    dir = mkdtempSync(join(process.cwd(), ".tmp", "agent-session-store-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  const write = (settings: unknown) =>
    writeFileSync(agentSessionsPath(dir), JSON.stringify({ settings, sessions: [] }));

  it("reads a file that holds only grouping and runtime", () => {
    write({ grouping: "page" });

    expect(readAgentSessions(dir)).toEqual({ settings: { grouping: "page" }, sessions: [] });
  });

  it.each([
    ["autoRun", { autoRun: true, grouping: "shared" }],
    ["targets", { grouping: "shared", targets: { welcome: { kind: "captain", sessionId: "s", label: "S" } } }],
    ["autoRun and settings.targets", { autoRun: false, grouping: "shared", targets: {} }],
  ])("fails loudly when settings still hold %s, which moved to gavel routes", (moved, settings) => {
    write(settings);

    expect(() => readAgentSessions(dir)).toThrow(
      new RegExp(`has settings\\.${moved}, which moved to gavel comment routes`),
    );
  });
});
