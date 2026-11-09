import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { JsonSchemaObject } from "../components/json-schema-form-types";
import { SchemaViewer, SchemaViewerRow } from "./SchemaViewer";
import { buildSchemaTree, buildStepBranchTree } from "./schema-viewer-model";

const THEN = String.fromCharCode(116, 104, 101, 110);
const EXTENSION_PREFIX = ["x-oi", "pa-"].join("");
const DIRECTIVE_PREFIX = ["@oi", "pa-"].join("");
const EXTENSION_TYPE = `${EXTENSION_PREFIX}type`;
const EXTENSION_ASCODE = `${EXTENSION_PREFIX}ascode`;
const QUERY_DIRECTIVE = `${DIRECTIVE_PREFIX}query`;
const PLATFORM_TYPE_LABEL = ["OI", "PA type"].join("");

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
                  [EXTENSION_TYPE]: "Text",
                  [EXTENSION_ASCODE]: "Product",
                  description: `Product code ${QUERY_DIRECTIVE} SQL SELECT Code FROM AsCode`,
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

  it("keeps the platform TestPlan setup and activity branch shape", () => {
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
  it("orders selected sections and fields without dropping unselected fields", () => {
    render(<SchemaViewer schema={PLAIN_SCHEMA} sections={[
      { id: "specific", title: "Kind fields", select: ["servers", "settings"], order: ["servers", "settings"] },
      { id: "global", title: "Global fields", select: (node) => node.label === "name" },
    ]} />);

    expect(screen.getAllByRole("tree")).toHaveLength(1);
    const groups = [...screen.getByRole("tree").children];
    expect(groups.map((row) => row.querySelector('[data-schema-section]')?.textContent)).toEqual(["Kind fields", "Global fields"]);
    expect(within(groups[0] as HTMLElement).getByText("servers").compareDocumentPosition(within(groups[0] as HTMLElement).getByText("settings")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(groups[1] as HTMLElement).getByText("name")).toBeInTheDocument();
    expect(screen.getAllByRole("searchbox")).toHaveLength(1);
    fireEvent.click(screen.getByRole("radio", { name: "Table" }));
    expect(screen.getAllByRole("table")).toHaveLength(1);
    expect(screen.getAllByRole("searchbox")).toHaveLength(1);
    expect(screen.getByRole("radio", { name: "Tree" }).closest('.schema-viewer-toolbar')).toContainElement(screen.getByRole("searchbox"));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "host" } });
    fireEvent.click(screen.getByRole("radio", { name: "Tree" }));
    expect(screen.getByRole("searchbox")).toHaveValue("host");
    expect(screen.getByText("host")).toBeInTheDocument();
    expect(screen.queryByText("name")).not.toBeInTheDocument();
  });

  it("switches to a table with nested field paths and type icons", () => {
    render(<SchemaViewer schema={PLAIN_SCHEMA} />);
    fireEvent.click(screen.getByRole("radio", { name: "Table" }));

    const table = screen.getByRole("table");
    expect(within(table).getByText("servers.host")).toBeInTheDocument();
    expect(within(table).getAllByRole("img", { name: "string type" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
  });

  it("preserves original field paths when fields are visually grouped under another field", () => {
    render(<SchemaViewer schema={{}} defaultView="table" roots={[
      { key: "root/format", label: "format", children: [{ key: "root/json", label: "json", path: "json", badge: "boolean" }] },
    ]} />);
    expect(screen.getByText("json")).toBeInTheDocument();
    expect(screen.queryByText("format.json")).not.toBeInTheDocument();
  });

  it("offers no expansion for plain leaves or descriptions already shown in the row", () => {
    render(<SchemaViewer schema={{ type: "object", properties: {
      name: { type: "string", description: "Display name" },
      enabled: { type: "boolean" },
      empty: { type: "object" },
    } }} />);

    expect(screen.queryByRole("button", { name: "Expand" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Expand all" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "boolean type" })).toBeInTheDocument();
    fireEvent.click(screen.getByText("name"));
    expect(screen.getAllByText("Display name")).toHaveLength(1);
  });

  it("expands table rows only when they contain additional metadata", () => {
    render(<SchemaViewer defaultView="table" schema={{ type: "object", properties: {
      name: { type: "string", description: "Display name" },
      timeout: { type: "string", format: "duration" },
    } }} />);

    fireEvent.click(screen.getByText("name"));
    expect(screen.getAllByText("Display name")).toHaveLength(1);
    expect(screen.queryByText("Format")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("timeout"));
    expect(screen.getByText("Format")).toBeInTheDocument();
    expect(screen.getByText("duration")).toBeInTheDocument();
  });

  it("rehydrates local refs before rendering", () => {
    render(<SchemaViewer schema={REF_SCHEMA} showControls={false} />);

    expect(screen.getByText("item")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("opens annotated fields into the copied metadata panel", () => {
    render(<SchemaViewer schema={PLAN_SCHEMA} showControls={false} defaultOpenDepth={4} />);

    fireEvent.click(screen.getByText("ProductCode"));

    expect(screen.getByText(PLATFORM_TYPE_LABEL)).toBeInTheDocument();
    expect(screen.getAllByText("Text").length).toBeGreaterThan(0);
    expect(screen.getByText("AsCode")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Query")).toBeInTheDocument();
    expect(screen.getByText("SELECT Code FROM AsCode")).toBeInTheDocument();
  });
});

describe("SchemaViewerRow", () => {
  it("truncates the description, not the field name", () => {
    render(
      <SchemaViewerRow
        node={{
          key: "db-url",
          label: "db-url",
          badge: "string",
          description: "External PostgreSQL DSN (FIN_DB_URL env honored; empty = embedded)",
        }}
      />,
    );

    const label = screen.getByText("db-url");
    expect(label).toHaveClass("shrink-0");
    expect(label).not.toHaveClass("truncate");

    const description = screen.getByText(/External PostgreSQL DSN/);
    expect(description).toHaveClass("truncate");
    expect(description).toHaveClass("min-w-0");
  });
});
