import type { Meta, StoryObj } from "@storybook/react-vite";
import { Clicky, type ClickyDocument, type ClickyNode } from "./Clicky";
import { clickyFixture } from "./Clicky.fixtures";

const meta: Meta<typeof Clicky> = {
  title: "Data/Clicky",
  component: Clicky,
  parameters: {
    docs: {
      description: {
        component:
          "Renderer for Clicky AST documents produced by the sibling clicky stack. It handles text, tables, trees, badges, code, stack traces, downloads, and command links from one JSON document.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Clicky>;

export const RichDocument: Story = {
  args: {
    data: clickyFixture,
  },
};

export const JsonStringPayload: Story = {
  args: {
    data: JSON.stringify(clickyFixture),
  },
};

export const WithDownloadControls: Story = {
  args: {
    data: clickyFixture,
    view: { pdf: false, json: true },
    download: { all: true, label: "report" },
  },
};

export const RemoteUrl: Story = {
  args: {
    url: "/samples/clicky/services.json",
    data: clickyFixture,
    view: [],
    download: { all: true, label: "artifact" },
  },
};

const tableDownloadDoc: ClickyDocument = {
  version: 1,
  node: {
    kind: "table",
    autoFilter: true,
    columns: [
      { name: "account", label: "Account", sortable: true, grow: true },
      { name: "type", label: "Type", sortable: true, shrink: true },
      {
        name: "balance",
        label: "Balance",
        align: "right",
        sortable: true,
        shrink: true,
      },
      { name: "updated", label: "Updated", sortable: true, shrink: true },
    ],
    rows: [
      {
        cells: {
          account: {
            kind: "text",
            text: "Operating account",
            plain: "Operating account",
          },
          type: { kind: "text", text: "Bank", plain: "Bank" },
          balance: { kind: "text", text: "12,480.00", plain: "12480" },
          updated: { kind: "text", text: "2026-04-15", plain: "2026-04-15" },
        },
      },
      {
        cells: {
          account: {
            kind: "text",
            text: "Accounts receivable",
            plain: "Accounts receivable",
          },
          type: { kind: "text", text: "Current Asset", plain: "Current Asset" },
          balance: { kind: "text", text: "8,215.50", plain: "8215.5" },
          updated: { kind: "text", text: "2026-04-16", plain: "2026-04-16" },
        },
      },
      {
        cells: {
          account: {
            kind: "text",
            text: "Sales tax payable",
            plain: "Sales tax payable",
          },
          type: { kind: "text", text: "Liability", plain: "Liability" },
          balance: { kind: "text", text: "-1,142.78", plain: "-1142.78" },
          updated: { kind: "text", text: "2026-04-18", plain: "2026-04-18" },
        },
      },
    ],
  },
};

export const TableMenuDownloads: Story = {
  args: {
    url: "/samples/clicky/services.json",
    data: tableDownloadDoc,
    view: [],
    download: { all: true, label: "accounts" },
  },
  parameters: {
    docs: {
      description: {
        story:
          "URL-backed Clicky table where download formats are surfaced from the table core menu instead of a separate download toolbar.",
      },
    },
  },
};

const codeNode = (language: string, source: string): ClickyNode => ({
  kind: "code",
  language,
  source,
});

const combinedCodeDoc: ClickyDocument = {
  version: 1,
  node: {
    kind: "text",
    children: [
      {
        kind: "text",
        text: "Go",
        style: { className: "font-semibold text-sm mt-density-3" },
      },
      codeNode(
        "go",
        `package main

import "fmt"

func main() {
    fmt.Println("Hello, world!")
}`,
      ),
      {
        kind: "text",
        text: "Python",
        style: { className: "font-semibold text-sm mt-density-3" },
      },
      codeNode(
        "python",
        `def greet(name: str = "world") -> str:
    return f"Hello, {name}!"`,
      ),
    ],
  },
};

export const CodeNodes: Story = {
  args: {
    data: combinedCodeDoc,
  },
};
