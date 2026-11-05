import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { relative, sep } from "node:path";
import type { Plugin } from "vite";

import { parseEditableSource, type EditableSourceMarker } from "./editable-source-marker";
import { diskModuleHost, pageModuleGraph } from "./page-module-graph";
import { PAGE_SLUG_PATTERN, PageStoreError, pagePath, pagesFilePath, writePagesFile } from "./pages-store";
import { sourceHash } from "./source-hash";
import {
  assertStyleValue,
  findTextCandidates,
  setStyleProp,
  setText,
  type SetTextOutcome,
  type VisualEdited,
  type VisualRefused,
} from "./visual-edit-source";
import { VISUAL_EDITS_ROUTE, type VisualEdit, type VisualEditRequest, type VisualEditResponse } from "./visual-edits-contract";

/** Per file, the content hashes reached from earlier hashes through visual edits only. */
export type VisualEditLineage = Map<string, Map<string, string>>;

export type VisualEditResult = { statusCode: number; body: VisualEditResponse; written?: string };

export function createVisualEditLineage(): VisualEditLineage {
  return new Map();
}

function reaches(lineage: VisualEditLineage, file: string, from: string, to: string): boolean {
  const steps = lineage.get(file);
  const seen = new Set<string>();
  for (let hash: string | undefined = from; hash !== undefined && !seen.has(hash); hash = steps?.get(hash)) {
    if (hash === to) return true;
    seen.add(hash);
  }
  return false;
}

class InvalidRequest extends Error {}

function parseRequest(raw: unknown): VisualEditRequest {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) throw new InvalidRequest("request body must be a JSON object");
  const body = raw as Record<string, unknown>;
  const text = (value: unknown, name: string): string => {
    if (typeof value !== "string" || value === "") throw new InvalidRequest(`"${name}" must be a non-empty string`);
    return value;
  };
  const page = text(body["page"], "page");
  if (!PAGE_SLUG_PATTERN.test(page)) throw new InvalidRequest(`invalid page slug ${JSON.stringify(page)}`);
  const source = text(body["source"], "source");
  try {
    parseEditableSource(source);
  } catch (error) {
    throw new InvalidRequest((error as Error).message);
  }
  const edit = body["edit"];
  if (edit === null || typeof edit !== "object") throw new InvalidRequest('"edit" must be an object');
  const fields = edit as Record<string, unknown>;
  let parsed: VisualEdit;
  if (fields["kind"] === "style") {
    const prop = fields["prop"];
    if (prop !== "variant" && prop !== "role") throw new InvalidRequest('style edits support "variant" and "role"');
    try {
      parsed = { kind: "style", prop, value: assertStyleValue(fields["value"]) };
    } catch (error) {
      throw new InvalidRequest((error as Error).message);
    }
  } else if (fields["kind"] === "text") {
    parsed = { kind: "text", prop: text(fields["prop"], "edit.prop"), from: text(fields["from"], "edit.from"), to: text(fields["to"], "edit.to") };
  } else {
    throw new InvalidRequest('"edit.kind" must be "style" or "text"');
  }
  const choose = body["choose"];
  if (choose !== undefined && (typeof choose !== "string" || choose === "")) throw new InvalidRequest('"choose" must be a non-empty string');
  return { page, source, edit: parsed, ...(choose !== undefined ? { choose } : {}) };
}

const REFUSAL_ADVICE: Record<VisualRefused["reason"], (prop: string) => string> = {
  computed: (prop) => `${prop} is computed there, so it cannot be changed visually; open the source and edit it by hand`,
  spread: (prop) => `props are spread after ${prop} there, so a literal would be overridden; open the source and edit it by hand`,
  "not-found": (prop) => `no literal for ${prop} was found in the modules of this page; open the source and edit it by hand`,
  unchanged: () => "the new value equals the current one",
  entity: () => "the text contains an HTML entity (&...;), which is not rewritten automatically; open the source and edit it by hand",
};

function refusal(file: string, line: number, column: number, reason: string, advice: string): VisualEditResult {
  return {
    statusCode: 422,
    body: { status: "refused", error: `${file}:${line}:${column}: ${advice}`, reason, file, line, column },
  };
}

export type ApplyVisualEditOptions = {
  pagesDir: string;
  workspaceRoot: string;
  lineage: VisualEditLineage;
  request: unknown;
};

/** Applies one visual edit to the source behind a call-site marker. Never throws for client mistakes; see the status codes. */
export function applyVisualEdit(options: ApplyVisualEditOptions): VisualEditResult {
  try {
    return apply(options);
  } catch (error) {
    if (error instanceof InvalidRequest) return { statusCode: 400, body: { status: "invalid", error: error.message } };
    if (error instanceof PageStoreError) return { statusCode: error.statusCode, body: { status: "invalid", error: error.message } };
    throw error;
  }
}

function apply({ pagesDir, workspaceRoot, lineage, request }: ApplyVisualEditOptions): VisualEditResult {
  const { page, source, edit, choose } = parseRequest(request);
  const marker = parseEditableSource(source);
  const pageFile = pagePath(pagesDir, page);
  if (!pageFile.endsWith(".tsx")) {
    return refusal(page, 1, 1, "outside-page", `${page} is not a TSX page, so it has no editable call sites`);
  }
  const host = diskModuleHost();
  const graph = pageModuleGraph({ host, pageFile, pagesDir });
  const callSite = pagesFilePath(pagesDir, marker.file);
  if (!graph.files.includes(callSite)) {
    return refusal(marker.file, marker.line, marker.column, "outside-page", `${marker.file} is not part of page "${page}"; reload the page`);
  }

  const rel = (file: string) => relative(pagesDir, file).split(sep).join("/");
  const contents = new Map(graph.files.map((file) => [rel(file), readFileSync(file, "utf8")]));
  const callSiteSource = contents.get(marker.file)!;
  const diskHash = sourceHash(callSiteSource);
  if (diskHash !== marker.hash && !reaches(lineage, callSite, marker.hash, diskHash)) {
    return {
      statusCode: 409,
      body: {
        status: "stale",
        error: `${marker.file} changed on disk after this page was rendered; reload the page before editing visually`,
        file: marker.file,
      },
    };
  }

  const outcome: SetTextOutcome | ((VisualEdited | VisualRefused) & { file: string }) =
    edit.kind === "style"
      ? { ...setStyleProp(callSiteSource, marker.ordinal, edit.prop, edit.value), file: marker.file }
      : setText({ files: contents, callSiteFile: marker.file, ordinal: marker.ordinal, prop: edit.prop, from: edit.from, to: edit.to, ...(choose !== undefined ? { choose } : {}) });

  if (outcome.status === "ambiguous") {
    const where = outcome.candidates.map((c) => `${c.file}:${c.line}`).join(", ");
    return { statusCode: 422, body: { status: "ambiguous", error: `the text appears in several places (${where}); choose one`, candidates: outcome.candidates } };
  }
  if (outcome.status === "refused") {
    return refused(outcome, edit, marker, graph.external, host.read);
  }
  const target = pagesFilePath(pagesDir, outcome.file);
  const before = contents.get(outcome.file)!;
  let hash: string;
  try {
    ({ hash } = writePagesFile(pagesDir, outcome.file, outcome.source, sourceHash(before)));
  } catch (error) {
    if (error instanceof PageStoreError && error.statusCode === 409) {
      return { statusCode: 409, body: { status: "stale", error: error.message, file: outcome.file } };
    }
    throw error;
  }
  const steps = lineage.get(target) ?? new Map<string, string>();
  steps.set(sourceHash(before), hash);
  lineage.set(target, steps);
  return {
    statusCode: 200,
    body: { status: "applied", file: outcome.file, path: relative(workspaceRoot, target).split(sep).join("/"), line: outcome.line, hash },
    written: target,
  };
}

function refused(
  outcome: VisualRefused & { file: string },
  edit: VisualEdit,
  marker: EditableSourceMarker,
  external: string[],
  read: (file: string) => string | undefined,
): VisualEditResult {
  const { reason, file, line, column } = outcome;
  if (reason === "not-found" && edit.kind === "text") {
    const outside = new Map(external.flatMap((path) => { const text = read(path); return text === undefined ? [] : [[path, text] as const]; }));
    const found = findTextCandidates(outside, edit.from)[0];
    if (found) {
      return refusal(found.file, found.line, found.column, "external", `"${edit.from}" comes from a module outside src/pages; open it in the workspace and edit it there`);
    }
    const hint = external.length > 0 ? ` (imports outside src/pages: ${external.join(", ")})` : "";
    return refusal(marker.file, marker.line, marker.column, "not-found", `could not find the text "${edit.from}" in the modules of this page${hint}; open the source and edit it by hand`);
  }
  return refusal(file, line, column, reason, REFUSAL_ADVICE[reason](edit.prop));
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (raw === "") throw new InvalidRequest(`${req.method} ${VISUAL_EDITS_ROUTE} expects a JSON body`);
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new InvalidRequest(`request body is not valid JSON (${(error as Error).message})`);
  }
}

function sendJson(res: ServerResponse, status: number, payload: VisualEditResponse): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

/** `POST /__playground/visual-edits`: the Design-mode write path. Dev-server only. */
export function playgroundVisualEdits(options: { pagesDir: string; workspaceRoot: string }): Plugin {
  return {
    name: "playground-visual-edits",
    apply: "serve",
    configureServer(server) {
      const lineage = createVisualEditLineage();
      server.middlewares.use(VISUAL_EDITS_ROUTE, (req, res, next) => {
        void (async () => {
          try {
            if (req.method !== "POST") {
              res.setHeader("Allow", "POST");
              return sendJson(res, 405, { status: "invalid", error: `${req.method} is not supported; use POST` });
            }
            const result = applyVisualEdit({ ...options, lineage, request: await readBody(req) });
            if (result.written) server.watcher.emit("change", result.written);
            sendJson(res, result.statusCode, result.body);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (error instanceof InvalidRequest) return sendJson(res, 400, { status: "invalid", error: message });
            server.config.logger.error(`[playground-visual-edits] ${req.method} failed: ${message}`);
            if (res.headersSent) return next(error);
            sendJson(res, 500, { status: "invalid", error: message });
          }
        })();
      });
    },
  };
}
