import { describe, expect, it } from "vitest";
import { APP_LOADER, CLASSES } from "../fixtures/classes";
import type { JvmClassRef } from "../protocol/types";
import { buildClassTree, classSimpleName, findClassNode, type ClassTreeNode } from "./class-tree";

const shape = (nodes: ClassTreeNode[]): unknown[] =>
  nodes.map((node) => (node.ref ? node.name : { [`${node.name} (${node.count})`]: shape(node.children) }));

describe("buildClassTree", () => {
  it("nests classes under their dotted packages, packages before classes, each level alphabetical", () => {
    expect(shape(buildClassTree([...CLASSES].reverse()))).toEqual([
      {
        "com (9)": [
          {
            "example (9)": [
              {
                "orders (7)": [
                  { "model (2)": ["LineItem", "Order"] },
                  "Inventory",
                  "Ledger",
                  "OrderController",
                  "OrderService",
                  "PriceCalculator",
                ],
              },
              { "payments (2)": ["PaymentClient", "PaymentClient$Retry"] },
            ],
          },
        ],
      },
    ]);
  });

  it("keys a class by name and loader so the same class in two loaders stays two rows", () => {
    const refs: JvmClassRef[] = [
      { name: "com.example.Shared", loader: "aaaa1111" },
      { name: "com.example.Shared", loader: "bbbb2222" },
    ];
    const leaves = buildClassTree(refs)[0]!.children[0]!.children;
    expect(leaves.map((leaf) => leaf.key)).toEqual(["com.example.Shared@aaaa1111", "com.example.Shared@bbbb2222"]);
    expect(leaves.map((leaf) => leaf.ref)).toEqual(refs);
  });

  it("lists a class in the default package at the root, after the packages", () => {
    expect(shape(buildClassTree([{ name: "Main", loader: APP_LOADER }, { name: "org.acme.Util", loader: APP_LOADER }]))).toEqual([
      { "org (1)": [{ "acme (1)": ["Util"] }] },
      "Main",
    ]);
  });

  it("lists a class once when paging returned it twice", () => {
    const ref = { name: "com.example.Once", loader: APP_LOADER };
    expect(buildClassTree([ref, ref])[0]!.count).toBe(1);
  });

  it("rejects a class with no name instead of dropping it", () => {
    expect(() => buildClassTree([{ name: "  ", loader: APP_LOADER }])).toThrow("empty class name");
  });
});

describe("findClassNode", () => {
  const roots = buildClassTree(CLASSES);

  it("finds the leaf of a class in its loader", () => {
    expect(findClassNode(roots, { name: "com.example.orders.model.Order", loader: APP_LOADER })?.key).toBe(`com.example.orders.model.Order@${APP_LOADER}`);
  });

  it.each([
    ["a class in another loader", { name: "com.example.orders.Ledger", loader: "bootstrap" }],
    ["a package name", { name: "com.example.orders", loader: APP_LOADER }],
    ["an unknown class", { name: "com.example.Missing", loader: APP_LOADER }],
  ])("returns null for %s", (_name, ref) => {
    expect(findClassNode(roots, ref)).toBeNull();
  });
});

describe("classSimpleName", () => {
  it.each([
    ["com.example.orders.OrderService", "OrderService"],
    ["com.example.payments.PaymentClient$Retry", "PaymentClient$Retry"],
    ["Main", "Main"],
  ])("%s -> %s", (name, expected) => {
    expect(classSimpleName(name)).toBe(expected);
  });
});
