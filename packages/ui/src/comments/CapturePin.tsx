import { Button } from "../components/button";
import { useCommentContext } from "./comment-context";

export type CapturePinProps = {
  /** The comment (anchor) id the pin opens. */
  id: string;
  /** Position among the pins; shown as `index + 1`. */
  index: number;
  left: number;
  top: number;
  onSelect: () => void;
};

/** A numbered pin on a commented element; focuses the comment's anchor and calls `onSelect`. Needs a CommentProvider. */
export function CapturePin({ id, index, left, top, onSelect }: CapturePinProps) {
  const context = useCommentContext();
  return (
    <Button
      size="sm"
      variant="outline"
      className="absolute"
      style={{ left, top }}
      aria-label={`Open comment ${index + 1}`}
      onClick={() => {
        context.focusAnchor(id);
        onSelect();
      }}
    >
      {index + 1}
    </Button>
  );
}
