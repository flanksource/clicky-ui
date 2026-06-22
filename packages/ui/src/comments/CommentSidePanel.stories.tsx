import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../components/button";
import { CommentProvider } from "./CommentProvider";
import { CommentSidePanel } from "./CommentSidePanel";
import { dottedAnchorResolver, useCommentContext } from "./comment-context";
import {
  sampleComments,
  sampleConfig,
  useDemoCommentStore,
} from "./comment-fixtures";

const meta = {
  title: "Comments/CommentSidePanel",
  component: CommentSidePanel,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof CommentSidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const anchorLabels = { summary: "Summary", "details.row.3": "Details · Row 3" };

function FocusBar() {
  const ctx = useCommentContext();
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => ctx.focusAnchor("summary")}
      >
        Focus “Summary”
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => ctx.focusAnchor("details.row.3")}
      >
        Focus “Details”
      </Button>
      <Button size="sm" variant="ghost" onClick={ctx.openCommentList}>
        Toggle all
      </Button>
    </div>
  );
}

function Demo() {
  const { comments, callbacks } = useDemoCommentStore(sampleComments);
  return (
    <CommentProvider
      comments={comments}
      config={sampleConfig}
      resolveAnchor={dottedAnchorResolver}
      {...callbacks}
    >
      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          <FocusBar />
          <p className="text-sm text-muted-foreground">
            The rail tracks the provider state: focus an anchor for a single
            thread, or open the full document feed.
          </p>
        </div>
        <CommentSidePanel anchorLabels={anchorLabels} />
      </div>
    </CommentProvider>
  );
}

export const Default: Story = { render: () => <Demo /> };
