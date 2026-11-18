import { useState } from "react";
import {
  DropdownMenu,
  IconButton,
  type DropdownMenuItem,
} from "@flanksource/clicky-ui";
import {
  UiDotsVertical,
  UiBrowser,
  UiRobotAi,
} from "@flanksource/clicky-ui/icons";
import { PlaygroundAgentInstructions } from "./PlaygroundAgentInstructions";
import { BookmarkletInstall } from "./bookmarklet/BookmarkletInstall";

export function PlaygroundMoreActions({
  items = [],
}: {
  items?: DropdownMenuItem[];
}) {
  const [dialog, setDialog] = useState<"instructions" | "bookmarklet" | null>(
    null,
  );
  return (
    <>
      <DropdownMenu
        align="right"
        menuLabel="More actions"
        trigger={
          <IconButton
            icon={UiDotsVertical}
            label="More actions"
            className="size-9 hover:bg-accent [@media(pointer:coarse)]:size-11"
          />
        }
        items={[
          ...items,
          {
            label: "Agent instructions",
            icon: UiRobotAi,
            group: "Help",
            onSelect: () => setDialog("instructions"),
          },
          {
            label: "Install bookmarklet",
            icon: UiBrowser,
            group: "Help",
            onSelect: () => setDialog("bookmarklet"),
          },
        ]}
      />
      {dialog === "instructions" && (
        <PlaygroundAgentInstructions onClose={() => setDialog(null)} />
      )}
      {dialog === "bookmarklet" && (
        <BookmarkletInstall onClose={() => setDialog(null)} />
      )}
    </>
  );
}
