import type { Meta, StoryObj } from "@storybook/react";
import { LocalPathPicker } from "./LocalPathPicker";

const meta = {
  title: "Forms/LocalPathPicker",
  component: LocalPathPicker,
} satisfies Meta<typeof LocalPathPicker>;
export default meta;
export const Example: StoryObj<typeof meta> = {
  args: {
    open: true,
    onClose: () => {},
    onSelect: () => {},
    load: async () => ({
      path: "/home/example",
      parent: "/home",
      entries: [
        {
          name: "catalog.sqlite",
          path: "/home/example/catalog.sqlite",
          directory: false,
        },
        {
          name: "notes.txt",
          path: "/home/example/notes.txt",
          directory: false,
        },
      ],
    }),
  },
};
export const ExtensionFiltered: StoryObj<typeof meta> = {
  args: { ...Example.args, accept: [".sqlite"] },
};
