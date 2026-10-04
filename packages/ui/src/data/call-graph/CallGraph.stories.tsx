import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { matchesExclude, type ExcludeMatcher } from "./call-graph-exclude";
import {
  DATA_IDS,
  oipaDataGraph,
  GO_DEFAULT_EXCLUDE,
  GO_EXPANDABLE,
  GO_ROOT,
  goGraph,
  goModuleScopesExpansion,
  OIPA_GUARDS,
  OIPA_IDS,
  OIPA_VOCABULARY,
  oipaGraph,
  oipaPlanCopybookExpansion,
  type GoGraph,
} from "./call-graph.fixtures";
import { CallGraph } from "./CallGraph";
import type { CallGraph as Graph, CallGraphEdge, CallGraphFetchParams, CallGraphNode } from "./types";

const meta = {
  title: "Data/CallGraph",
  component: CallGraph,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A language-neutral call graph around one root, in uir's `graph.Graph` JSON shape. The host fetches the graph (and one hop more for a node's `+N`), names and draws node kinds through a `vocabulary`, and opens nodes and call sites through `nodeHref`/`onOpenNode` and `siteHref`/`onRevealSite`. Direction, depth, exclusions and selection are controlled when their `on*Change` handler is passed, so a host can keep them in its URL. A host whose graph leaves guards out passes `loadSiteGuards`, called only for the selected edge.",
      },
    },
  },
  args: { root: GO_ROOT, fetchGraph: () => Promise.resolve(goGraph()) },
} satisfies Meta<typeof CallGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

const DELAY_MS = 250;
const delay = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), DELAY_MS));

// uir's Go index excludes the standard library and builtins by keyword; the generic matcher knows neither.
const goMatcher: ExcludeMatcher = (pattern, group) => {
  if (pattern === "std") return group.external === true && group.name !== "builtin" && !group.name.split("/")[0]!.includes(".");
  if (pattern === "builtin") return group.name === "builtin";
  return matchesExclude(pattern, group);
};

function fetchGo(params: CallGraphFetchParams): Promise<GoGraph> {
  const exclude = params.exclude ?? GO_DEFAULT_EXCLUDE;
  return delay(params.root === GO_EXPANDABLE.id ? goModuleScopesExpansion(exclude) : goGraph(exclude));
}

function GoIndex() {
  const [exclude, setExclude] = useState<string[] | undefined>();
  return (
    <div style={{ height: 560 }}>
      <CallGraph<GoGraph> root={GO_ROOT} fetchGraph={fetchGo} exclude={exclude} onExcludeChange={setExclude}
        edgeLabels={{ dispatch: "via interface" }} groupFacts={(graph) => graph.packages} defaultExclude={(graph) => graph.exclude}
        excludeMatcher={goMatcher} openLabel="Open declaration" onOpenNode={() => {}} onRevealSite={() => {}} onFocusNode={() => {}} />
    </div>
  );
}

/** uir's Go index: package groups and exclusions, `via interface` dispatch, guards in the response. */
export const GoIndexGraph: Story = {
  name: "Go index (uir)",
  render: () => <GoIndex />,
};

function fetchOipa(params: CallGraphFetchParams): Promise<Graph> {
  return delay(params.root === OIPA_IDS.planCopybook ? oipaPlanCopybookExpansion() : oipaGraph());
}

const loadOipaGuards = (edge: CallGraphEdge) => delay(OIPA_GUARDS[edge.id] ?? edge.sites);

/** OIPA's reference graph: tiers as groups, dispatch by plan with `plans` on the edge, guards fetched on selection. */
export const OipaReferences: Story = {
  name: "OIPA references",
  render: () => (
    <div style={{ height: 560 }}>
      <CallGraph root={OIPA_IDS.transaction} fetchGraph={fetchOipa} vocabulary={OIPA_VOCABULARY} depth={3}
        edgeLabels={{ dispatch: "dispatched by plan" }} loadSiteGuards={loadOipaGuards}
        nodeHref={(node) => `#/business-rule/${node.properties?.guid}`} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "SchemeInstallPacket to CalculatePremium" }));
    await expect(await canvas.findByText("IsGroupScheme = 'Y'")).toBeInTheDocument();
  },
};

// A rule has a page; a stored procedure has a body but no page, so the host opens rules only.
const ruleHref = (node: CallGraphNode) => (node.id.startsWith("business-rule:") ? `#/business-rule/${node.properties?.guid}` : undefined);

function OipaDataAccessGraph() {
  return (
    <div style={{ height: 560 }}>
      <CallGraph root={DATA_IDS.install} vocabulary={OIPA_VOCABULARY} depth={3} dataAccess fetchGraph={(params) => delay(oipaDataGraph(params))}
        nodeHref={ruleHref} onOpenNode={() => {}} canOpenNode={(node) => ruleHref(node) !== undefined} />
    </div>
  );
}

/**
 * Data access: reads green, writes amber, the procedure an `exec` call. Tables and entities collapse
 * their columns and fields into chips on the edge until Columns draws them as nodes. Open is disabled
 * on the procedure: it has no href, and `canOpenNode` says the host's handler does not open it.
 */
export const OipaDataAccess: Story = {
  name: "OIPA data access",
  render: () => <OipaDataAccessGraph />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "stored procedure Update_ClassGroup" }));
    await expect(await canvas.findByRole("button", { name: "Open" })).toBeDisabled();
    await userEvent.click(await canvas.findByRole("switch", { name: "Columns" }));
    await expect(await canvas.findByRole("button", { name: "field PolicyStatus" })).toBeInTheDocument();
  },
};

export const NoRoot: Story = {
  args: { root: undefined, emptyMessage: "Select a transaction or business rule to draw its call graph." },
};

export const LoadFailed: Story = {
  args: { root: "missing", fetchGraph: () => Promise.reject(new Error("no rule matches missing")) },
};
