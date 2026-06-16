import type { ClickyDocument, ClickyNode, ClickyProps } from "./Clicky";

export type ParsedClicky =
  | { ok: true; document: ClickyDocument }
  | { ok: false; message: string; raw: string };

export function parseClickyData(data: ClickyProps["data"]): ParsedClicky {
  if (typeof data === "string") {
    try {
      return normalizeClickyDocument(JSON.parse(data) as unknown);
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error ? error.message : "Failed to parse JSON",
        raw: data,
      };
    }
  }

  return normalizeClickyDocument(data);
}

function normalizeClickyDocument(data: unknown): ParsedClicky {
  if (!data || typeof data !== "object") {
    return {
      ok: false,
      message: "Payload must be an object",
      raw: String(data ?? ""),
    };
  }

  const candidate = data as Partial<ClickyDocument> & Partial<ClickyNode>;
  if (
    "version" in candidate &&
    candidate.version === 1 &&
    candidate.node &&
    isClickyNode(candidate.node)
  ) {
    return { ok: true, document: candidate as ClickyDocument };
  }

  if (isClickyNode(candidate)) {
    return { ok: true, document: { version: 1, node: candidate } };
  }

  return {
    ok: false,
    message: "Payload is neither a Clicky document nor a Clicky node",
    raw: JSON.stringify(data, null, 2),
  };
}

function isClickyNode(value: unknown): value is ClickyNode {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { kind?: unknown }).kind === "string"
  );
}
