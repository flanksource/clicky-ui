import { ApiExplorer } from "@flanksource/clicky-ui/api-explorer";
import { DemoSection } from "./Section";

const SAMPLE_OPENAPI_SPEC = {
  openapi: "3.0.0",
  info: {
    title: "Kitchen Sink Demo API",
    description: "An inline OpenAPI spec used to demo the ApiExplorer subpath export.",
    version: "1.0.0",
  },
  servers: [{ url: "https://demo.example.com" }],
  tags: [
    { name: "widgets", description: "Manage widgets in the demo store." },
    { name: "health", description: "Liveness probes." },
  ],
  paths: {
    "/widgets": {
      get: {
        tags: ["widgets"],
        summary: "List widgets",
        operationId: "listWidgets",
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 25 },
            description: "Page size",
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Widget" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["widgets"],
        summary: "Create a widget",
        operationId: "createWidget",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Widget" },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/health": {
      get: {
        tags: ["health"],
        summary: "Liveness probe",
        operationId: "health",
        responses: { "200": { description: "Alive" } },
      },
    },
  },
  components: {
    schemas: {
      Widget: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "string", example: "wgt_42" },
          name: { type: "string", example: "Hex bolt" },
          quantity: { type: "integer", example: 100 },
        },
      },
    },
  },
};

export function ApiExplorerDemo() {
  return (
    <DemoSection
      id="api-explorer"
      title="ApiExplorer"
      description={
        <>
          Wraps Scalar's <code>ApiReferenceReact</code>. Imported from the{" "}
          <code>@flanksource/clicky-ui/api-explorer</code> subpath so the main bundle stays free of{" "}
          <code>@scalar/api-reference-react</code>.
        </>
      }
    >
      <div className="h-[640px] overflow-hidden rounded-md border border-border">
        <ApiExplorer configuration={{ content: SAMPLE_OPENAPI_SPEC }} />
      </div>
    </DemoSection>
  );
}
