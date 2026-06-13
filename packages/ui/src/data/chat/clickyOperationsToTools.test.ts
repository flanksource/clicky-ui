import { describe, expect, it } from "vitest";
import { clickyOperationsToTools, operationToTool } from "./clickyOperationsToTools";
import type { OpenAPIOperation, ResolvedOperation } from "../../rpc/types";

const listPods: OpenAPIOperation = {
  operationId: "listPods",
  summary: "List pods",
  description: "List pods in a namespace",
  parameters: [
    {
      name: "namespace",
      in: "query",
      required: true,
      schema: { type: "string" },
      description: "namespace to scope to",
    },
    {
      name: "limit",
      in: "query",
      schema: { type: "integer", default: 50 },
    },
  ],
  responses: {},
};

const createPod: OpenAPIOperation = {
  operationId: "createPod",
  summary: "Create pod",
  parameters: [],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            name: { type: "string", description: "pod name" },
            image: { type: "string" },
          },
        },
      },
    },
  },
  responses: {},
};

const listOrders: OpenAPIOperation = {
  operationId: "orders_list",
  summary: "List orders",
  parameters: [],
  responses: {},
  "x-clicky": { surface: "orders", verb: "list", scope: "collection" },
};

function resolve(op: OpenAPIOperation, method = "get", path = "/x"): ResolvedOperation {
  return { path, method, operation: op };
}

describe("clickyOperationsToTools", () => {
  it("maps operationId to tool name and description, parameters to schema", () => {
    const [tool] = clickyOperationsToTools([resolve(listPods)]);
    expect(tool.name).toBe("listPods");
    expect(tool.description).toBe("List pods in a namespace");
    expect(tool.inputSchema?.properties.namespace).toEqual({
      type: "string",
      description: "namespace to scope to",
    });
    expect(tool.inputSchema?.properties.limit).toEqual({ type: "integer", default: 50 });
    expect(tool.inputSchema?.required).toEqual(["namespace"]);
  });

  it("derives the popover label and surface group from x-clicky metadata", () => {
    const tool = operationToTool(listOrders);
    expect(tool?.label).toBe("List");
    expect(tool?.group).toBe("orders");
  });

  it("labels from the summary and omits group when x-clicky is absent", () => {
    const tool = operationToTool(listPods);
    expect(tool?.label).toBe("List pods");
    expect(tool?.group).toBeUndefined();
  });

  it("falls back to summary when description is absent", () => {
    const tool = operationToTool(createPod);
    expect(tool?.description).toBe("Create pod");
  });

  it("merges requestBody properties into the input schema", () => {
    const tool = operationToTool(createPod);
    expect(tool?.inputSchema?.properties.name).toEqual({ type: "string", description: "pod name" });
    expect(tool?.inputSchema?.properties.image).toEqual({ type: "string" });
  });

  it("skips operations without an operationId (no stable tool name)", () => {
    const anonymous: OpenAPIOperation = { summary: "x", responses: {} };
    expect(clickyOperationsToTools([resolve(anonymous)])).toEqual([]);
    expect(operationToTool(anonymous)).toBeNull();
  });
});
