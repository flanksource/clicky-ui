import { describe, expect, it } from "vitest";

import { COMMENT_TOOLS, type CommentTool } from "./comments-schema";
import { COMMENTS_ROUTE, matchRoute } from "./comments-server";
import { COMMENT_RATINGS, COMMENT_STATUSES } from "./comments-store";

/** The path a caller would actually request, with `{id}` filled in. */
function examplePath(tool: CommentTool): string {
  return tool.path.replace("{id}", "8b1f0d3e-0000-4000-8000-000000000000");
}

function relativePath(tool: CommentTool): string {
  // The middleware is mounted on COMMENTS_ROUTE, so it only ever sees the rest.
  return examplePath(tool).slice(COMMENTS_ROUTE.length) || "/";
}

describe("comments-schema", () => {
  it("describes every operation an agent needs", () => {
    expect(COMMENT_TOOLS.map((tool) => tool.name)).toEqual([
      "list_comments",
      "create_comment",
      "reply_to_comment",
      "resolve_comment",
      "update_comment",
      "delete_comment",
    ]);
  });

  it.each(COMMENT_TOOLS.map((tool) => [tool.name, tool] as const))(
    "%s is routed by the server",
    (_name, tool) => {
      expect(matchRoute(tool.method, relativePath(tool))).toBeDefined();
    },
  );

  it.each(COMMENT_TOOLS.map((tool) => [tool.name, tool] as const))(
    "%s is reachable under the comments route",
    (_name, tool) => {
      expect(tool.path.startsWith(COMMENTS_ROUTE)).toBe(true);
    },
  );

  it.each(COMMENT_TOOLS.map((tool) => [tool.name, tool] as const))(
    "%s only requires fields it declares",
    (_name, tool) => {
      const declared = Object.keys(tool.inputSchema.properties);
      expect(declared).toEqual(
        expect.arrayContaining(tool.inputSchema.required ?? []),
      );
    },
  );

  it.each(
    COMMENT_TOOLS.filter((tool) => tool.path.includes("{id}")).map(
      (tool) => [tool.name, tool] as const,
    ),
  )("%s requires the id its path interpolates", (_name, tool) => {
    expect(tool.inputSchema.required ?? []).toContain("id");
  });

  it.each(COMMENT_TOOLS.map((tool) => [tool.name, tool] as const))(
    "%s documents what it does",
    (_name, tool) => {
      expect(tool.description.length).toBeGreaterThan(20);
      expect(tool.label).not.toBe("");
    },
  );

  it("marks only the listing read-only", () => {
    expect(
      COMMENT_TOOLS.filter((tool) => tool.annotations.readOnlyHint).map(
        (tool) => tool.name,
      ),
    ).toEqual(["list_comments"]);
  });

  it("marks deletion destructive so a model treats it with care", () => {
    expect(
      COMMENT_TOOLS.filter((tool) => tool.annotations.destructiveHint).map(
        (tool) => tool.name,
      ),
    ).toEqual(["delete_comment"]);
  });

  it.each([
    ["create_comment", "status"],
    ["update_comment", "status"],
    ["resolve_comment", "status"],
  ])("%s enumerates the storable statuses for %s", (name, field) => {
    const tool = COMMENT_TOOLS.find((entry) => entry.name === name);
    expect(tool?.inputSchema.properties[field]?.enum).toEqual([
      ...COMMENT_STATUSES,
    ]);
  });

  it("tells a model that create and reply need an author", () => {
    for (const name of ["create_comment", "reply_to_comment"]) {
      const tool = COMMENT_TOOLS.find((entry) => entry.name === name);
      expect(tool?.inputSchema.required).toContain("author");
    }
  });

  it("documents the React element context required for anchored roots", () => {
    const create = COMMENT_TOOLS.find(
      (entry) => entry.name === "create_comment",
    );
    const element = create?.inputSchema.properties["element"];

    expect(element).toMatchObject({
      type: "object",
      required: ["source", "html"],
      additionalProperties: false,
    });
    expect(element?.properties).toHaveProperty("componentName");
    expect(create?.description).toContain("element context");
  });

  it.each(["create_comment", "update_comment"])(
    "%s enumerates positive and negative ratings",
    (name) => {
      const tool = COMMENT_TOOLS.find((entry) => entry.name === name);
      expect(tool?.inputSchema.properties["rating"]?.enum).toEqual([
        ...COMMENT_RATINGS,
      ]);
    },
  );
});
