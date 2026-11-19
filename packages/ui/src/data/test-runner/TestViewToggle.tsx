import { SegmentedControl, type SegmentedOption } from "../../components/SegmentedControl";
import { UiListDashes, UiListTree } from "../../icons";
import { useTestRunner } from "./context";

/** "tree" groups tests beside a detail pane; "list" shows one row per test with its detail beneath. */
export type TestRunnerView = "tree" | "list";

const VIEW_OPTIONS: SegmentedOption<TestRunnerView>[] = [
  { id: "tree", label: "Tree", icon: UiListTree, title: "Group tests in a tree beside their detail" },
  { id: "list", label: "List", icon: UiListDashes, title: "One row per test, its detail opening beneath it" },
];

/** The Tree / List toggle. Renders nothing when the host doesn't handle view changes. */
export function TestViewToggle() {
  const runner = useTestRunner();
  if (!runner.onViewChange) return null;
  return (
    <SegmentedControl<TestRunnerView>
      size="sm"
      aria-label="View"
      value={runner.view ?? "tree"}
      options={VIEW_OPTIONS}
      onChange={runner.onViewChange}
    />
  );
}
