import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  cn,
  useCommentAnchorActionsOptional,
  useCommentContextOptional,
  type CommentRating,
} from "@flanksource/clicky-ui";
import {
  UiLink,
  UiThumbsDown,
  UiThumbsUp,
  UiTrash,
} from "@flanksource/clicky-ui/icons";

import { useAnnotationsHidden } from "../annotations";

import { PLAYGROUND_COMMENT_AUTHOR } from "../comments/useComments";

type ReviewIdentity = {
  id: string;
  title: string;
};

function reviewAnchor(id: string): string {
  if (!/^[A-Za-z][A-Za-z0-9:_-]*$/.test(id)) {
    throw new Error(
      `Review component id ${JSON.stringify(id)} must be a stable HTML fragment id`,
    );
  }
  return `#${id}`;
}

function useReviewAnchor(id: string) {
  const anchor = reviewAnchor(id);
  const elementRef = useRef<HTMLElement | null>(null);
  const actions = useCommentAnchorActionsOptional();

  useEffect(() => {
    const element = elementRef.current;
    if (!actions || !element) return;
    actions.registerAnchor(anchor, element);
    return () => actions.registerAnchor(anchor, null);
  }, [actions, anchor]);

  return { anchor, elementRef };
}

function RatingButton({
  label,
  rating,
  count,
  selected,
  onClick,
}: {
  label: string;
  rating: CommentRating;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = rating === "positive" ? UiThumbsUp : UiThumbsDown;
  return (
    <button
      type="button"
      aria-label={`Rate ${label} ${rating === "positive" ? "positively" : "negatively"}`}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-full border border-border px-2 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
        selected &&
          (rating === "positive"
            ? "border-green-500/40 bg-green-500/10 text-green-700 [[data-theme=dark]_&]:text-green-300"
            : "border-red-500/40 bg-red-500/10 text-red-700 [[data-theme=dark]_&]:text-red-300"),
      )}
    >
      <Icon className="size-3.5" />
      {count}
    </button>
  );
}

function ReviewActions({
  anchor,
  title,
  onDiscard,
}: {
  anchor: string;
  title: string;
  onDiscard?: () => void;
}) {
  const context = useCommentContextOptional();
  const [error, setError] = useState("");
  const ratings =
    context?.comments.filter(
      (comment) =>
        !comment.parentId && comment.anchor === anchor && comment.rating,
    ) ?? [];
  const ownRating = ratings.find(
    (comment) => comment.author?.name === PLAYGROUND_COMMENT_AUTHOR.name,
  );

  async function rate(rating: CommentRating) {
    if (!context) return;
    setError("");
    try {
      if (ownRating?.rating === rating && context.callbacks.onDelete) {
        if (!ownRating.body.trim()) {
          await context.callbacks.onDelete(ownRating.id);
        }
      } else if (ownRating && context.callbacks.onUpdateRating) {
        await context.callbacks.onUpdateRating(ownRating.id, rating);
      } else {
        await context.callbacks.onCreate?.({ anchor, body: "", rating });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {context && (
        <>
          <RatingButton
            label={title}
            rating="positive"
            count={ratings.filter(({ rating }) => rating === "positive").length}
            selected={ownRating?.rating === "positive"}
            onClick={() => void rate("positive")}
          />
          <RatingButton
            label={title}
            rating="negative"
            count={ratings.filter(({ rating }) => rating === "negative").length}
            selected={ownRating?.rating === "negative"}
            onClick={() => void rate("negative")}
          />
        </>
      )}
      <a
        href={anchor}
        aria-label={`Link to ${title}`}
        title={`Link to ${title}`}
        className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <UiLink className="size-3.5" />
      </a>
      {onDiscard && (
        <button
          type="button"
          onClick={onDiscard}
          aria-label={`Discard ${title}`}
          title={`Discard ${title}`}
          className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <UiTrash className="size-3.5" />
        </button>
      )}
      {error && (
        <span role="alert" className="text-xs text-destructive">
          Rating failed: {error}
        </span>
      )}
    </div>
  );
}

export type BestPracticeProps = ReviewIdentity & {
  description: ReactNode;
  tone?: "do" | "avoid" | "rule";
  className?: string;
};

export function BestPractice({
  id,
  title,
  description,
  tone = "rule",
  className,
}: BestPracticeProps) {
  const annotationsHidden = useAnnotationsHidden();
  const { anchor, elementRef } = useReviewAnchor(id);
  if (annotationsHidden) return null;
  return (
    <article
      ref={elementRef}
      id={id}
      className={cn(
        "scroll-mt-density-4 rounded-xl border border-l-4 bg-card p-density-3",
        tone === "do"
          ? "border-l-green-500"
          : tone === "avoid"
            ? "border-l-destructive"
            : "border-l-primary",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-density-2 pr-6">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <ReviewActions anchor={anchor} title={title} />
      </div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </div>
    </article>
  );
}

export type ReviewVariantProps = ReviewIdentity & {
  verdict: ReactNode;
  children: ReactNode;
  selected?: boolean;
  onDiscard: () => void;
  className?: string;
};

export function ReviewVariant({
  id,
  title,
  verdict,
  children,
  selected = false,
  onDiscard,
  className,
}: ReviewVariantProps) {
  const annotationsHidden = useAnnotationsHidden();
  const { anchor, elementRef } = useReviewAnchor(id);
  if (annotationsHidden) {
    return (
      <section className={cn("space-y-density-2", className)}>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-card p-density-4">
          {children}
        </div>
      </section>
    );
  }
  return (
    <section
      ref={elementRef}
      id={id}
      className={cn("scroll-mt-density-4 space-y-density-2", className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-density-2 pr-6">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <div className="text-xs leading-5 text-muted-foreground">
            {verdict}
          </div>
        </div>
        <ReviewActions anchor={anchor} title={title} onDiscard={onDiscard} />
      </header>
      <div
        className={cn(
          "overflow-x-auto rounded-lg border bg-card p-density-4",
          selected
            ? "border-primary/40 ring-1 ring-primary/20"
            : "border-border",
        )}
      >
        {children}
      </div>
    </section>
  );
}
