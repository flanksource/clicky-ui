import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TestFilterBar } from "./TestFilterBar";
import { emptyTestFilters, type TestFilters } from "./filterState";
import type { StatusCounts } from "./status";

// Pre-computed from the `completedTests` fixture: 4 passed (valid, logout,
// prorate, setup), 1 failed, 1 timed-out, 1 skipped.
const COUNTS: StatusCounts = {
  total: 7,
  passed: 4,
  failed: 1,
  warned: 0,
  skipped: 1,
  pending: 0,
  running: 0,
  timedout: 1,
};

const FRAMEWORKS = ["go test", "ginkgo", "fixture"];

function Harness({ initial }: { initial?: TestFilters }) {
  const [filters, setFilters] = useState<TestFilters>(initial ?? emptyTestFilters());
  return (
    <TestFilterBar filters={filters} onChange={setFilters} counts={COUNTS} frameworks={FRAMEWORKS} />
  );
}

const meta = {
  title: "Data/TestRunner/TestFilterBar",
  component: TestFilterBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Tri-state status + framework filter pills for the test runner (named `TestFilterBar` to avoid the generic `FilterBar`). Each pill cycles neutral → include → exclude; counts come from the run, frameworks from the discovered set. Controlled via `filters`/`onChange`.",
      },
    },
  },
  render: () => <Harness />,
} satisfies Meta<typeof TestFilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
