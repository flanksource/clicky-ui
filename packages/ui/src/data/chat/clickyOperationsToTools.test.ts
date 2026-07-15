import { describe, expect, it } from "vitest";
import {
  clickyOperationsToTools,
  operationToTool,
} from "./clickyOperationsToTools";
import type {
  ClickySurface,
  OpenAPIOperation,
  ResolvedOperation,
} from "../../rpc/types";

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

const groupedXeroAccounts: OpenAPIOperation = {
  operationId: "xero_accounts_list",
  summary: "List Xero accounts",
  parameters: [],
  responses: {},
  "x-clicky": {
    surface: "xero-accounts",
    verb: "list",
    scope: "collection",
    group: "Xero Read",
  },
};

function resolve(
  op: OpenAPIOperation,
  method = "get",
  path = "/x",
): ResolvedOperation {
  return { path, method, operation: op };
}

describe("clickyOperationsToTools", () => {
  it("maps operationId to tool name and description, parameters to schema", () => {
    const [tool] = clickyOperationsToTools([resolve(listPods)]);
    expect(tool.name).toBe("listPods");
    expect(tool.description).toBe("List pods in a namespace");
    expect(tool.method).toBe("GET");
    expect(tool.path).toBe("/x");
    expect(tool.inputSchema?.properties.namespace).toEqual({
      type: "string",
      description: "namespace to scope to",
    });
    expect(tool.inputSchema?.properties.limit).toEqual({
      type: "integer",
      default: 50,
    });
    expect(tool.inputSchema?.required).toEqual(["namespace"]);
    expect(tool.inputSchema?.additionalProperties).toBe(false);
    expect(tool.strict).toBe(true);
    expect(tool.annotations).toMatchObject({
      title: "List pods",
      readOnlyHint: true,
      idempotentHint: true,
    });
  });

  it("derives the popover label and surface group from x-clicky metadata", () => {
    const tool = operationToTool(listOrders);
    expect(tool?.label).toBe("List");
    expect(tool?.group).toBe("orders");
  });

  it("uses x-clicky group as the preference key and applies group defaults", () => {
    const tool = operationToTool(groupedXeroAccounts);
    expect(tool?.group).toBe("Xero Read");
    expect(tool?.preferenceKey).toBe("Xero Read");
    expect(tool?.defaultPermission).toBe("off");
  });

  it("uses x-clicky tool hints for grouping, permission, parent, icon, strictness, and annotations", () => {
    const tool = operationToTool({
      ...groupedXeroAccounts,
      "x-clicky": {
        ...groupedXeroAccounts["x-clicky"]!,
        toolHints: {
          title: "Post invoice",
          group: "Billing",
          parent: "Accounting",
          icon: "receipt",
          defaultPermission: "ask",
          strict: false,
          readOnlyHint: false,
          destructiveHint: true,
          openWorldHint: true,
        },
      },
    });
    expect(tool).toMatchObject({
      group: "Billing",
      preferenceKey: "Billing",
      parent: "Accounting",
      icon: "receipt",
      defaultPermission: "ask",
      strict: false,
    });
    expect(tool?.annotations).toMatchObject({
      title: "Post invoice",
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    });
  });

  it("resolves parent title and entity from the matching x-clicky surface", () => {
    const surfaces: ClickySurface[] = [
      {
        key: "xero-accounts",
        entity: "accounts",
        title: "Xero Accounts",
        parent: "providers",
      },
    ];
    const [tool] = clickyOperationsToTools(
      [resolve(groupedXeroAccounts)],
      surfaces,
    );
    expect(tool.parent).toBe("Xero Accounts");
    expect(tool.entity).toBe("accounts");
    // The verb stays the leaf label; the parent disambiguates sibling verbs.
    expect(tool.label).toBe("List");
    expect(tool.group).toBe("Xero Read");
  });

  it("disambiguates sibling list tools by their resolved parent, not the verb", () => {
    const xeroContacts: OpenAPIOperation = {
      ...groupedXeroAccounts,
      operationId: "xero_contacts_list",
      summary: "List Xero contacts",
      "x-clicky": {
        ...groupedXeroAccounts["x-clicky"]!,
        surface: "xero-contacts",
      },
    };
    const surfaces: ClickySurface[] = [
      { key: "xero-accounts", entity: "accounts", title: "Xero Accounts" },
      { key: "xero-contacts", entity: "contacts", title: "Xero Contacts" },
    ];
    const tools = clickyOperationsToTools(
      [resolve(groupedXeroAccounts), resolve(xeroContacts)],
      surfaces,
    );
    expect(tools.map((t) => t.label)).toEqual(["List", "List"]);
    expect(tools.map((t) => t.parent)).toEqual([
      "Xero Accounts",
      "Xero Contacts",
    ]);
  });

  it("leaves parent undefined when no surfaces are provided", () => {
    const tool = operationToTool(groupedXeroAccounts);
    expect(tool?.parent).toBeUndefined();
  });

  it("skips operations in the Disabled group", () => {
    const disabled: OpenAPIOperation = {
      operationId: "auth_status",
      summary: "Auth status",
      responses: {},
      "x-clicky": { group: "Disabled" },
    };
    expect(operationToTool(disabled)).toBeNull();
    expect(clickyOperationsToTools([resolve(disabled)])).toEqual([]);
  });

  it("skips cobra help and completion operations", () => {
    const completion: OpenAPIOperation = {
      operationId: "completion_bash",
      summary: "Generate bash completion",
      responses: {},
    };
    const helpByCommand: OpenAPIOperation = {
      operationId: "accounts_help",
      summary: "Help for accounts",
      responses: {},
      "x-clicky": {
        command: "help/accounts",
        verb: "action",
        scope: "collection",
      },
    };
    expect(operationToTool(completion)).toBeNull();
    expect(
      clickyOperationsToTools([
        resolve(helpByCommand, "get", "/api/v1/help/accounts"),
      ]),
    ).toEqual([]);
  });

  it("infers xero, accounting, comments, and admin group defaults for hand-written routes", () => {
    expect(
      clickyOperationsToTools([
        resolve(
          { ...listPods, operationId: "providerAccountsList" },
          "get",
          "/api/v1/provider/accounts",
        ),
      ])[0],
    ).toMatchObject({
      group: "Xero Read",
      preferenceKey: "Xero Read",
      defaultPermission: "off",
    });
    expect(
      clickyOperationsToTools([
        resolve(
          { ...listPods, operationId: "providerAccountsCreate" },
          "post",
          "/api/v1/provider/accounts",
        ),
      ])[0],
    ).toMatchObject({
      group: "Xero Write",
      preferenceKey: "Xero Write",
      defaultPermission: "off",
    });
    expect(
      clickyOperationsToTools([
        resolve(
          { ...listPods, operationId: "accountMappingList" },
          "get",
          "/api/v1/accounts/mapping",
        ),
      ])[0],
    ).toMatchObject({
      group: "Accounting Read",
      defaultPermission: "on",
    });
    expect(
      clickyOperationsToTools([
        resolve(
          { ...listPods, operationId: "accountMappingUpdate" },
          "post",
          "/api/v1/accounts/mapping",
        ),
      ])[0],
    ).toMatchObject({
      group: "Accounting Metadata Write",
      defaultPermission: "ask",
    });
    expect(
      clickyOperationsToTools([
        resolve(
          { ...listPods, operationId: "transactionsCreate" },
          "post",
          "/api/v1/transactions",
        ),
      ])[0],
    ).toMatchObject({
      group: "Accounting Transaction Write",
      defaultPermission: "ask",
    });
    expect(
      clickyOperationsToTools([
        resolve(
          { ...listPods, operationId: "commentsList" },
          "get",
          "/api/v1/comments",
        ),
      ])[0],
    ).toMatchObject({
      group: "Comments Read",
      defaultPermission: "on",
    });
    expect(
      clickyOperationsToTools([
        resolve(
          { ...listPods, operationId: "commentsCreate" },
          "post",
          "/api/v1/comments",
        ),
      ])[0],
    ).toMatchObject({
      group: "Comments Write",
      defaultPermission: "ask",
    });
    expect(
      clickyOperationsToTools([
        resolve(
          { ...listPods, operationId: "rulesDefinitionSave" },
          "post",
          "/api/v1/rules/definitions",
        ),
      ])[0],
    ).toMatchObject({
      group: "Admin Write",
      defaultPermission: "ask",
    });
    expect(
      clickyOperationsToTools([
        resolve(
          { ...listPods, operationId: "rulesPreview" },
          "post",
          "/api/v1/rules/preview",
        ),
      ])[0],
    ).toMatchObject({
      group: "Admin Read",
      defaultPermission: "on",
    });
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
    expect(tool?.inputSchema?.properties.name).toEqual({
      type: "string",
      description: "pod name",
    });
    expect(tool?.inputSchema?.properties.image).toEqual({ type: "string" });
    expect(tool?.inputSchema?.additionalProperties).toBe(false);
    expect(tool?.strict).toBe(true);
  });

  it("marks delete operations with destructive and idempotent annotations", () => {
    const tool = operationToTool(
      {
        operationId: "deletePod",
        summary: "Delete pod",
        parameters: [],
        responses: {},
      },
      resolve(
        {
          operationId: "deletePod",
          summary: "Delete pod",
          parameters: [],
          responses: {},
        },
        "delete",
        "/api/v1/pods/{name}",
      ),
    );

    expect(tool?.annotations).toMatchObject({
      title: "Delete pod",
      destructiveHint: true,
      idempotentHint: true,
    });
  });

  it("skips operations without an operationId (no stable tool name)", () => {
    const anonymous: OpenAPIOperation = { summary: "x", responses: {} };
    expect(clickyOperationsToTools([resolve(anonymous)])).toEqual([]);
    expect(operationToTool(anonymous)).toBeNull();
  });
});
