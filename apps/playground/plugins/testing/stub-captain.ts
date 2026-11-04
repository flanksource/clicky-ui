import {
  createServer as createHttpServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import type { AddressInfo } from "node:net";
import { promptVariablesSchema } from "../prompt-result";

import type {
  CaptainDeliverResult,
  CaptainPromptDetail,
  CaptainRunSummary,
} from "../captain-client";

export type StubCall = { method: string; url: string; body: unknown };

type StubRun = { done: boolean; sessionId: string; chat: boolean };

/**
 * A captain that records every request and answers the prompt catalog, run
 * start, message, stop and stream endpoints. Chat runs stream their session id
 * and stay open; one-shot prompt runs end with `nextSummary`.
 */
export class StubCaptain {
  calls: StubCall[] = [];
  runs = new Map<string, StubRun>();
  messageStatus = "started";
  prompts: CaptainPromptDetail[] = [];
  /** The terminal frame of the next one-shot prompt run. */
  nextSummary: { event: "done" | "error"; data: Partial<CaptainRunSummary> } = {
    event: "done",
    data: { success: true },
  };
  /** When set, the next prompt run start answers with this status and body instead of a run. */
  nextRunFailure: { status: number; body: unknown } | undefined;
  /** Rows `GET /api/captain/sessions/live` answers, as captain shapes them. */
  liveSessions: Record<string, unknown>[] = [];
  projects: { value: string; label: string; path: string }[] = [];
  /** How `POST /api/captain/sessions/{id}/deliver` answers a live session. */
  deliverResult: CaptainDeliverResult = { channel: "claude-socket", status: "sent" };
  server!: Server;
  private nextRun = 1;
  private streams = new Set<ServerResponse>();

  async listen(): Promise<string> {
    this.server = createHttpServer((req, res) => void this.handle(req, res));
    await new Promise<void>((resolve) =>
      this.server.listen(0, "127.0.0.1", resolve),
    );
    return `http://127.0.0.1:${(this.server.address() as AddressInfo).port}`;
  }

  async close(): Promise<void> {
    for (const stream of this.streams) stream.end();
    this.server.closeAllConnections();
    await new Promise<void>((resolve) => this.server.close(() => resolve()));
  }

  callsTo(method: string, pattern: RegExp): StubCall[] {
    return this.calls.filter(
      (call) => call.method === method && pattern.test(call.url),
    );
  }

  private async handle(req: IncomingMessage, res: ServerResponse) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const raw = Buffer.concat(chunks).toString("utf8");
    const url = req.url ?? "";
    const path = url.split("?")[0] ?? "";
    const method = req.method ?? "";
    const body = raw ? (JSON.parse(raw) as Record<string, unknown>) : undefined;
    this.calls.push({ method, url, body });
    const json = (status: number, payload: unknown) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(payload));
    };

    if (method === "POST" && path === "/api/launch/prepare") return json(200,{preparationId:"prepared",directory:"/workspace"});
    if (method === "GET" && path === "/api/launch/prompts") {
      const query = new URL(url,"http://stub.local").searchParams;
      const key = query.get("prompt");
      if (!key) return json(200,{prompts:this.prompts.map(({content:_content,...summary}) => summary)});
      const found = this.prompts.find((entry) => entry.id === key || entry.name === key);
      return found ? json(200,{prompt:found,variablesSchema:promptVariablesSchema(found)}) : json(404,{error:"prompt not found"});
    }
    if (method === "POST" && path === "/api/launch/lint") {
      if (this.nextRunFailure) { const failure = this.nextRunFailure; this.nextRunFailure = undefined; return json(failure.status,failure.body); }
      const runId = `run-${this.nextRun++}`;
      this.runs.set(runId,{done:true,sessionId:`session-of-${runId}`,chat:false});
      return json(202,{executionId:runId});
    }
    if (method === "GET" && path === "/api/runs") return json(200,{runs:[]});
    const execution = /^\/api\/runs\/([^/]+)$/.exec(path)?.[1];
    if (method === "GET" && execution) {
      const state = this.runs.get(execution);
      if (!state) return json(404,{error:"unknown run"});
      const summary = this.nextSummary.data;
      const failed = this.nextSummary.event === "error" || summary.success === false;
      return json(200,{metadata:{executionId:execution,revision:2},status:{state:failed ? "failed" : "completed",running:false},...(summary.error ? {error:summary.error} : {}),lint:[{success:!failed,session_id:state.sessionId,violations:(summary.structuredOutput as {violations?:unknown})?.violations ?? []}]});
    }

    if (method === "POST" && path === "/api/v1/prompt/run" && this.nextRunFailure) {
      const { status, body: failure } = this.nextRunFailure;
      this.nextRunFailure = undefined;
      return json(status, failure);
    }
    if (method === "POST" && path === "/api/v1/prompt/run") {
      const runId = `run-${this.nextRun++}`;
      const chat = body?.["chat"] === true;
      this.runs.set(runId, { done: false, sessionId: `session-of-${runId}`, chat });
      return json(200, { runId, status: "running", chat });
    }
    if (method === "GET" && path === "/api/v1/prompt") {
      return json(200, this.prompts.map(({ content: _content, ...summary }) => summary));
    }
    const prompt = /^\/api\/v1\/prompt\/([^/]+)$/.exec(path);
    if (method === "GET" && prompt) {
      const key = decodeURIComponent(prompt[1] ?? "");
      const found = this.prompts.find((entry) => entry.id === key || entry.name === key);
      return found ? json(200, found) : json(404, { error: `prompt ${key} not found` });
    }
    const run = /^\/api\/captain\/prompt\/runs\/([^/]+)(\/.*)?$/.exec(path);
    if (run) {
      const state = this.runs.get(run[1] ?? "");
      if (!state) return json(404, { error: "unknown run" });
      if (method === "GET" && run[2] === "/stream") {
        res.writeHead(200, { "Content-Type": "text/event-stream" });
        res.write(
          `event: run\ndata: ${JSON.stringify({ runId: run[1], status: "running" })}\n\n`,
        );
        if (!state.chat) {
          state.done = true;
          const { event, data } = this.nextSummary;
          res.end(
            `event: ${event}\ndata: ${JSON.stringify({ sessionId: state.sessionId, ...data })}\n\n`,
          );
          return;
        }
        this.streams.add(res);
        res.write(
          `event: state\ndata: ${JSON.stringify({ runId: run[1], sessionId: state.sessionId })}\n\n`,
        );
        return;
      }
      if (method === "GET" && !run[2]) {
        return json(200, {
          run: { runId: run[1], sessionId: state.sessionId },
          entries: [],
          done: state.done,
        });
      }
      if (method === "POST" && run[2] === "/message") {
        return json(202, { runId: run[1], status: this.messageStatus });
      }
      if (method === "POST" && run[2] === "/stop") {
        state.done = true;
        return json(202, { status: "stopping" });
      }
    }
    if (method === "GET" && path === "/api/captain/sessions/live") {
      return json(200, { sessions: this.liveSessions, total: this.liveSessions.length });
    }
    if (method === "GET" && path === "/api/captain/projects") return json(200, { projects: this.projects });
    const deliver = /^\/api\/captain\/sessions\/([^/]+)\/deliver$/.exec(path);
    if (method === "POST" && deliver) {
      const id = decodeURIComponent(deliver[1] ?? "");
      if (!this.liveSessions.some((entry) => entry["id"] === id)) {
        res.writeHead(409, { "Content-Type": "text/plain" });
        res.end(`session ${id} has no live process\n`);
        return;
      }
      return json(202, this.deliverResult);
    }
    if (method === "GET" && path.startsWith("/api/captain/sessions/")) {
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      this.streams.add(res);
      res.write(`event: entry\ndata: {"id":"m1"}\n\n`);
      return;
    }
    json(404, { error: `stub has no ${method} ${url}` });
  }
}
