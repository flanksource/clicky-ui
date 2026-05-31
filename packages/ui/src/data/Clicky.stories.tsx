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
