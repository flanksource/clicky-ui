import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Button,
  InputField,
  Modal,
  useCommentContext,
  type Comment,
  type CommentReviewDecision,
} from "@flanksource/clicky-ui";
import {
  UiCheck,
  UiEdit,
  UiTrash,
  UiClose,
} from "@flanksource/clicky-ui/icons";

import {
  elementBoxWithin,
  resolveAnchor,
  type Box,
} from "../comments/dom-anchor";

const SOURCES_ROUTE = "/__playground/sources";
const REVIEW_ID = /^[A-Za-z][A-Za-z0-9:_-]*$/;

type Reviewable = { id: string; element: HTMLElement; box: Box };
type PendingAction = {
  id: string;
  kind: "rejected" | "revision_requested" | "delete";
};

function anchorFor(id: string): string {
  return `[data-review-id="${id}"]`;
}

function latestDecision(
  comments: readonly Comment[],
  id: string,
): CommentReviewDecision | undefined {
  return comments
    .filter(
      (comment) =>
        !comment.parentId &&
        comment.anchor === anchorFor(id) &&
        comment.reviewDecision,
    )
    .at(-1)?.reviewDecision;
}

async function sourceRequest(slug: string): Promise<string> {
  const response = await fetch(
    `${SOURCES_ROUTE}?slug=${encodeURIComponent(slug)}`,
  );
  const payload = (await response.json()) as {
    source?: string;
    error?: string;
  };
  if (!response.ok || typeof payload.source !== "string")
    throw new Error(payload.error ?? "Could not read page source");
  return payload.source;
}

async function mutateSource(
  method: "POST" | "DELETE",
  body: Record<string, unknown>,
): Promise<void> {
  const response = await fetch(`${SOURCES_ROUTE}/reviewables`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok)
    throw new Error(payload.error ?? `${method} reviewable source failed`);
}

export function ReviewProvider({
  page,
  active,
  sourceDirty,
  contentRef,
  scrollRef,
  children,
}: {
  page: string;
  active: boolean;
  sourceDirty: boolean;
  contentRef: RefObject<HTMLElement | null>;
  scrollRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const context = useCommentContext();
  const [items, setItems] = useState<Reviewable[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const frameRef = useRef<number | null>(null);
  const current = useRef({ page, active, sourceDirty, contentRef, scrollRef });
  current.current = { page, active, sourceDirty, contentRef, scrollRef };

  const recompute = useCallback(() => {
    const content = contentRef.current;
    const scroll = scrollRef.current;
    if (!content || !scroll || !active) {
      setItems([]);
      return;
    }
    const seen = new Set<string>();
    const next: Reviewable[] = [];
    for (const element of content.querySelectorAll<HTMLElement>(
      "[data-review-id]",
    )) {
      const id = element.dataset.reviewId ?? "";
      if (!REVIEW_ID.test(id) || seen.has(id)) {
        setError(
          `Review id ${JSON.stringify(id)} must be valid and unique on this page`,
        );
        return;
      }
      seen.add(id);
      next.push({ id, element, box: elementBoxWithin(element, scroll) });
    }
    setItems((previous) =>
      previous.length === next.length &&
      previous.every((item, index) => {
        const candidate = next[index];
        return (
          candidate &&
          item.id === candidate.id &&
          item.element === candidate.element &&
          item.box.left === candidate.box.left &&
          item.box.top === candidate.box.top &&
          item.box.width === candidate.box.width &&
          item.box.height === candidate.box.height
        );
      })
        ? previous
        : next,
    );
  }, [active, contentRef, scrollRef]);

  useEffect(() => {
    const content = contentRef.current;
    const scroll = scrollRef.current;
    if (!content || !scroll) return;
    const schedule = () => {
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        recompute();
      });
    };
    schedule();
    const mutation = new MutationObserver(schedule);
    mutation.observe(content, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-review-id"],
    });
    const resize = new ResizeObserver(schedule);
    resize.observe(content);
    scroll.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      mutation.disconnect();
      resize.disconnect();
      scroll.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [contentRef, recompute, scrollRef]);

  const reviewableFrom = (element: Element): HTMLElement | null => {
    const found = element.closest("[data-review-id]");
    return found instanceof HTMLElement &&
      current.current.contentRef.current?.contains(found)
      ? found
      : null;
  };

  const approve = async (id: string) => {
    setError("");
    try {
      await context.callbacks.onCreate?.({
        anchor: anchorFor(id),
        body: "",
        reviewDecision: "approved",
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const mark = async (element: Element) => {
    const options = current.current;
    if (!options.active || options.sourceDirty)
      throw new Error("Save or revert the source before marking an element");
    const api = window.__REACT_GRAB__;
    if (!api) throw new Error("React Grab is not ready");
    const source = await api.getSource(element);
    const expectedSource = await sourceRequest(options.page);
    await mutateSource("POST", {
      slug: options.page,
      expectedSource,
      ...(element.id ? { domId: element.id } : {}),
      ...(source?.filePath ? { sourcePath: source.filePath } : {}),
      ...(source?.lineNumber ? { line: source.lineNumber } : {}),
      ...(source?.columnNumber ? { column: source.columnNumber } : {}),
    });
    window.location.reload();
  };

  const submit = async () => {
    if (!pending || busy) return;
    const { id, kind } = pending;
    if (kind !== "delete" && !draft.trim()) return;
    setBusy(true);
    setError("");
    try {
      if (kind === "delete") {
        if (sourceDirty)
          throw new Error(
            "Save or revert the source before deleting an element",
          );
        const element = items.find((item) => item.id === id)?.element;
        if (!element)
          throw new Error(
            `Review element ${JSON.stringify(id)} is no longer on the page`,
          );
        const associatedCommentIds = context.comments
          .filter((comment) => {
            if (comment.parentId || !comment.anchor) return false;
            const target = resolveAnchor(
              contentRef.current ?? element,
              comment.anchor,
            );
            return target !== null && element.contains(target);
          })
          .map((comment) => comment.id);
        await mutateSource("DELETE", {
          slug: page,
          reviewId: id,
          associatedCommentIds,
          expectedSource: await sourceRequest(page),
        });
        window.location.reload();
      } else {
        await context.callbacks.onCreate?.({
          anchor: anchorFor(id),
          body: draft.trim(),
          reviewDecision: kind,
        });
        setPending(null);
        setDraft("");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  const latest = useRef({
    mark,
    approve,
    setPending,
    setError,
    reviewableFrom,
  });
  latest.current = { mark, approve, setPending, setError, reviewableFrom };

  useEffect(() => {
    let registered = false;
    const register = () => {
      const api = window.__REACT_GRAB__;
      if (!api || registered) return;
      api.registerPlugin({
        name: "playground-review",
        actions: [
          {
            id: "make-reviewable",
            label: "Make reviewable",
            enabled: ({ element }) =>
              current.current.active &&
              !current.current.sourceDirty &&
              Boolean(current.current.contentRef.current?.contains(element)) &&
              !latest.current.reviewableFrom(element),
            onAction: async (action) => {
              action.hideContextMenu();
              action.cleanup();
              try {
                await latest.current.mark(action.element);
              } catch (cause) {
                latest.current.setError(
                  cause instanceof Error ? cause.message : String(cause),
                );
              }
            },
          },
          ...(
            ["approved", "rejected", "revision_requested", "delete"] as const
          ).map((kind) => ({
            id: `review-${kind}`,
            label:
              kind === "approved"
                ? "Approve"
                : kind === "rejected"
                  ? "Reject with comment"
                  : kind === "revision_requested"
                    ? "Request revision"
                    : "Delete source and feedback",
            enabled: ({ element }: { element: Element }) =>
              Boolean(
                current.current.active &&
                latest.current.reviewableFrom(element) &&
                (kind !== "delete" || !current.current.sourceDirty),
              ),
            onAction: (action: {
              element: Element;
              hideContextMenu: () => void;
              cleanup: () => void;
            }) => {
              const target = latest.current.reviewableFrom(action.element);
              if (!target?.dataset.reviewId)
                throw new Error("selected element is not reviewable");
              action.hideContextMenu();
              action.cleanup();
              if (kind === "approved")
                void latest.current.approve(target.dataset.reviewId);
              else
                latest.current.setPending({
                  id: target.dataset.reviewId,
                  kind,
                });
            },
          })),
        ],
      });
      registered = true;
    };
    window.addEventListener("react-grab:init", register);
    register();
    return () => {
      window.removeEventListener("react-grab:init", register);
      if (registered)
        window.__REACT_GRAB__?.unregisterPlugin("playground-review");
    };
  }, []);

  return (
    <>
      {children}
      {active && (
        <div
          className="pointer-events-none absolute inset-0 z-20"
          aria-label="Review controls"
        >
          {items.map(({ id, box }) => {
            const decision = latestDecision(context.comments, id);
            return (
              <div
                key={id}
                data-review-controls-for={id}
                className="pointer-events-auto absolute flex items-center gap-1 rounded-md border border-border bg-background px-1 py-0.5 text-[10px] shadow-sm"
                style={{
                  left: box.left + box.width - 4,
                  top: box.top,
                  transform: "translateX(-100%)",
                }}
              >
                <span className="font-medium text-muted-foreground">
                  {decision === "approved"
                    ? "Approved"
                    : decision === "rejected"
                      ? "Rejected"
                      : decision === "revision_requested"
                        ? "Revision requested"
                        : "Review"}
                </span>
                <button
                  type="button"
                  aria-label={`Approve ${id}`}
                  title="Approve"
                  onClick={() => void approve(id)}
                >
                  <UiCheck className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Reject ${id}`}
                  title="Reject with comment"
                  onClick={() => setPending({ id, kind: "rejected" })}
                >
                  <UiClose className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Request revision ${id}`}
                  title="Request revision"
                  onClick={() => setPending({ id, kind: "revision_requested" })}
                >
                  <UiEdit className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${id}`}
                  title={
                    sourceDirty
                      ? "Save or revert source first"
                      : "Delete source and feedback"
                  }
                  disabled={sourceDirty || !import.meta.env.DEV}
                  onClick={() => setPending({ id, kind: "delete" })}
                >
                  <UiTrash className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="absolute bottom-2 left-2 z-50 max-w-lg rounded-md border border-destructive bg-background p-2 text-xs text-destructive"
        >
          {error}
        </div>
      )}
      <Modal
        open={pending !== null}
        onClose={() => {
          if (!busy) setPending(null);
        }}
        title={
          pending?.kind === "delete"
            ? "Delete reviewable element"
            : pending?.kind === "rejected"
              ? "Reject with comment"
              : "Request revision"
        }
        size="sm"
        expandable={false}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPending(null)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant={pending?.kind === "delete" ? "destructive" : "default"}
              loading={busy}
              disabled={pending?.kind !== "delete" && !draft.trim()}
              onClick={() => void submit()}
            >
              {pending?.kind === "delete"
                ? "Delete source and feedback"
                : "Save decision"}
            </Button>
          </div>
        }
      >
        {pending?.kind === "delete" ? (
          <p className="text-sm">
            Remove {pending.id} from {page} source and delete its associated
            feedback?
          </p>
        ) : (
          <label className="block text-sm font-medium">
            Comment
            <InputField
              as="textarea"
              rows={4}
              value={draft}
              onChange={setDraft}
              className="mt-2"
            />
          </label>
        )}
      </Modal>
    </>
  );
}
