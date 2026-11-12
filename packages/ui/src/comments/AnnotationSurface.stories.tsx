import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnnotationSurface } from "./AnnotationSurface";
import type { AnnotationCapture } from "./annotation-types";
import type { Comment } from "./comment-types";
import { InputField } from "../components/InputField";
const meta = {
  title: "Comments/AnnotationSurface",
  component: AnnotationSurface,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AnnotationSurface>;
export default meta;
function Example() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [captures, setCaptures] = useState<Record<string, AnnotationCapture>>(
    {},
  );
  return (
    <div className="h-dvh p-4">
      <AnnotationSurface
        documentKey="annotation-example"
        view="form"
        comments={comments}
        captures={captures}
        onCreate={async (input, capture) => {
          const id = crypto.randomUUID();
          setComments((rows) => [
            ...rows,
            {
              id,
              body: input.body,
              createdAt: new Date().toISOString(),
              author: { name: "Reviewer", kind: "user" },
              status: "open",
              anchor: id,
            },
          ]);
          setCaptures((rows) => ({ ...rows, [id]: capture }));
        }}
      >
        <div className="max-w-lg space-y-4 p-6">
          <h2>Policy settings</h2>
          <InputField label="Name" value="Example policy" readOnly />
          <p>Select a field or paragraph to leave visual feedback.</p>
        </div>
      </AnnotationSurface>
    </div>
  );
}
export const VisualFeedback: StoryObj<typeof meta> = {
  render: () => <Example />,
};
