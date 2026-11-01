// @vitest-environment node
import type { FilterTreeNode } from "@flanksource/clicky-ui";
import { describe, expect, it } from "vitest";

import { EXTERNAL_PAGES_ROOT } from "./dashboard-model";
import { pageTreeNodes } from "./dashboard-filters";

const externalId = "external:0b8e3c1a-2f4d-4c1e-9a77-5d3f2a1b6c90";

const shape = (nodes: FilterTreeNode[]): unknown[] =>
  nodes.map(({ key, label, children }) => ({
    key,
    label,
    ...(children ? { children: shape(children) } : {}),
  }));

describe("pageTreeNodes", () => {
  const slugs = [
    "zz-unregistered/overview",
    "zz-unregistered/merivio/approval-evidence",
    "zz-unregistered/merivio/audit",
    externalId,
  ];

  it("nests slugs into folders, folders first, with external pages under the synthetic root", () => {
    expect(shape(pageTreeNodes(slugs, []))).toEqual([
      {
        key: EXTERNAL_PAGES_ROOT,
        label: "External pages",
        children: [{ key: `${EXTERNAL_PAGES_ROOT}/${externalId}`, label: externalId }],
      },
      {
        key: "zz-unregistered",
        label: "Zz unregistered",
        children: [
          {
            key: "zz-unregistered/merivio",
            label: "Merivio",
            children: [
              {
                key: "zz-unregistered/merivio/approval-evidence",
                label: "zz-unregistered/merivio/approval-evidence",
              },
              {
                key: "zz-unregistered/merivio/audit",
                label: "zz-unregistered/merivio/audit",
              },
            ],
          },
          {
            key: "zz-unregistered/overview",
            label: "zz-unregistered/overview",
          },
        ],
      },
    ]);
  });

  it("describes a page node with its slug, not the tree key", () => {
    const external = pageTreeNodes(slugs, [])[0]?.children?.[0];
    expect(external?.description).toBe(externalId);
  });

  it("keeps a selected key that matches no page as a removable raw-key node", () => {
    const nodes = pageTreeNodes(slugs, ["retired/old-page"]);
    const retired = nodes.find((node) => node.key === "retired");
    expect(shape(retired?.children ?? [])).toEqual([
      { key: "retired/old-page", label: "retired/old-page" },
    ]);
  });

  it("does not duplicate a selected folder key that already exists in the tree", () => {
    const nodes = pageTreeNodes(slugs, ["zz-unregistered", EXTERNAL_PAGES_ROOT]);
    expect(nodes.map((node) => node.key)).toEqual([
      EXTERNAL_PAGES_ROOT,
      "zz-unregistered",
    ]);
  });
});
