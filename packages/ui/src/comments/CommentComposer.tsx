import { useRef, useState } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { DropdownMenu } from "../overlay/DropdownMenu";
import { UiArrowUp, UiClose } from "../icons";
import type { BadgeTone } from "../data/Badge";
import { MentionTextarea } from "./MentionTextarea";
import { toneToBadgeTone } from "./comment-utils";
import type {
  CommentAnchor,
  CommentConfig,
  CommentCreateInput,
  CommentFacet,
  CommentMention,
} from "./comment-types";

// Static literals so Tailwind's source scanner emits these utilities.
const FACET_DOT_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-muted-foreground",
  success: "bg-green-500",
  danger: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500",
};

export type CommentComposerProps = {
  config: CommentConfig;
  /** Anchor stamped onto created comments. */
  anchor?: CommentAnchor | null;
  /** Start collapsed as an "Add a comment…" pill until clicked. */
  collapsible?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  /** Create a new root comment. */
  onCreate?: (input: CommentCreateInput) => void | Promise<void>;
  /** Fired once per mention referenced by a posted comment. */
  onMention?: (mention: CommentMention, context: { body: string }) => void;
};

function FacetPicker({
  facet,
  value,
  onChange,
}: {
  facet: CommentFacet;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const selected = facet.options.find((o) => o.value === value);
  return (
    <DropdownMenu
      align="left"
      menuClassName="min-w-[150px]"
      trigger={
        <span
          role="button"
          tabIndex={0}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
            selected
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60",
          )}
        >
          {selected ? selected.label : facet.label}
          {selected && (
            <span
              role="presentation"
              className="ml-0.5 cursor-pointer hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
            >
              ×
            </span>
          )}
        </span>
      }
    >
      {(close) => (
        <div className="py-1">
          {facet.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value === value ? undefined : option.value);
                close();
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] text-popover-foreground hover:bg-accent hover:text-accent-foreground",
                option.value === value && "bg-muted font-semibold",
              )}
            >
              <span
                className={cn(
                  "inline-block size-2 rounded-full",
                  FACET_DOT_CLASS[toneToBadgeTone(option.tone)],
                )}
              />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </DropdownMenu>
  );
}

/**
 * The new-comment composer: a mention-aware textarea, one picker per configured
 * facet, and a send button. Starts as a pill when `collapsible`. Owns only its
 * own draft state; posting is delegated to `onCreate`.
 */
export function CommentComposer({
  config,
  anchor,
  collapsible = true,
  autoFocus = false,
  placeholder = "Add a comment…",
  onCreate,
  onMention,
}: CommentComposerProps) {
  const [open, setOpen] = useState(!collapsible || autoFocus);
  const [body, setBody] = useState("");
  const [facets, setFacets] = useState<Record<string, string>>({});
  const mentionsRef = useRef<Map<string, CommentMention>>(new Map());
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function reset() {
    setBody("");
    setFacets({});
    mentionsRef.current.clear();
  }

  function setFacet(key: string, value: string | undefined) {
    setFacets((prev) => {
      if (value === undefined) {
        const { [key]: _drop, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  }

  async function submit() {
    const text = body.trim();
    if (!text) return;
    const mentions = [...mentionsRef.current.values()].filter((m) =>
      body.toLowerCase().includes(`@${m.name.toLowerCase()}`),
    );
    await onCreate?.({
      body: text,
      anchor: anchor ?? null,
      ...(Object.keys(facets).length > 0 ? { facets } : {}),
      ...(mentions.length > 0 ? { mentions } : {}),
    });
    for (const mention of mentions) onMention?.(mention, { body: text });
    reset();
    if (collapsible) setOpen(false);
  }

  if (!open && body.trim().length === 0) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-full border border-border bg-muted/25 px-4 py-2 text-left text-sm text-muted-foreground/70 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/40"
      >
        {placeholder}
      </button>
    );
  }

  return (
    <div
      data-testid="comment-compose-box"
      className="relative rounded-2xl border border-border bg-muted/25 px-3 pt-3 pb-10 shadow-sm transition-[border-color,box-shadow] focus-within:border-primary/40 focus-within:shadow-md"
    >
      <MentionTextarea
        ref={inputRef}
        value={body}
        onChange={setBody}
        mentionables={config.mentionables ?? []}
        onMentionSelect={(m) => mentionsRef.current.set(m.id, m)}
        onSubmit={() => void submit()}
        onCancel={() => {
          reset();
          if (collapsible) setOpen(false);
        }}
        placeholder={placeholder}
        autoFocus={autoFocus || open}
        data-testid="comment-compose-input"
        className="min-h-[48px] pr-10"
      />
      {collapsible && (
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          aria-label="Close composer"
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Icon icon={UiClose} className="text-xs" />
        </button>
      )}
      <div className="absolute inset-x-3 bottom-2.5 flex items-center gap-1.5">
        {(config.facets ?? []).map((facet) => (
          <FacetPicker
            key={facet.key}
            facet={facet}
            value={facets[facet.key]}
            onChange={(value) => setFacet(facet.key, value)}
          />
        ))}
        <button
          type="button"
          data-testid="comment-compose-send"
          aria-label="Post comment"
          onClick={() => void submit()}
          disabled={!body.trim()}
          className="ml-auto inline-flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          <Icon icon={UiArrowUp} className="text-xs" />
        </button>
      </div>
    </div>
  );
}
