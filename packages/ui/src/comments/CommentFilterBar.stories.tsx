import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommentFilterBar } from "./CommentFilterBar";
import { CommentThreadList } from "./CommentThreadList";
import { CommentProgress } from "./CommentProgress";
import {
  applyCommentFilters,
  buildThreadListHandlers,
  emptyCommentFilters,
} from "./comment-utils";
import {
  sampleComments,
  sampleConfig,
  useDemoCommentStore,
} from "./comment-fixtures";
import type { CommentFilters } from "./comment-types";

const meta = {
  title: "Comments/CommentFilterBar",
  component: CommentFilterBar,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof CommentFilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo() {
  const { comments, callbacks } = useDemoCommentStore(sampleComments);
  const [filters, setFilters] = useState<CommentFilters>(emptyCommentFilters());
  const visible = applyCommentFilters(comments, filters, sampleConfig);
  const handlers = buildThreadListHandlers(comments, sampleConfig, callbacks);

  return (
    <div className="max-w-xl space-y-3">
      <CommentFilterBar
        config={sampleConfig}
        filters={filters}
        onChange={setFilters}
      />
      <CommentProgress comments={comments} config={sampleConfig} />
      <CommentThreadList
        comments={visible}
        config={sampleConfig}
        {...handlers}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Demo /> };
