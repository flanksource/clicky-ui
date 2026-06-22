import type { Meta, StoryObj } from "@storybook/react-vite";
import { GroupedComments } from "./GroupedComments";
import {
  sampleComments,
  sampleConfig,
  useDemoCommentStore,
} from "./comment-fixtures";

const meta = {
  title: "Comments/GroupedComments",
  component: GroupedComments,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof GroupedComments>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ groupBy }: { groupBy: string }) {
  const { comments, callbacks } = useDemoCommentStore(sampleComments);
  return (
    <div className="max-w-xl">
      <GroupedComments
        comments={comments}
        config={sampleConfig}
        groupBy={groupBy}
        {...callbacks}
      />
    </div>
  );
}

export const ByArea: Story = { render: () => <Demo groupBy="area" /> };
export const ByPriority: Story = { render: () => <Demo groupBy="priority" /> };
