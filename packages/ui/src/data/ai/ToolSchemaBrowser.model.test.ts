import { describe, expect, it } from "vitest";
import { matchesTool } from "../chat/tool-policy";
import type { ToolMeta } from "../chat/types";
import {
  directoryPermissionRule,
  type ToolSchemaViewMode,
} from "./ToolSchemaBrowser.model";

describe("directoryPermissionRule", () => {
  it.each(["group", "tree"] as ToolSchemaViewMode[])(
    "restricts incomplete children to their names in %s view",
    (view) => {
      const buckets: ToolMeta[][] = [
        [
          { name: "second", group: "Read" },
          { name: "first", group: "Read" },
        ],
        [{ name: "first", parent: "Accounts" }],
        [{ name: "first" }],
        [
          { name: "first", group: "Read" },
          { name: "second", group: "Read", parent: "General" },
        ],
        [
          { name: "first", parent: "Accounts" },
          { name: "second", parent: "Accounts", group: "Tools" },
        ],
      ];
      const siblings: ToolMeta[] = [
        { name: "sibling", group: "Read", parent: "Contacts" },
        { name: "other", group: "Write", parent: "Accounts" },
      ];
      for (const tools of buckets) {
        const rule = directoryPermissionRule({
          tools,
          view,
          depth: "child",
          policy: "allow",
        });
        expect(rule).toEqual({
          name: tools.map((tool) => tool.name).sort(),
          policy: "allow",
        });
        expect(tools.map((tool) => matchesTool(rule, tool))).toEqual(
          tools.map(() => true),
        );
        expect(siblings.map((tool) => matchesTool(rule, tool))).toEqual([
          false,
          false,
        ]);
      }
    },
  );

  it.each(["group", "tree"] as ToolSchemaViewMode[])(
    "keeps qualified child rules dynamic in %s view",
    (view) => {
      const rule = directoryPermissionRule({
        tools: [{ name: "list", group: "Read", parent: "Accounts" }],
        view,
        depth: "child",
        policy: "ask",
      });
      expect(rule).toEqual({
        group: "Read",
        parent: "Accounts",
        policy: "ask",
      });
      expect(
        matchesTool(rule, {
          name: "future",
          group: "Read",
          parent: "Accounts",
        }),
      ).toBe(true);
      expect(
        matchesTool(rule, {
          name: "sibling",
          group: "Read",
          parent: "Contacts",
        }),
      ).toBe(false);
    },
  );

  it.each([
    {
      view: "group" as const,
      tools: [
        { name: "list", group: "Read", parent: "Accounts" },
        { name: "get", group: "Read" },
      ],
      expected: { group: "Read", policy: "ask" },
    },
    {
      view: "tree" as const,
      tools: [
        { name: "list", group: "Read", parent: "Accounts" },
        { name: "get", parent: "Accounts" },
      ],
      expected: { parent: "Accounts", policy: "ask" },
    },
    {
      view: "group" as const,
      tools: [{ name: "list" }, { name: "get", group: "Tools" }],
      expected: { name: ["get", "list"], policy: "ask" },
    },
    {
      view: "tree" as const,
      tools: [{ name: "list" }, { name: "get", parent: "General" }],
      expected: { name: ["get", "list"], policy: "ask" },
    },
  ])(
    "uses only the complete outer facet for $view sections",
    ({ view, tools, expected }) => {
      expect(
        directoryPermissionRule({
          tools,
          view,
          depth: "section",
          policy: "ask",
        }),
      ).toEqual(expected);
    },
  );
});
