import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { MOCK_MODELS } from "../chat/Chat.fixtures";
import type { ChatBudgetConfig, ChatUsageSummary } from "../chat/types";
import {
  ToolPreferences,
  type ClaudePermissionMode,
  type ToolMeta,
  type ToolMode,
} from "./ToolPreferences";

const SAMPLE_TOOLS: ToolMeta[] = [
  {
    name: "xero_accounts_list",
    label: "List Xero accounts",
    group: "Xero",
    preferenceKey: "Xero Read",
    defaultPermission: "off",
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
    defaultPermission: "off",
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
    defaultPermission: "on",
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

const INITIAL_PREFS: Record<string, ToolMode> = {
  filesystem_write: "ask",
  xero_accounts_list: "off",
  xero_contacts_list: "off",
  search_docs: "on",
  sync_finance: "ask",
};

const INITIAL_BUDGET: ChatBudgetConfig = {
  cost: 0.25,
  maxTokens: 8000,
};

const SAMPLE_USAGE: ChatUsageSummary = {
  usedTokens: 14320,
  maxTokens: 200000,
  messageCount: 8,
  modelLabel: "Claude Sonnet 4.5",
  cost: 0.0382,
  usage: {
    inputTokens: 12180,
    outputTokens: 1440,
    reasoningTokens: 520,
    cacheReadTokens: 9400,
    cacheWriteTokens: 320,
    totalTokens: 14320,
  },
  costBreakdown: {
    model: "anthropic/claude-sonnet-4-5",
    inputUsd: 0.01218,
    outputUsd: 0.0216,
    reasoningUsd: 0.0021,
    cacheReadUsd: 0.00188,
    cacheWriteUsd: 0.00044,
    totalUsd: 0.0382,
  },
};

type ToolPreferencesStoryProps = {
  initialValue?: Record<string, ToolMode>;
};

function ToolPreferencesStory({
  initialValue = INITIAL_PREFS,
}: ToolPreferencesStoryProps) {
  const [prefs, setPrefs] = useState<Record<string, ToolMode>>(initialValue);
  const [model, setModel] = useState<string | undefined>(MOCK_MODELS[0]?.id);
  const [reasoningEffort, setReasoningEffort] = useState("medium");
  const [permissionMode, setPermissionMode] =
    useState<ClaudePermissionMode>("default");
  const [temperature, setTemperature] = useState<number | undefined>(0.4);
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
          onChange={setPrefs}
          models={MOCK_MODELS}
          model={model}
          onModelChange={setModel}
          reasoningEfforts={["low", "medium", "high"]}
          reasoningEffort={reasoningEffort}
          onReasoningEffortChange={setReasoningEffort}
          permissionMode={permissionMode}
          onPermissionModeChange={setPermissionMode}
          temperature={temperature}
          onTemperatureChange={setTemperature}
          budget={budget}
          onBudgetChange={setBudget}
          usage={SAMPLE_USAGE}
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
            {JSON.stringify({ budget, permissionMode, temperature }, null, 2)}
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
          "AI chat tool-preferences control with a compact grouped dropdown and an Advanced dialog for model settings, group permissions, and tool schemas.",
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
    temperature: { control: false, table: { category: "Generation" } },
    onTemperatureChange: { control: false, table: { category: "Events" } },
    budget: { control: false, table: { category: "Budget" } },
    onBudgetChange: { control: false, table: { category: "Events" } },
    usage: { control: false, table: { category: "Usage" } },
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
    await step("opens the grouped dropdown", async () => {
      const { menu } = await openPreferencesMenu(canvasElement);
      const menuView = within(menu);

      await expect(menuView.getByText("Tool Preferences")).toBeInTheDocument();
      await expect(menuView.getByText("Admin Write")).toBeInTheDocument();
      await expect(menuView.getAllByText("Knowledge").length).toBeGreaterThan(
        0,
      );
      await expect(menuView.getByText("Xero")).toBeInTheDocument();
      await expect(
        menuView.getByText("List Xero accounts"),
      ).toBeInTheDocument();
      await userEvent.click(
        menuView.getByRole("button", { name: "Collapse Xero" }),
      );
      await expect(menuView.queryByText("List Xero accounts")).toBeNull();
      await userEvent.click(
        menuView.getByRole("button", { name: "Toggle Xero group" }),
      );
      await expect(menuView.getAllByText("On").length).toBeGreaterThan(0);
      await expect(menuView.getAllByText("Ask").length).toBeGreaterThan(0);
    });
  },
};

export const AdvancedConfig: Story = {
  render: () => <ToolPreferencesStory />,
  play: async ({ canvasElement, step }) => {
    await step("opens the Advanced config tab", async () => {
      const { dialogView } = await openAdvancedDialog(canvasElement);

      await expect(dialogView.getByText("Model")).toBeInTheDocument();
      await expect(dialogView.getByText("Generation")).toBeInTheDocument();
      await expect(dialogView.getByText("Budget")).toBeInTheDocument();
      await expect(dialogView.getByText("Usage")).toBeInTheDocument();
      await expect(dialogView.getByText("Thread total")).toBeInTheDocument();
      const select = dialogView.getByRole("combobox", {
        name: "Permission mode",
      });
      await expect(
        within(select).getByRole("option", { name: "Default" }),
      ).toBeInTheDocument();
      await expect(
        within(select).getByRole("option", { name: "Accept edits" }),
      ).toBeInTheDocument();
      await expect(
        within(select).getByRole("option", { name: "Bypass" }),
      ).toBeInTheDocument();
    });
  },
};

export const AdvancedPermissions: Story = {
  render: () => <ToolPreferencesStory />,
  play: async ({ canvasElement, step }) => {
    await step("opens grouped permissions", async () => {
      const { dialogView } = await openAdvancedDialog(canvasElement);

      await userEvent.click(
        dialogView.getByRole("button", { name: /permissions/i }),
      );
      await expect(dialogView.getByText("Admin Write")).toBeInTheDocument();
      await expect(dialogView.getByText("Xero")).toBeInTheDocument();
      await expect(
        dialogView.getByText("List Xero accounts"),
      ).toBeInTheDocument();
      await expect(
        dialogView.getByText("List Xero contacts"),
      ).toBeInTheDocument();
      await userEvent.click(
        dialogView.getByRole("button", { name: "Collapse Xero" }),
      );
      await expect(dialogView.queryByText("List Xero accounts")).toBeNull();
      await userEvent.click(
        dialogView.getByRole("button", { name: "Toggle Xero group" }),
      );
      await expect(dialogView.getAllByText("On").length).toBeGreaterThan(0);
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
          dialogView.getByRole("button", { name: /browser/i }),
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
