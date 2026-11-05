import { randomUUID } from "node:crypto";
import type { StoredAuthor, StoredComment } from "./comments-store";

export function requireText(
  body: Record<string, unknown>,
  key: string,
): string {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`"${key}" is required and must be a non-empty string`);
  }
  return value;
}

/**
 * Authorship is never inferred: a reply that silently shows up as "You" when an
 * agent wrote it is worse than a 400 naming the missing field.
 */
export function requireAuthor(body: Record<string, unknown>): StoredAuthor {
  return parseAuthor(body["author"], "author");
}

function parseAuthor(
  value: unknown,
  field: "author" | "assignee",
): StoredAuthor {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(
      `"${field}" is required, e.g. {"name":"Claude","kind":"agent"}`,
    );
  }
  const candidate = value as Record<string, unknown>;
  const name = candidate["name"];
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error(
      `"${field}.name" is required and must be a non-empty string`,
    );
  }
  const kind = candidate["kind"];
  if (kind !== undefined && kind !== "user" && kind !== "agent") {
    throw new Error(`"${field}.kind" must be "user" or "agent"`);
  }
  const via = optionalAuthorText(candidate, "via", field);
  const sessionId = optionalAuthorText(candidate, "sessionId", field);
  const cost = candidate["cost"];
  if (
    cost !== undefined &&
    (typeof cost !== "number" || !Number.isFinite(cost) || cost < 0)
  ) {
    throw new Error(`"${field}.cost" must be a non-negative number of USD`);
  }
  return {
    name,
    ...(kind === undefined ? {} : { kind }),
    ...(via === undefined ? {} : { via }),
    ...(sessionId === undefined ? {} : { sessionId }),
    ...(cost === undefined ? {} : { cost }),
  };
}

function optionalAuthorText(
  author: Record<string, unknown>,
  key: "via" | "sessionId",
  field: string,
): string | undefined {
  const value = author[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `"${field}.${key}" must be a non-empty string when present`,
    );
  }
  return value;
}

/** `null` clears the assignee; omitting the field is a caller bug, not a clear. */
export function requireAssignee(
  body: Record<string, unknown>,
): StoredAuthor | null {
  if (!("assignee" in body)) {
    throw new Error(
      '"assignee" is required: an object like {"name":"Claude","kind":"agent"}, or null to unassign',
    );
  }
  return body["assignee"] === null
    ? null
    : parseAuthor(body["assignee"], "assignee");
}

export function optionalText(
  body: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = body[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new Error(`"${key}" must be a string`);
  return value;
}

export function assertOnlyFields(
  body: Record<string, unknown>,
  allowed: readonly string[],
): void {
  const unexpected = Object.keys(body).find((key) => !allowed.includes(key));
  if (unexpected) {
    throw new Error(
      `request body has unexpected field ${JSON.stringify(unexpected)}`,
    );
  }
}

/** The server owns identity and creation time so two callers cannot collide. */
export function draft(
  body: Record<string, unknown>,
  text: string,
): StoredComment {
  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    body: text,
    author: requireAuthor(body),
  };
}
