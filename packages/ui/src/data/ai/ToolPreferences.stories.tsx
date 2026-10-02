import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { MOCK_MODELS } from "../chat/Chat.fixtures";
import type { ChatBudgetConfig } from "../chat/types";
import {
  ToolPreferences,
  type ClaudePermissionMode,
  type ToolMeta,
  type ToolPolicy,
} from "./ToolPreferences";
import {
  toolPolicyFromPreferences,
  type PermissionPolicy,
  type PermissionRule,
} from "../chat/tool-policy";
import { effectiveToolPolicies, withUserRule } from "./ToolPreferences.model";

const SAMPLE_TOOLS: ToolMeta[] = [
  {
    name: "xero_accounts_list",
    label: "List Xero accounts",
    group: "Xero",
    preferenceKey: "Xero Read",
    defaultPermission: "deny",
    description: "List account balances from Xero.",
    hints: [
      "Read-only accounting lookup.",
      "Use a tenant id when multiple Xero connections are available.",
    ],
    source: "clicky",
    method: "GET",
    path: "/api/xero/accounts",
    strict: true,
    annotations: {
      title: "List Xero accounts",
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: "object",
      properties: {
        tenantId: {
          type: "string",
          description: "Connected Xero tenant id.",
        },
        includeArchived: {
          type: "boolean",
          description: "Include archived accounts.",
        },
      },
      required: ["tenantId"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        accounts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              code: { type: "string" },
              name: { type: "string" },
              balance: { type: "number" },
            },
          },
        },
      },
    },
  },
  {
    name: "xero_contacts_list",
    label: "List Xero contacts",
    group: "Xero",
    preferenceKey: "Xero Read",
    defaultPermission: "deny",
    description: "List customer and supplier contacts from Xero.",
    source: "clicky",
    method: "GET",
    path: "/api/xero/contacts",
    inputSchema: {
      type: "object",
      properties: {
        tenantId: { type: "string" },
        query: {
          type: "string",
          description: "Optional contact-name search.",
        },
      },
      required: ["tenantId"],
    },
  },
  {
    name: "sync_finance",
    label: "Sync finance",
    group: "Admin Write",
    defaultPermission: "ask",
    description: "Start a financial data sync for the selected organization.",
    hints: ["Write operation; prefer Default or Ask in shared environments."],
    source: "clicky",
    method: "POST",
    path: "/api/sync/finance",
    inputSchema: {
      type: "object",
      properties: {
        organizationId: { type: "string" },
        period: {
          type: "string",
          enum: ["month", "quarter", "year"],
        },
        force: {
          type: "boolean",
          description: "Run even if a recent sync exists.",
        },
      },
      required: ["organizationId", "period"],
    },
  },
  {
    name: "search_docs",
    label: "Search docs",
    group: "Knowledge",
    defaultPermission: "allow",
    description: "Search the internal documentation index.",
    hints: ["Quote exact phrases for narrower results."],
    source: "mcp",
    server: "docs",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query.",
        },
        limit: {
          type: "integer",
          description: "Maximum result count.",
          default: 5,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "filesystem_write",
    label: "Filesystem write",
    group: "MCP Servers",
    preferenceKey: "Filesystem Write",
    defaultPermission: "ask",
    description: "Write generated output to the mounted workspace.",
    hints: ["Requires an explicit workspace path."],
    source: "mcp",
    server: "filesystem",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        content: {
          type: "string",
          description: "File contents to write.",
        },
      },
      required: ["path", "content"],
    },
  },
];

const INITIAL_PREFS: Record<string, ToolPolicy> = {
  filesystem_write: "ask",
  xero_accounts_list: "deny",
  xero_contacts_list: "deny",
  search_docs: "allow",
  sync_finance: "ask",
};

const INITIAL_RULE_COUNT = toolPolicyFromPreferences(INITIAL_PREFS).length;

const INITIAL_BUDGET: ChatBudgetConfig = {
  cost: 0.25,
  maxTokens: 8000,
};

type ToolPreferencesStoryProps = {
  initialValue?: Record<string, ToolPolicy>;
};

function ToolPreferencesStory({
  initialValue = INITIAL_PREFS,
}: ToolPreferencesStoryProps) {
  const [rules, setRules] = useState<PermissionPolicy>(() =>
    toolPolicyFromPreferences(initialValue),
  );
  const prefs = effectiveToolPolicies({
    tools: SAMPLE_TOOLS,
    userRules: rules,
    fallback: "ask",
  });
  const handleRule = (rule: PermissionRule) =>
    setRules((current) => withUserRule(current, rule));
  const [model, setModel] = useState<string | undefined>(MOCK_MODELS[0]?.id);
  const [reasoningEffort, setReasoningEffort] = useState("medium");
  const [permissionMode, setPermissionMode] =
    useState<ClaudePermissionMode>("default");
  const [budget, setBudget] = useState<ChatBudgetConfig>(INITIAL_BUDGET);

  return (
    <div className="min-h-[34rem] w-[58rem] max-w-[calc(100vw-2rem)] bg-background p-4 text-foreground">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Assistant</div>
          <div className="truncate text-xs text-muted-foreground">
            {model ?? "No model"} / {reasoningEffort} / {permissionMode}
          </div>
        </div>
        <ToolPreferences
          tools={SAMPLE_TOOLS}
          value={prefs}
          onRule={handleRule}
          rules={rules}
          onRulesChange={setRules}
          models={MOCK_MODELS}
          model={model}
          onModelChange={setModel}
          reasoningEfforts={["low", "medium", "high"]}
          reasoningEffort={reasoningEffort}
          onReasoningEffortChange={setReasoningEffort}
          permissionMode={permissionMode}
          onPermissionModeChange={setPermissionMode}
          budget={budget}
          onBudgetChange={setBudget}
        />
      </div>
      <div className="grid gap-3 pt-4 sm:grid-cols-2">
        <div className="rounded border border-border bg-muted/20 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tool permissions
          </div>
          <pre className="overflow-auto text-xs">
            {JSON.stringify(prefs, null, 2)}
          </pre>
        </div>
        <div className="rounded border border-border bg-muted/20 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Budget
          </div>
          <pre className="overflow-auto text-xs">
            {JSON.stringify({ budget, permissionMode }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

async function openPreferencesMenu(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const body = within(document.body);

  await userEvent.click(canvas.getByTestId("tool-preferences-btn"));
  const menu = await body.findByRole("menu");

  return { body, menu };
}

async function openAdvancedDialog(canvasElement: HTMLElement) {
  const { body, menu } = await openPreferencesMenu(canvasElement);
  await userEvent.click(within(menu).getByRole("button", { name: "Advanced" }));
  const dialog = await body.findByRole("dialog", {
    name: "Advanced Chat Settings",
  });

  return { dialog, dialogView: within(dialog) };
}

const meta = {
  title: "AI/ToolPreferences",
  component: ToolPreferences,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "AI chat tool-preferences control with a click-to-toggle tool tree and an Advanced dialog for runtime settings, costs, and a permissions browser with saved strategies.",
      },
    },
  },
  argTypes: {
    tools: { control: false, table: { category: "Data" } },
    value: { control: false, table: { category: "State" } },
    onChange: { control: false, table: { category: "Events" } },
    models: { control: false, table: { category: "Model" } },
    model: { control: false, table: { category: "Model" } },
    onModelChange: { control: false, table: { category: "Events" } },
    reasoningEfforts: { control: false, table: { category: "Model" } },
    reasoningEffort: { control: false, table: { category: "Model" } },
    onReasoningEffortChange: { control: false, table: { category: "Events" } },
    budget: { control: false, table: { category: "Budget" } },
    onBudgetChange: { control: false, table: { category: "Events" } },
    rules: { control: false, table: { category: "State" } },
    toolsLoading: { control: "boolean", table: { category: "State" } },
    toolsError: { control: "text", table: { category: "State" } },
    className: { control: false, table: { category: "Layout" } },
  },
} satisfies Meta<typeof ToolPreferences>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dropdown: Story = {
  render: () => <ToolPreferencesStory />,
  play: async ({ canvasElement, step }) => {
    await step("opens the tool tree expanded", async () => {
      const { menu } = await openPreferencesMenu(canvasElement);
      const menuView = within(menu);

      await expect(menuView.getByText("Tool Preferences")).toBeInTheDocument();
      // The tree nests groups under their parent surface; ungrouped parents
      // collect under General, and every level starts open.
      await expect(menuView.getByText("Admin Write")).toBeInTheDocument();
      await expect(menuView.getByText("Xero")).toBeInTheDocument();
      await expect(
        menuView.getByText("List Xero accounts"),
      ).toBeInTheDocument();
      await userEvent.click(
        menuView.getByRole("button", { name: "Collapse Xero" }),
      );
      await expect(menuView.queryByText("List Xero accounts")).toBeNull();
    });
  },
};

export const AdvancedConfig: Story = {
  render: () => <ToolPreferencesStory />,
  play: async ({ canvasElement, step }) => {
    await step("opens the Advanced config tab", async () => {
      const { dialogView } = await openAdvancedDialog(canvasElement);

      await expect(dialogView.getByText("Runtime")).toBeInTheDocument();
      // Permission mode and the cost cap live in the integrated runtime bar;
      // the usage/cost panel and the Generation section are gone from Config.
      await expect(dialogView.queryByText("Generation")).toBeNull();
      await expect(
        dialogView.getByRole("group", { name: "Advanced runtime" }),
      ).toBeInTheDocument();
      await expect(dialogView.queryByText("Usage (last turn)")).toBeNull();
      await expect(
        dialogView.queryByRole("combobox", { name: "Permission mode" }),
      ).toBeNull();
    });
  },
};

export const AdvancedPermissions: Story = {
  render: () => <ToolPreferencesStory />,
  play: async ({ canvasElement, step }) => {
    await step(
      "shows the tool browser with a collapsed strategy editor",
      async () => {
        const { dialogView } = await openAdvancedDialog(canvasElement);

        await userEvent.click(
          dialogView.getByRole("button", { name: /permissions/i }),
        );
        await expect(
          dialogView.getByPlaceholderText("Search tools"),
        ).toBeInTheDocument();
        await expect(dialogView.queryByRole("checkbox")).toBeNull();
        const strategies = dialogView.getByRole("button", {
          name: /Permission strategies/,
        });
        await expect(strategies).toHaveAttribute("aria-expanded", "false");
        await expect(
          dialogView.getByLabelText(`${INITIAL_RULE_COUNT} saved strategies`),
        ).toBeInTheDocument();
      },
    );

    await step("a directory toggle saves one new strategy", async () => {
      const dialogView = within(await dialog());
      await userEvent.click(
        dialogView.getByRole("button", { name: "Toggle Knowledge group" }),
      );
      await expect(
        dialogView.getByLabelText(`${INITIAL_RULE_COUNT + 1} saved strategies`),
      ).toBeInTheDocument();
    });
  },
};

// Reproduces the real clicky shape the webapp produces: bare verb labels
// ("Get"/"List"/"Patch") that collide within a single permission tier and are
// only distinguishable by their parent surface (entity).
const NESTED_TOOLS: ToolMeta[] = [
  {
    name: "accounts_get",
    label: "Get",
    group: "Accounting Read",
    preferenceKey: "Accounting Read",
    parent: "Accounts",
    entity: "accounts",
    defaultPermission: "allow",
    method: "GET",
    path: "/api/v1/accounts/{id}",
  },
  {
    name: "accounts_list",
    label: "List",
    group: "Accounting Read",
    preferenceKey: "Accounting Read",
    parent: "Accounts",
    entity: "accounts",
    defaultPermission: "allow",
    method: "GET",
    path: "/api/v1/accounts",
  },
  {
    name: "contacts_get",
    label: "Get",
    group: "Accounting Read",
    preferenceKey: "Accounting Read",
    parent: "Contacts",
    entity: "contacts",
    defaultPermission: "allow",
    method: "GET",
    path: "/api/v1/contacts/{id}",
  },
  {
    name: "contacts_list",
    label: "List",
    group: "Accounting Read",
    preferenceKey: "Accounting Read",
    parent: "Contacts",
    entity: "contacts",
    defaultPermission: "allow",
    method: "GET",
    path: "/api/v1/contacts",
  },
  {
    name: "companies_patch",
    label: "Patch",
    group: "Accounting Metadata Write",
    preferenceKey: "Accounting Metadata Write",
    parent: "Companies",
    entity: "companies",
    defaultPermission: "ask",
    method: "PATCH",
    path: "/api/v1/companies/{id}",
  },
];

function NestedToolsStory() {
  const [rules, setRules] = useState<PermissionPolicy>([]);
  const prefs = effectiveToolPolicies({
    tools: NESTED_TOOLS,
    userRules: rules,
    fallback: "ask",
  });
  return (
    <div className="min-h-[20rem] w-[42rem] max-w-[calc(100vw-2rem)] bg-background p-4 text-foreground">
      <div className="flex items-center justify-end border-b border-border pb-3">
        <ToolPreferences
          tools={NESTED_TOOLS}
          value={prefs}
          onRule={(rule) => setRules((current) => withUserRule(current, rule))}
        />
      </div>
      <pre data-testid="nested-rules" className="pt-4 text-xs">
        {JSON.stringify(rules)}
      </pre>
    </div>
  );
}

function readNestedRules(canvasElement: HTMLElement): PermissionPolicy {
  const raw = within(canvasElement).getByTestId("nested-rules").textContent;
  return raw ? (JSON.parse(raw) as PermissionPolicy) : [];
}

const dialog = () =>
  within(document.body).findByRole("dialog", {
    name: "Advanced Chat Settings",
  });

export const NestedPermissions: Story = {
  render: () => <NestedToolsStory />,
  play: async ({ canvasElement, step }) => {
    await step(
      "nests colliding verbs under their entity sub-headers",
      async () => {
        const { dialogView } = await openAdvancedDialog(canvasElement);
        await userEvent.click(
          dialogView.getByRole("button", { name: /permissions/i }),
        );

        await expect(
          dialogView.getByRole("button", {
            name: "Toggle Accounting Read group",
          }),
        ).toBeInTheDocument();
        await expect(
          dialogView.getByRole("button", { name: "Toggle Accounts group" }),
        ).toBeInTheDocument();
        await expect(
          dialogView.getByRole("button", { name: "Toggle Contacts group" }),
        ).toBeInTheDocument();
        // The two "Get"/"List" verbs coexist, each under its own entity.
        await expect(
          dialogView.getAllByRole("button", { name: "Get" }),
        ).toHaveLength(2);
        await expect(
          dialogView.getAllByRole("button", { name: "List" }),
        ).toHaveLength(2);
      },
    );

    await step("differing member modes surface as Mixed", async () => {
      const dialogView = within(await dialog());
      // Flip a single Accounts tool so Accounts (and thus the group) disagree.
      await userEvent.click(
        within(dialogView.getByTitle("accounts_get")).getByRole("button", {
          name: "Toggle Get",
        }),
      );
      expect(readNestedRules(canvasElement)).toEqual([
        { name: "accounts_get", policy: "auto" },
      ]);
      // Mixed shows on the Accounts sub-header AND the Accounting Read group.
      await expect(dialogView.getAllByText("Mixed")).toHaveLength(2);
    });

    await step("a parent chevron collapses only its own rows", async () => {
      const dialogView = within(await dialog());
      await userEvent.click(
        dialogView.getByRole("button", { name: "Collapse Accounts" }),
      );
      await expect(dialogView.queryByTitle("accounts_get")).toBeNull();
      await expect(dialogView.getByTitle("contacts_get")).toBeInTheDocument();
    });

    await step("group rules preserve existing tool overrides", async () => {
      const dialogView = within(await dialog());
      await userEvent.click(
        dialogView.getByRole("button", {
          name: "Toggle Accounting Read group",
        }),
      );
      expect(readNestedRules(canvasElement)).toEqual([
        { group: "Accounting Read", policy: "ask" },
        { name: "accounts_get", policy: "auto" },
      ]);
      await expect(dialogView.getAllByText("Mixed")).toHaveLength(2);
    });
  },
};

export const AdvancedSchemaBrowser: Story = {
  render: () => <ToolPreferencesStory />,
  play: async ({ canvasElement, step }) => {
    await step(
      "opens schema browser with input/output schema details",
      async () => {
        const { dialogView } = await openAdvancedDialog(canvasElement);

        await userEvent.click(
          dialogView.getByRole("button", { name: /permissions/i }),
        );
        await expect(
          dialogView.getByPlaceholderText("Search tools"),
        ).toBeInTheDocument();
        await expect(
          dialogView.getAllByText("List Xero accounts").length,
        ).toBeGreaterThan(0);
        await expect(
          dialogView.getAllByText("xero_accounts_list").length,
        ).toBeGreaterThan(0);
        await expect(dialogView.getByText("Hints")).toBeInTheDocument();
        await expect(
          dialogView.getByText("Read-only accounting lookup."),
        ).toBeInTheDocument();
        await expect(dialogView.getByText("Annotations")).toBeInTheDocument();
        await expect(dialogView.getByText("readOnlyHint")).toBeInTheDocument();
        await expect(dialogView.getByText("tenantId")).toBeInTheDocument();
        await expect(
          dialogView.getByText("Connected Xero tenant id."),
        ).toBeInTheDocument();
        await expect(dialogView.getByText("Output")).toBeInTheDocument();
        await userEvent.click(dialogView.getByRole("tab", { name: "JSON" }));
        await expect(dialogView.getByText("annotations")).toBeInTheDocument();
        await expect(
          dialogView.getByText('"xero_accounts_list"'),
        ).toBeInTheDocument();
      },
    );
  },
};
