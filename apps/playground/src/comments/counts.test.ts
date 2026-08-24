import {
  DEFAULT_COMMENT_STATUSES,
  type CommentConfig,
} from "@flanksource/clicky-ui/comments";
import { describe, expect, it } from "vitest";

import { countOpenCommentsByPage } from "./counts";
import type { PageComment } from "./useComments";

const config: CommentConfig = { statuses: DEFAULT_COMMENT_STATUSES };

function comment(
  id: string,
  page: string,
  status: string,
  parentId?: string,
): PageComment {
  return {
    id,
    page,
    status,
    body: id,
    createdAt: "2026-01-01T00:00:00.000Z",
    author: { name: "Ada" },
    ...(parentId ? { parentId } : {}),
  };
}

describe("countOpenCommentsByPage", () => {
  it("counts unresolved roots while excluding replies and resolved or closed roots", () => {
    expect([
      ...countOpenCommentsByPage(
        [
          comment("open", "welcome", "open"),
          comment("progress", "welcome", "in_progress"),
          comment("resolved", "welcome", "resolved"),
          comment("closed", "makerprint/scad-studio", "closed"),
          comment("reply", "welcome", "open", "open"),
          comment("maker-open", "makerprint/scad-studio", "open"),
        ],
        config,
      ),
    ]).toEqual([
      ["welcome", 2],
      ["makerprint/scad-studio", 1],
    ]);
  });
});
