import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommentEditor } from "./CommentEditor";
import type { CommentVocabulary } from "./comment-vocabulary";

const vocabulary: CommentVocabulary = {
  items: [
    { catalog: "example", type: "box", id: "box/outlined", label: "Outlined", description: "A component with a neutral outline", references: ["docs/boxes.md#outlined"] },
    { catalog: "example", type: "box", id: "box/header", label: "Header", description: "A component identified by its header", references: ["docs/boxes.md#header"] },
  ],
  renderPreview: item => <span className="inline-flex min-h-10 min-w-24 items-center justify-center rounded border border-primary bg-primary/10 p-2 text-xs">{item.label}</span>,
};
function Example() {
  const [body, setBody] = useState("");
  return <div className="max-w-lg space-y-4 p-6"><p className="text-sm text-muted-foreground">Type @ to browse types, then Enter to preview and select an item.</p><CommentEditor value={body} onChange={setBody} vocabulary={vocabulary} mentionables={[{ id: "reviewer", name: "Reviewer", kind: "user" }]} placeholder="Comment" className="min-h-20 rounded border border-border p-3" /><pre className="whitespace-pre-wrap break-all rounded bg-muted p-3 text-xs">{body}</pre></div>;
}
const meta = { title: "Comments/Vocabulary editor", component: Example } satisfies Meta<typeof Example>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
