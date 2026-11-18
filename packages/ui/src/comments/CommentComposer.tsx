import { ActionError } from "../data/diagnostics/ActionError";
import { useEffect, useRef, useState } from "react";
import { useCommentState } from "./comment-persistence";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { DropdownMenu } from "../overlay/DropdownMenu";
import { SplitButton } from "../components/SplitButton";
import { UiPaperPlaneRightFilled, UiClose } from "../icons";
import type { BadgeTone } from "../data/Badge";
import { CommentEditor } from "./CommentEditor";
import { DefaultDeliveryLine } from "./DefaultDeliveryLine";
import { toneToBadgeTone } from "./comment-utils";
import type {
  CommentAnchor,
  CommentConfig,
  CommentCreateAction,
  CommentCreateInput,
  CommentDefaultDelivery,
  CommentFacet,
  CommentMention,
  CommentMentionable,
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
  /** Focus the input on mount. A collapsible composer also focuses when the user expands it. */
  autoFocus?: boolean;
  placeholder?: string;
  /** Create a new root comment. */
  onCreate?: (input: CommentCreateInput, actionId?: string) => void | Promise<void>;
  createActions?: readonly CommentCreateAction[];
  /** Fired once per mention referenced by a posted comment. */
  onMention?: (mention: CommentMention, context: { body: string }) => void;
  onCancel?: () => void;
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

/** The empty picker's chip: what happens to a comment sent without a target. */
function untargetedChip(defaultDelivery: CommentDefaultDelivery | null | undefined) {
  if (defaultDelivery === undefined) {
    return { text: "Send to…", label: "Send to…", title: "Send this comment to an agent, or type @ and its name" };
  }
  if (defaultDelivery === null) {
    return {
      text: "Not delivered",
      label: "Send to… (not delivered by default)",
      title: "No agent rule covers this page, so the comment is only posted. Pick a target, or type @ and its name, to deliver it",
    };
  }
  return {
    text: `Auto: ${defaultDelivery.label}`,
    label: `Send to… (default: ${defaultDelivery.label})`,
    title: defaultDelivery.description ?? `New comments here are delivered to ${defaultDelivery.label}. Pick a target to send this one elsewhere`,
  };
}

function TargetPicker({
  targets,
  target,
  defaultDelivery,
  onPick,
  onClear,
}: {
  targets: readonly CommentMentionable[];
  target: CommentMentionable | undefined;
  defaultDelivery: CommentDefaultDelivery | null | undefined;
  onPick: (target: CommentMentionable) => void;
  onClear: () => void;
}) {
  const empty = untargetedChip(defaultDelivery);
  return (
    <span className="inline-flex items-center">
      <DropdownMenu
        align="left"
        menuClassName="min-w-[150px]"
        menuLabel="Comment targets"
        items={targets.map((option) => ({ label: `@${option.name}`, onSelect: () => onPick(option) }))}
        trigger={
          <button
            type="button"
            aria-label={target ? `Send to @${target.name}` : empty.label}
            title={target ? `This comment is sent to @${target.name}` : empty.title}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors [@media(pointer:coarse)]:min-h-11",
              target ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60",
              !target && defaultDelivery && "bg-muted/60 text-foreground",
            )}
          >
            {target ? `@${target.name}` : empty.text}
          </button>
        }
      />
      {target && (
        <button
          type="button"
          aria-label="Clear target"
          onClick={onClear}
          className="inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground [@media(pointer:coarse)]:size-11"
        >
          <Icon icon={UiClose} className="text-[10px]" />
        </button>
      )}
    </span>
  );
}

/**
 * The new-comment composer: a mention-aware editor that completes
 * `config.mentionables`, a target picker for `config.targets` (an explicit pick,
 * sent as `CommentCreateInput.target`), the default-delivery line, one picker
 * per configured facet, and a send button. An `@name` typed into the body is
 * sent as plain text for the host to resolve. Starts as a pill when
 * `collapsible`. Owns only its own draft state; posting is delegated to
 * `onCreate`.
 */
export function CommentComposer({
  config,
  anchor,
  collapsible = true,
  autoFocus = false,
  placeholder = "Add a comment…",
  onCreate,
  createActions,
  onMention,
  onCancel,
}: CommentComposerProps) {
  const draftKey = `draft:create:${anchor ?? "general"}`;
  const [open, setOpen] = useCommentState(`${draftKey}:open`, !collapsible || autoFocus);
  const [body, setBody] = useCommentState(`${draftKey}:body`, "");
  const [facets, setFacets] = useCommentState<Record<string, string>>(`${draftKey}:facets`, {});
  const [pickedTargetId, setPickedTargetId] = useCommentState<string | undefined>(`${draftKey}:target`, undefined);
  const targets = config.targets ?? [];
  const target = targets.find((option) => option.id === pickedTargetId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const submittingRef = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [savedMentions, setSavedMentions] = useCommentState<CommentMention[]>(`${draftKey}:mentions`, []);
  const mentionsRef = useRef<Map<string, CommentMention>>(new Map(savedMentions.map((mention) => [mention.id, mention])));

  function reset() {
    setBody("");
    setFacets({});
    setPickedTargetId(undefined);
    mentionsRef.current.clear();
    setSavedMentions([]);
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

  async function submit(actionId?: string) {
    const text = body.trim();
    if (!text || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    const mentions = [...mentionsRef.current.values()].filter((m) =>
      m.id !== target?.id && body.toLowerCase().includes(`@${m.name.toLowerCase()}`),
    );
    const snapshot = { body, facets, pickedTargetId, mentions: [...mentionsRef.current.values()] };
    reset();
    try {
      const input: CommentCreateInput = {
        body: text,
        anchor: anchor ?? null,
        ...(Object.keys(facets).length > 0 ? { facets } : {}),
        ...(mentions.length > 0 ? { mentions } : {}),
        ...(target ? { target: { id: target.id, name: target.name, kind: target.kind } } : {}),
      };
      if (actionId === undefined) await onCreate?.(input);
      else await onCreate?.(input, actionId);
      for (const mention of mentions) onMention?.(mention, { body: text });
      if (collapsible) setOpen(false);
    } catch (cause) {
      if (!mounted.current) return;
      setBody(snapshot.body);
      setFacets(snapshot.facets);
      setPickedTargetId(snapshot.pickedTargetId);
      mentionsRef.current = new Map(snapshot.mentions.map(mention => [mention.id, mention]));
      setSavedMentions(snapshot.mentions);
      setOpen(true);
      setError(cause);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  if (collapsible && !open && body.trim().length === 0) {
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
      aria-busy={submitting}
      className="relative rounded-2xl border border-border bg-muted/25 px-3 pt-3 pb-10 shadow-sm transition-[border-color,box-shadow] focus-within:border-primary/40 focus-within:shadow-md [@media(pointer:coarse)]:pb-2"
    >
      <CommentEditor
        disabled={submitting}
        {...(config.vocabulary ? { vocabulary: config.vocabulary } : {})}
        value={body}
        onChange={setBody}
        // One completion per @-name: a target named like a mentionable completes to the same text.
        mentionables={[...(config.mentionables ?? []), ...targets.filter((option) => !config.mentionables?.some((m) => m.name.toLowerCase() === option.name.toLowerCase()))]}
        onMentionSelect={(m) => { mentionsRef.current.set(m.id, m); setSavedMentions([...mentionsRef.current.values()]); }}
        onSubmit={() => void submit(createActions?.[0]?.id)}
        onCancel={() => {
          if (submittingRef.current) return;
          reset();
          if (collapsible) setOpen(false);
          onCancel?.();
        }}
        placeholder={placeholder}
        // An always-open composer is page chrome: focusing it on mount would
        // scroll its host to it and steal the keyboard from the page.
        autoFocus={autoFocus || (collapsible && open)}
        data-testid="comment-compose-input"
        className="min-h-[48px] pr-10 [@media(pointer:coarse)]:pr-12"
      />
      {error !== null && <ActionError error={error} context={[["Operation", "Post comment"], ["Anchor", anchor ?? "Whole page"]]} />}
      <DefaultDeliveryLine delivery={config.defaultDelivery} className="mt-1 text-[11px] leading-4 text-muted-foreground" />
      {collapsible && (
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          aria-label="Close composer"
          className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground [@media(pointer:coarse)]:right-1 [@media(pointer:coarse)]:top-1 [@media(pointer:coarse)]:size-11"
        >
          <Icon icon={UiClose} className="text-xs" />
        </button>
      )}
      {/* Touch-sized controls cannot share one absolute row with the textarea,
          so on a coarse pointer the row joins the flow and wraps. */}
      <div className="absolute inset-x-3 bottom-2.5 flex items-center gap-1.5 [@media(pointer:coarse)]:static [@media(pointer:coarse)]:mt-2 [@media(pointer:coarse)]:flex-wrap [@media(pointer:coarse)]:gap-2">
        {targets.length > 0 && (
          <TargetPicker
            targets={targets}
            target={target}
            defaultDelivery={config.defaultDelivery}
            onPick={(option) => setPickedTargetId(option.id)}
            onClear={() => setPickedTargetId(undefined)}
          />
        )}
        {(config.facets ?? []).map((facet) => (
          <FacetPicker
            key={facet.key}
            facet={facet}
            value={facets[facet.key]}
            onChange={(value) => setFacet(facet.key, value)}
          />
        ))}
        <SplitButton
          className="ml-auto [@media(pointer:coarse)]:min-h-11"
          size="sm"
          label={<span className="sr-only">{createActions?.[0]?.label ?? "Post comment"}</span>}
          icon={UiPaperPlaneRightFilled}
          loading={submitting}
          title="Send options"
          disabled={submitting || !body.trim()}
          onClick={() => void submit(createActions?.[0]?.id)}
          items={(createActions?.slice(1) ?? []).map(action => ({
            label: action.label,
            onSelect: () => { void submit(action.id); },
          }))}
        />
      </div>
    </div>
  );
}
