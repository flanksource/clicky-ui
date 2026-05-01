import { OperationActionDialog } from "@flanksource/clicky-ui";
import type {
  ExecutionResponse,
  OpenAPISpec,
  OperationsApiClient,
  ResolvedOperation,
} from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

const RESTART_OPERATION: ResolvedOperation = {
  path: "/api/v1/services/{name}/restart",
  method: "post",
  operation: {
    operationId: "restartService",
    summary: "Restart service",
    description: "Trigger a graceful restart of the named service. Useful for picking up rotated config.",
    tags: ["services"],
    parameters: [
      {
        name: "name",
        in: "path",
        required: true,
        description: "Service identifier",
        schema: { type: "string" },
      },
      {
        name: "force",
        in: "query",
        description: "Skip the graceful drain step",
        schema: { type: "boolean", default: false },
      },
    ],
    responses: { "202": { description: "Accepted" } },
  },
};

const DELETE_OPERATION: ResolvedOperation = {
  path: "/api/v1/widgets/{id}",
  method: "delete",
  operation: {
    operationId: "deleteWidget",
    summary: "Delete widget",
    description: "Permanently remove a widget. This is irreversible.",
    tags: ["widgets"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        description: "Widget id",
        schema: { type: "string" },
      },
    ],
    responses: { "204": { description: "Deleted" } },
  },
};

const FAKE_CLIENT: OperationsApiClient = {
  async getOpenAPISpec(): Promise<OpenAPISpec> {
    return { openapi: "3.0.0", info: { title: "demo", version: "0" }, paths: {} };
  },
  async executeCommand(
    path,
    method,
    params,
  ): Promise<ExecutionResponse> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const cli = `${method.toUpperCase()} ${path} ${JSON.stringify(params)}`;
    return {
      success: true,
      message: "Command accepted",
      stdout: `Pretending to run:\n  ${cli}\n\nResult: ok`,
      exit_code: 0,
      cli,
      contentType: "text/plain",
      input: { args: [], flags: params },
    };
  },
};

export function OperationDialogsDemo() {
  return (
    <DemoSection
      id="operation-dialogs"
      title="OperationActionDialog"
      description="Modal launcher used by clicky-rpc surfaces to execute an OpenAPI operation. Uses a stubbed client that fakes a 600ms round-trip."
    >
      <DemoRow label="Service action">
        <OperationActionDialog
          operation={RESTART_OPERATION}
          client={FAKE_CLIENT}
          initialValues={{ name: "billing-api" }}
          label="Restart billing-api"
        />
      </DemoRow>
      <DemoRow label="Destructive">
        <OperationActionDialog
          operation={DELETE_OPERATION}
          client={FAKE_CLIENT}
          initialValues={{ id: "wgt_42" }}
          label="Delete wgt_42"
        />
      </DemoRow>
    </DemoSection>
  );
}
