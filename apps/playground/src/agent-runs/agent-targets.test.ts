import { expect, it } from "vitest";
import { sessionAgentTarget } from "./agent-targets";
import type { CaptainSessionOption } from "./agent-runs-api";

const live: CaptainSessionOption = { id: "session-a", source: "claude", title: "Fix layout", inCmux: false };
const managed: CaptainSessionOption = { id: "managed-1", source: "claude", title: "welcome threads", status: "ended", inCmux: false, managed: true, resumable: true };

it.each([
  ["a live captain session", live, { kind: "captain", sessionId: "session-a", label: "Fix layout · claude" }],
  ["a gavel-managed session, ended or not, which gavel resumes", managed, { kind: "managed", sessionId: "managed-1", label: "welcome threads" }],
])("targets %s", (_label, session, expected) => {
  expect(sessionAgentTarget(session)).toEqual(expected);
});
