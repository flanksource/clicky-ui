import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AttachmentButton, AttachmentList } from "./Attachment";
import type { FileUIPart } from "./types";

const SAMPLE_FILES: FileUIPart[] = [
  {
    type: "file",
    mediaType: "text/plain",
    filename: "error.log",
    url: "data:text/plain;base64,RXJyb3I6IGNvbm5lY3Rpb24gcmVzZXQ=",
  },
  {
    type: "file",
    mediaType: "image/png",
    filename: "screenshot.png",
    url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  },
];

function Harness({ initial }: { initial: FileUIPart[] }) {
  const [files, setFiles] = useState<FileUIPart[]>(initial);
  return (
    <div className="max-w-2xl space-y-3">
      <AttachmentButton onAdd={(parts) => setFiles((f) => [...f, ...parts])} />
      <AttachmentList files={files} onRemove={(i) => setFiles((f) => f.filter((_, idx) => idx !== i))} />
    </div>
  );
}

const meta = {
  title: "Chat/Attachment",
  component: AttachmentList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Attachment affordances for the composer: `AttachmentButton` opens the file picker and emits the chosen files as data-URL `FileUIPart`s; `AttachmentList` shows the pending attachments as removable chips/thumbnails. Add a file with the button, remove with the × on each chip.",
      },
    },
  },
  render: () => <Harness initial={SAMPLE_FILES} />,
} satisfies Meta<typeof AttachmentList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  render: () => <Harness initial={[]} />,
};
