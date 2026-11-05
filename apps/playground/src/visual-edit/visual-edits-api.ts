import {
  VISUAL_EDITS_ROUTE,
  type VisualEditRequest,
  type VisualEditResponse,
} from "../../plugins/visual-edits-contract";

const STATUS_FOR: Record<VisualEditResponse["status"], number> = {
  applied: 200,
  stale: 409,
  refused: 422,
  ambiguous: 422,
  invalid: 400,
};

export async function postVisualEdit(request: VisualEditRequest): Promise<VisualEditResponse> {
  const response = await fetch(VISUAL_EDITS_ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!(response.headers.get("content-type") ?? "").includes("application/json")) {
    throw new Error(
      "Visual edits require a live playground server. Start `pnpm run playground:prod` or `pnpm run dev:playground`.",
    );
  }
  const payload = (await response.json()) as VisualEditResponse;
  if (STATUS_FOR[payload.status] !== response.status) {
    throw new Error(
      `POST ${VISUAL_EDITS_ROUTE} returned HTTP ${response.status} with status ${JSON.stringify(payload.status)}: ${JSON.stringify(payload)}`,
    );
  }
  return payload;
}
