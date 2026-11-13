import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/button";
import { CommentDraftPopover } from "./CommentDraftPopover";
import { CommentProvider } from "./CommentProvider";
import { DEFAULT_COMMENT_STATUSES } from "./comment-types";

const config = { statuses: DEFAULT_COMMENT_STATUSES };
const meta = {
  title: "Comments/CommentDraftPopover",
  component: CommentDraftPopover,
  parameters: { layout: "centered" },
} satisfies Meta<typeof CommentDraftPopover>;
export default meta;
type Story = StoryObj<typeof meta>;

function Example() {
  const [reference, setReference] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [posted, setPosted] = useState("");
  return (
    <CommentProvider
      persistenceKey="floating-comment-example"
      comments={[]}
      config={config}
    >
      <Button ref={setReference} onClick={() => setOpen(true)}>
        Comment on this element
      </Button>
      {posted && <p>Posted: {posted}</p>}
      {open && reference && (
        <CommentDraftPopover
          reference={reference}
          anchor="example"
          label="Example element"
          config={config}
          onDiscard={() => setOpen(false)}
          onCreate={async (input) => {
            setPosted(input.body);
            setOpen(false);
          }}
        />
      )}
    </CommentProvider>
  );
}

export const Default: Story = { render: () => <Example /> };
