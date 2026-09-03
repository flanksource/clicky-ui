// Domain node adapters for VerificationResults: a checklist adapter for the
// synthesized "Acceptance criteria" node and its items, and a fixture/CEL
// adapter for the failing-step detail. Rendering lives in adapterViews.tsx —
// split out so this file's only exports are the registry (react/only-export-
// components forbids mixing component declarations with plain exports).

import { ChecklistDetail, FixtureDetail } from "./adapterViews";
import {
  createTestRunnerRegistry,
  type Test,
  type TestNodeAdapter,
  type TestNodeAdapterRegistry,
} from "../test-runner";

function isChecklistNode(node: Test): boolean {
  return node.framework === "checklist";
}

const checklistAdapter: TestNodeAdapter = {
  id: "verification-checklist",
  match: isChecklistNode,
  renderDetail: ({ node }) => <ChecklistDetail node={node} />,
};

function isFixtureNode(node: Test): boolean {
  return node.context !== undefined;
}

const fixtureAdapter: TestNodeAdapter = {
  id: "verification-fixture",
  match: isFixtureNode,
  renderDetail: ({ node }) => <FixtureDetail node={node} />,
};

/** Default node adapters for VerificationResults: checklist items and
 *  fixture/CEL steps. Registration order matters only when a node could match
 *  both — a checklist node never carries a `context`, so the two never race. */
export function verificationAdapters(): TestNodeAdapterRegistry {
  return createTestRunnerRegistry([checklistAdapter, fixtureAdapter]);
}
