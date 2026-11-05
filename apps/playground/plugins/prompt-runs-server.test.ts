import { configureTestComments } from "./testing/comments-store";
// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger, createServer, type ViteDevServer } from "vite";
import { PromptAssociations } from "./prompt-associations";

import { createAgentRuns, playgroundAgentRuns } from "./agent-runs-server";
import { playgroundComments } from "./comments-server";
import { readAll, type StoredComment } from "./testing/comments-store";
import { CaptainHttpError, CaptainUnreachableError } from "./captain-client";
import {
  createPromptRuns,
  playgroundPromptRuns,
  type PromptRun,
} from "./prompt-runs-server";
import { errorEnvelope } from "./prompt-runs-errors";
import { StubCaptain } from "./testing/stub-captain";

const SKILL_PATH = fileURLToPath(
  new URL(
    "../../../.agents/skills/clicky-ui-playground/SKILL.md",
    import.meta.url,
  ),
);
const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const human = { name: "Reviewer", kind: "user" } as const;
const PAGE = "diagrams";
const ANCHOR = ":scope > svg:nth-child(1)";
const ELEMENT = { source: "src/pages/diagrams.tsx:12", html: "<svg>…</svg>" };
const SPEC = {
  mode: "cli",
  model: "anthropic/claude-sonnet-4-6",
  effort: "low",
};

const DIAGRAM_SMELLS = {
  id: "local-diagram-smells",
  version: "v1",
  name: "diagram-smells",
  description: "Lint rendered diagrams",
  variables: null,
  content: '{{role "user"}}\nLint {{#if files}}{{files}}{{/if}}\n{{input}}',
};

const VIOLATIONS = [
  {
    file: "docs/arch.svg",
    line: 4,
    severity: "error",
    message: "Label overflows its box.",
    rule: { method: "diagram-smells/label-overflow" },
  },
];

describe("errorEnvelope", () => {
  const COMMAND = "clicky prompt run --presets=lint";
  const REFUSAL = "a run needs something to do: prompt.user is empty";

  it.each([
    [
      "a refused run, with Captain's text, a hint, the request and the command",
      new CaptainHttpError(500, REFUSAL, {
        request: "POST /api/v1/prompt/run",
        exitCode: 1,
        command: COMMAND,
      }),
      {
        status: 502,
        body: {
          error: REFUSAL,
          hint: "Captain refused the run. Check the prompt's arguments and runtime, then try again.",
          context: {
            Captain: "POST /api/v1/prompt/run",
            Status: 500,
            "Exit code": 1,
          },
          details: [{ label: "Captain command", value: COMMAND }],
        },
      },
    ],
    [
      "a missing prompt, as a 404 that says to reload",
      new CaptainHttpError(404, "prompt not found", {
        request: "GET /api/v1/prompt/nope",
      }),
      {
        status: 404,
        body: {
          error: "prompt not found",
          hint: "Captain no longer has this prompt; reload the prompt list.",
          context: { Captain: "GET /api/v1/prompt/nope", Status: 404 },
        },
      },
    ],
    [
      "an unreachable Captain, with where to start it",
      new CaptainUnreachableError(
        "http://localhost:9020",
        new Error("ECONNREFUSED"),
      ),
      {
        status: 502,
        body: {
          error:
            "Captain is unreachable at http://localhost:9020: ECONNREFUSED",
          hint: "Start Captain at http://localhost:9020, then try again.",
        },
      },
    ],
  ])("describes %s", (_label, error, expected) => {
    expect(errorEnvelope(error)).toEqual(expected);
  });
});

describe("playground prompt runs", () => {
  let dir: string;
  let vite: ViteDevServer;
  let baseUrl: string;
  let captain: StubCaptain;
  let captainURL: string;

  beforeEach(async () => {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    dir = mkdtempSync(join(process.cwd(), ".tmp", "prompt-runs-"));
    configureTestComments(dir);
    captain = new StubCaptain();
    captain.prompts = [DIAGRAM_SMELLS];
    captainURL = await captain.listen();
    const agentRuns = createAgentRuns({
      dir,
      captainURL,
      cwd: REPO_ROOT,
      skillPath: SKILL_PATH,
      sessionTimeoutMs: 2000,
    });
    vite = await createServer({
      configFile: false,
      plugins: [
        playgroundAgentRuns(agentRuns),
        playgroundPromptRuns(
          createPromptRuns({
            dir,
            gavelURL: captainURL,
            workspace: REPO_ROOT,
            onCreated: agentRuns.autoRunComment,
          }),
        ),
        playgroundComments({ dir, onCreated: agentRuns.autoRunComment }),
      ],
      server: { host: "127.0.0.1", port: 0 },
    });
    await vite.listen();
    const address = vite.httpServer?.address();
    if (!address || typeof address === "string") {
      throw new Error("prompt runs test server has no TCP address");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await vite?.close();
    await captain.close().catch(() => undefined);
    rmSync(dir, { recursive: true, force: true });
  });

  function startRun(overrides: Record<string, unknown> = {}) {
    return fetch(`${baseUrl}/__playground/prompt-runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promptId: "diagram-smells",
        promptVersion: "v1",
        preparationId: "prepared",
        associationId: randomUUID(),
        variables: { files: "docs/arch.svg" },
        presets: ["lint"],
        spec: SPEC,
        page: PAGE,
        anchor: ANCHOR,
        element: ELEMENT,
        author: human,
        ...overrides,
      }),
    });
  }

  /** Runs finish after the 202, so poll the run list until this one settles. */
  async function settled(runId: string): Promise<PromptRun> {
    let found: PromptRun | undefined;
    await vi.waitFor(
      async () => {
        const response = await fetch(`${baseUrl}/__playground/prompt-runs`);
        const { runs } = (await response.json()) as { runs: PromptRun[] };
        found = runs.find((run) => run.runId === runId);
        expect(found?.state).not.toBe("running");
      },
      { timeout: 3000 },
    );
    return found as PromptRun;
  }

  async function pageComments(): Promise<StoredComment[]> {
    return (await readAll(dir))[PAGE] ?? [];
  }

  it("recovers a durably queued association with protected inputs and creates one result comment", async () => {
    captain.nextSummary = {
      event: "done",
      data: { success: true, structuredOutput: { violations: VIOLATIONS } },
    };
    const associationId = randomUUID();
    const secret = "private-association-canary";
    const records = new PromptAssociations(dir);
    records.protect(associationId, {
      request: { element: ELEMENT, variables: { token: secret }, spec: SPEC },
      launch: {
        preparationId: "prepared",
        config: { lint: {} },
        labels: { playgroundAssociation: associationId },
      },
    });
    records.save({
      associationId,
      workspace: REPO_ROOT,
      origin: baseUrl,
      requestedBy: human,
      runId: `pending:${associationId}`,
      promptId: DIAGRAM_SMELLS.id,
      promptName: DIAGRAM_SMELLS.name,
      page: PAGE,
      anchor: ANCHOR,
      startedAt: new Date().toISOString(),
      state: "running",
    });
    expect(
      readFileSync(join(dir, "prompt-associations.json"), "utf8"),
    ).not.toContain(secret);
    expect(
      readFileSync(join(dir, "prompt-inputs", `${associationId}.bin`), "utf8"),
    ).not.toContain(secret);
    const restored = createPromptRuns({
      dir,
      gavelURL: captainURL,
      workspace: REPO_ROOT,
    });
    restored.resume(createLogger("silent"));
    await vi.waitFor(() => expect(records.all()[0]?.state).toBe("done"));
    expect(
      records.input<{ request: { variables: { token: string } } }>(
        associationId,
      ).request.variables.token,
    ).toBe(secret);
    expect(await pageComments()).toHaveLength(1);
    const reopened = createPromptRuns({
      dir,
      gavelURL: captainURL,
      workspace: REPO_ROOT,
    });
    reopened.resume(createLogger("silent"));
    expect(await reopened.runs(createLogger("silent"))).toMatchObject([
      { state: "done" },
    ]);
    expect(captain.callsTo("POST", /^\/api\/launch\/lint$/)).toHaveLength(1);
    expect(await pageComments()).toHaveLength(1);
  });

  it("lists captain's prompts and derives a prompt's argument schema from its template", async () => {
    const list = await fetch(`${baseUrl}/__playground/prompts`);
    expect(await list.json()).toEqual({
      prompts: [
        {
          id: DIAGRAM_SMELLS.id,
          version: "v1",
          name: DIAGRAM_SMELLS.name,
          description: DIAGRAM_SMELLS.description,
          variables: null,
        },
      ],
    });

    const detail = await fetch(
      `${baseUrl}/__playground/prompts/diagram-smells`,
    );
    expect(await detail.json()).toEqual({
      preparationId: "prepared",
      prompt: DIAGRAM_SMELLS,
      variablesSchema: {
        type: "object",
        properties: { files: { type: "string" }, input: { type: "string" } },
      },
    });

    const missing = await fetch(`${baseUrl}/__playground/prompts/nope`);
    expect(missing.status).toBe(404);
  });

  it("answers a Gavel preflight refusal without exposing command arguments", async () => {
    const refusal = "a run needs something to do: prompt.user is empty";
    captain.nextRunFailure = { status: 422, body: { error: refusal } };
    const response = await startRun();
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: refusal,
    });
  });

  it("answers an invalid request with what to fix", async () => {
    const response = await startRun({ variables: ["docs/arch.svg"] });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: '"variables" must be an object',
      hint: "The run request was rejected before reaching Captain; fix the field named above.",
    });
  });

  it("runs the prompt one-shot and records its violations as a prompt-authored checklist comment", async () => {
    captain.nextSummary = {
      event: "done",
      data: { success: true, structuredOutput: { violations: VIOLATIONS } },
    };
    const response = await startRun();
    expect(response.status).toBe(202);
    const { run } = (await response.json()) as { run: PromptRun };
    expect(run).toMatchObject({
      promptName: "diagram-smells",
      state: "running",
    });

    expect(
      captain.callsTo("POST", /^\/api\/launch\/lint$/)[0]?.body,
    ).toMatchObject({
      preparationId: "prepared",
      config: {
        lint: {
          linters: [
            {
              id: "review",
              linter: "prompt",
              options: {
                prompt: DIAGRAM_SMELLS.id,
                promptVersion: "v1",
                variables: { files: "docs/arch.svg" },
                presets: ["lint"],
                spec: SPEC,
              },
            },
          ],
        },
      },
    });

    const done = await settled(run.runId);
    expect(done.state).toBe("done");
    const [comment] = await pageComments();
    expect(comment).toMatchObject({
      id: done.commentId,
      status: "open",
      anchor: ANCHOR,
      element: ELEMENT,
      author: {
        name: "diagram-smells",
        kind: "agent",
        model: SPEC.model,
        effort: SPEC.effort,
        sessionId: `session-of-${run.runId}`,
        via: "prompt:diagram-smells",
      },
      checklist: [
        {
          label:
            "error · diagram-smells/label-overflow — Label overflows its box.",
          status: "open",
        },
      ],
      refs: [{ label: "Files", items: ["docs/arch.svg:4"], mono: true }],
      lint: { violations: VIOLATIONS },
      promptRun: {
        promptId: "local-diagram-smells",
        promptName: "diagram-smells",
        runId: run.runId,
      },
    });
    expect(comment?.body).toContain("**diagram-smells** found 1 issue");
    expect(comment?.promptRun?.variables).toBeUndefined();
    // Auto-run is off, so nothing reaches an agent session.
    expect(comment?.agentRun).toBeUndefined();
  });

  it("hands the result to the agent session on behalf of the requester when auto-run is on", async () => {
    await fetch(`${baseUrl}/__playground/agent-sessions/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        autoRun: true,
        runtime: { spec: { model: "m-1" } },
      }),
    });
    captain.nextSummary = {
      event: "done",
      data: { success: true, structuredOutput: { violations: VIOLATIONS } },
    };
    const { run } = (await (await startRun()).json()) as { run: PromptRun };
    await settled(run.runId);

    await vi.waitFor(
      async () =>
        expect((await pageComments())[0]?.agentRun?.state).toBe("sent"),
      {
        timeout: 3000,
      },
    );
    const chat = captain.callsTo("POST", /^\/api\/v1\/prompt\/run$/);
    expect(chat).toHaveLength(1);
    expect(JSON.stringify(chat[0]?.body)).toContain("Label overflows its box.");
    expect((await pageComments())[0]).toMatchObject({
      status: "in_progress",
      assignee: { name: "m-1", kind: "agent" },
    });
  });

  it.each([
    [
      "no violations",
      {
        event: "done" as const,
        data: { success: true, structuredOutput: { violations: [] } },
      },
      { state: "empty" },
    ],
    [
      "a failed run",
      { event: "error" as const, data: { error: "budget exceeded" } },
      { state: "failed", error: "budget exceeded" },
    ],
  ])("writes no comment for %s", async (_label, summary, expected) => {
    captain.nextSummary = summary;
    const { run } = (await (await startRun()).json()) as { run: PromptRun };
    expect(await settled(run.runId)).toMatchObject(expected);
    expect(await pageComments()).toEqual([]);
  });

  it.each([
    ["an agent requester", { author: { name: "bot", kind: "agent" } }, 403],
    ["a missing element", { element: undefined }, 400],
    [
      "a screenshot capture",
      {
        element: {
          ...ELEMENT,
          screenshot: { status: "captured", dataUrl: "data:," },
        },
      },
      400,
    ],
    ["an unknown field", { checklist: [] }, 400],
    ["a missing runtime spec", { spec: undefined }, 400],
    ["a runtime spec without a model", { spec: { mode: "cli" } }, 400],
  ])(
    "rejects %s before captain runs anything",
    async (_label, overrides, status) => {
      expect((await startRun(overrides)).status).toBe(status);
      expect(captain.callsTo("POST", /\/api\/v1\/prompt\/run/)).toHaveLength(0);
    },
  );

  it("still refuses structured fields from ordinary comment posts", async () => {
    const response = await fetch(`${baseUrl}/__playground/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: PAGE,
        body: "note",
        author: human,
        anchor: ANCHOR,
        element: ELEMENT,
        checklist: [{ label: "x", status: "open" }],
      }),
    });
    expect(response.status).toBe(400);
  });
});
