import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { JsonSchemaObject } from "../components/json-schema-form-types";
import { SchemaViewer } from "./SchemaViewer";
import { buildSchemaTree, buildStepBranchTree } from "./schema-viewer-model";

const THEN = String.fromCharCode(116, 104, 101, 110);

const PLAIN_SCHEMA: JsonSchemaObject = {
  type: "object",
  properties: {
    name: { type: "string", description: "Display name" },
    settings: { type: "object", additionalProperties: { type: "string" } },
    servers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          host: { type: "string" },
          port: { type: "integer" },
        },
      },
    },
  },
};

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    setup: {
      type: "object",
      properties: {
        scheme: {
          type: "object",
          properties: {
            fields: {
              type: "object",
              properties: {
                ProductCode: {
                  type: "string",
                  "x-oipa-type": "Text",
                  "x-oipa-ascode": "Product",
                  description: "Product code @oipa-query SQL SELECT Code FROM AsCode",
                },
              },
            },
          },
        },
      },
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        oneOf: [
          {
            required: ["client"],
            properties: {
              client: {
                type: "object",
                required: ["activity"],
                properties: {
                  activity: { type: "string", enum: ["CreateClient"] },
                  input: { type: "object" },
                  user: { type: "string" },
                },
                allOf: [
                  {
                    if: { properties: { activity: { const: "CreateClient" } } },
                    [THEN]: {
                      properties: {
                        input: {
                          type: "object",
                          properties: {
                            FirstName: { type: "string", description: "Given name" },
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
          {
            required: ["policy"],
            properties: {
              policy: {
                type: "object",
                properties: {
                  roles: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        ],
      },
    },
    plan: { type: "string" },
  },
} as unknown as JsonSchemaObject;

const REF_SCHEMA = {
  type: "object",
  properties: {
    item: { $ref: "#/$defs/Item" },
  },
  $defs: {
    Item: {
      type: "object",
      properties: {
        Name: { type: "string" },
      },
    },
  },
} as unknown as JsonSchemaObject;

describe("buildSchemaTree", () => {
  it("renders ordinary JSON Schema objects as a field tree", () => {
    const roots = buildSchemaTree(PLAIN_SCHEMA);

    expect(roots.map((node) => node.label)).toEqual(["name", "settings", "servers"]);
    expect(roots.find((node) => node.label === "settings")?.children?.[0]).toMatchObject({
      label: "(any key)",
      badge: "string",
    });
    expect(roots.find((node) => node.label === "servers")?.children?.map((node) => node.label)).toEqual([
      "host",
      "port",
    ]);
  });

  it("keeps the OIPA TestPlan setup and activity branch shape", () => {
    const roots = buildSchemaTree(PLAN_SCHEMA);

    expect(roots.map((node) => node.label)).toEqual(["Setup", "Steps", "plan"]);
    expect(roots[0].children?.[0]).toMatchObject({
      label: "scheme fields",
      badge: "fields",
      count: 1,
    });

    const [clientBranch] = buildStepBranchTree(PLAN_SCHEMA, "client", true);
    expect(clientBranch).toMatchObject({
      label: "activity - client",
      badge: "branch",
      count: 1,
    });
    expect(clientBranch.children?.map((node) => node.label)).toEqual([
      "CreateClient",
      "(common fields)",
    ]);
  });
});

describe("SchemaViewer", () => {
  it("rehydrates local refs before rendering", () => {
    render(<SchemaViewer schema={REF_SCHEMA} showControls={false} />);

    expect(screen.getByText("item")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("opens annotated fields into the copied metadata panel", () => {
    render(<SchemaViewer schema={PLAN_SCHEMA} showControls={false} defaultOpenDepth={4} />);

    fireEvent.click(screen.getByText("ProductCode"));

    expect(screen.getByText("OIPA type")).toBeInTheDocument();
    expect(screen.getAllByText("Text").length).toBeGreaterThan(0);
    expect(screen.getByText("AsCode")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Query")).toBeInTheDocument();
    expect(screen.getByText("SELECT Code FROM AsCode")).toBeInTheDocument();
  });
});
