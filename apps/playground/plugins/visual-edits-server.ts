import type { MiddlewareApp, ErrorLogger } from "./middleware";
import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { relative, sep } from "node:path";
import type { Plugin } from "vite";

import { isSvgEditableTag, validateSvgAttributes } from "../src/visual-edit/svg-schemas";
import { editableOpenings } from "./editable-jsx";
import { parseEditableSource, type EditableSourceMarker } from "./editable-source-marker";
import { diskModuleHost, pageModuleGraph } from "./page-module-graph";
import { PAGE_SLUG_PATTERN, PageStoreError, pagePath, pagesFilePath, writePagesFile } from "./pages-store";
import { sourceHash } from "./source-hash";
import { setSvgAttributes } from "./svg-edit-source";
import { deleteSvgElement } from "./svg-delete-source";
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
  if (fields["kind"] === "delete") {
    parsed = { kind: "delete" };
  } else if (fields["kind"] === "style") {
    const prop = fields["prop"];
    if (prop !== "variant" && prop !== "role") throw new InvalidRequest('style edits support "variant" and "role"');
    try {
      parsed = { kind: "style", prop, value: assertStyleValue(fields["value"]) };
    } catch (error) {
      throw new InvalidRequest((error as Error).message);
    }
  } else if (fields["kind"] === "text") {
    parsed = { kind: "text", prop: text(fields["prop"], "edit.prop"), from: text(fields["from"], "edit.from"), to: text(fields["to"], "edit.to") };
  } else if (fields["kind"] === "attributes") {
    const values = fields["values"];
    if (values === null || typeof values !== "object" || Array.isArray(values) || Object.keys(values).length === 0) {
      throw new InvalidRequest('"edit.values" must be a non-empty object of attribute values');
    }
    for (const [name, value] of Object.entries(values)) {
      if (value !== null && typeof value !== "string" && typeof value !== "number") {
        throw new InvalidRequest(`"edit.values.${name}" must be a string or a number, got ${JSON.stringify(value)}`);
      }
    }
    if (fields["textFrom"] !== undefined && typeof fields["textFrom"] !== "string") throw new InvalidRequest('"edit.textFrom" must be a string');
    parsed = { kind: "attributes", values: values as Record<string, string | number | null>, ...(typeof fields["textFrom"] === "string" ? { textFrom: fields["textFrom"] } : {}) };
  } else {
    throw new InvalidRequest('"edit.kind" must be "style", "text", "attributes" or "delete"');
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

function refusal(file: string, line: number, column: number, reason: string, advice: string, attribute?: string): VisualEditResult {
  return {
    statusCode: 422,
    body: {
      status: "refused",
      error: `${file}:${line}:${column}: ${advice}`,
      reason,
      file,
      line,
      column,
      ...(attribute !== undefined ? { attribute } : {}),
    },
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

  if (edit.kind === "attributes" || edit.kind === "delete") {
    const opening = editableOpenings(callSiteSource, marker.file)[marker.ordinal];
    if (!opening) throw new InvalidRequest(`${marker.file} has no editable element with ordinal ${marker.ordinal}; reload the page`);
    try {
      if (edit.kind === "attributes") validateSvgAttributes(opening.tag, edit.values);
      else if (!isSvgEditableTag(opening.tag)) throw new Error("Deletion requires an editable SVG element");
    } catch (error) {
      throw new InvalidRequest((error as Error).message);
    }
  }

  const svg = edit.kind === "attributes" ? setSvgAttributes({ files: contents, callSiteFile: marker.file, ordinal: marker.ordinal, values: edit.values, ...(edit.textFrom === undefined ? {} : { textFrom: edit.textFrom }), ...(choose === undefined ? {} : { choose }) }) : null;
  const outcome: SetTextOutcome | ((VisualEdited | VisualRefused) & { file: string }) =
    edit.kind === "style"
      ? { ...setStyleProp(callSiteSource, marker.ordinal, edit.prop, edit.value), file: marker.file }
      : edit.kind === "attributes"
        ? svg!.outcome
        : edit.kind === "delete"
          ? { ...deleteSvgElement(callSiteSource, marker.ordinal), file: marker.file }
          : setText({ files: contents, callSiteFile: marker.file, ordinal: marker.ordinal, prop: edit.prop, from: edit.from, to: edit.to, ...(choose !== undefined ? { choose } : {}) });

  if (outcome.status === "ambiguous") {
    const where = outcome.candidates.map((c) => `${c.file}:${c.line}`).join(", ");
    return { statusCode: 422, body: { status: "ambiguous", error: `the text appears in several places (${where}); choose one`, candidates: outcome.candidates } };
  }
  if (outcome.status === "refused") {
    return refused(outcome, edit, marker, graph.external, host.read);
  }
  const target = pagesFilePath(pagesDir, outcome.file);
  let hash: string;
  const patches = svg?.patches ?? new Map([[outcome.file, outcome.source]]);
  const written: Array<{ file: string; hash: string }> = [];
  try {
    for (const file of patches.keys()) {
      if (sourceHash(readFileSync(pagesFilePath(pagesDir, file), "utf8")) !== sourceHash(contents.get(file)!)) throw new PageStoreError(`${file} changed while preparing the edit`, 409);
    }
    for (const [file, source] of patches) {
      const result = writePagesFile(pagesDir, file, source, sourceHash(contents.get(file)!));
      written.push({ file, hash: result.hash });
    }
    hash = written.find(item => item.file === outcome.file)!.hash;
  } catch (error) {
    for (const item of written.reverse()) writePagesFile(pagesDir, item.file, contents.get(item.file)!, item.hash);
    if (error instanceof PageStoreError && error.statusCode === 409) {
      return { statusCode: 409, body: { status: "stale", error: error.message, file: outcome.file } };
    }
    throw error;
  }
  for (const item of written) {
    const file = pagesFilePath(pagesDir, item.file);
    if (edit.kind === "delete") {
      lineage.delete(file);
      continue;
    }
    const steps = lineage.get(file) ?? new Map<string, string>();
    steps.set(sourceHash(contents.get(item.file)!), item.hash);
    lineage.set(file, steps);
  }
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
  const subject = outcome.attribute ?? (edit.kind === "attributes" ? Object.keys(edit.values).join(", ") : edit.kind === "delete" ? "element" : edit.prop);
  return refusal(file, line, column, reason, REFUSAL_ADVICE[reason](subject), outcome.attribute);
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
      registerVisualEditsMiddleware({ ...options, middlewares: server.middlewares, logger: server.config.logger, changed: (file) => server.watcher.emit("change", file) });
    },
  };
}


export function registerVisualEditsMiddleware({ middlewares, logger, changed, ...options }: { middlewares: MiddlewareApp; logger: ErrorLogger; pagesDir: string; workspaceRoot: string; changed: (file: string) => void }): void {
  const lineage = createVisualEditLineage();
  middlewares.use(VISUAL_EDITS_ROUTE, (req, res, next) => {
    void (async () => {
      try {
        if (req.method !== "POST") {
          res.setHeader("Allow", "POST");
          return sendJson(res, 405, { status: "invalid", error: `${req.method} is not supported; use POST` });
        }
        const result = applyVisualEdit({ ...options, lineage, request: await readBody(req) });
        if (result.written) changed(result.written);
        sendJson(res, result.statusCode, result.body);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof InvalidRequest) return sendJson(res, 400, { status: "invalid", error: message });
        logger.error(`[playground-visual-edits] ${req.method} failed: ${message}`);
        if (res.headersSent) return next(error);
        sendJson(res, 500, { status: "invalid", error: message });
      }
    })();
  });
}
