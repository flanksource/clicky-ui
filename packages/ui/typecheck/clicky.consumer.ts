import {
  Clicky,
  ClickyTable,
  type ClickyProps,
  type ClickyRowDetailRenderer,
  type ClickyTableProps,
} from "@flanksource/clicky-ui/clicky";

const renderRowDetail: ClickyRowDetailRenderer = (row) => String(row.name);

export const hostProps = {
  renderRowDetail,
} satisfies Pick<ClickyProps, "renderRowDetail">;

export const tableProps = {
  renderRowDetail,
} satisfies Pick<ClickyTableProps, "renderRowDetail">;

export const components = [Clicky, ClickyTable];
