import { useRef, useState } from "react";
import { CommentComposer, type CommentComposerProps } from "./CommentComposer";
import { Icon } from "../data/Icon";
import { UiClose, UiComment } from "../icons";
import { useEscapeLayer } from "../overlay/modalStack";

export type CommentDraftCardProps = CommentComposerProps & {
  label: string;
  onDiscard: () => void;
};
export function CommentDraftCard({
  label,
  onDiscard,
  onCreate,
  ...props
}: CommentDraftCardProps) {
  const [posting, setPosting] = useState(false);
  const busy = useRef(false);
  const discard = () => {
    if (!busy.current) onDiscard();
  };
  useEscapeLayer(true, discard);
  return (
    <>
      <div className="flex items-center gap-1 border-b border-border px-2 py-1 text-[11px] text-muted-foreground">
        <Icon icon={UiComment} className="text-xs" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <button
          type="button"
          aria-label="Discard comment"
          disabled={posting}
          onClick={discard}
          className="rounded p-0.5 hover:bg-muted hover:text-foreground disabled:opacity-40 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11"
        >
          <Icon icon={UiClose} className="text-xs" />
        </button>
      </div>
      <div className="p-2">
        <CommentComposer
          {...props}
          collapsible={false}
          autoFocus
          placeholder="Add a comment…"
          onCancel={discard}
          onCreate={async (input, action) => {
            if (!onCreate)
              throw new Error("Comment creation is not configured");
            busy.current = true;
            setPosting(true);
            try {
              if (action === undefined) await onCreate(input);
              else await onCreate(input, action);
            } finally {
              busy.current = false;
              setPosting(false);
            }
          }}
        />
      </div>
    </>
  );
}
