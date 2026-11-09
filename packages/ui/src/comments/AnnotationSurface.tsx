import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../components/button";
import { CommentProvider } from "./CommentProvider";
import { CommentRail } from "./CommentRail";
import { CommentSidePanel } from "./CommentSidePanel";
import { CommentDraftPopover } from "./CommentDraftPopover";
import { CommentDraftCard } from "./CommentDraftCard";
import {
  DEFAULT_COMMENT_STATUSES,
  type Comment,
  type CommentCallbacks,
  type CommentCreateInput,
} from "./comment-types";
import { useCommentContext } from "./comment-context";
import { CapturePin } from "./CapturePin";
import { elementLabel, useElementPicker } from "./element-picker";
import {
  captureLocators,
  commentAnchor,
  resolveComment,
} from "./anchoring/dom-anchor";
import {
  captureScreenshot,
  releaseScreenshotCapture,
  screenshotCaptureSupported,
} from "./annotation-screenshot";
import type {
  AnnotationCapture,
  CommentScreenshotCapture,
} from "./annotation-types";

const config = { statuses: DEFAULT_COMMENT_STATUSES };
export type AnnotationSurfaceProps = Omit<CommentCallbacks, "onCreate"> & {
  documentKey: string;
  comments: Comment[];
  captures: Record<string, AnnotationCapture>;
  children: ReactNode;
  error?: string;
  view: AnnotationCapture["view"];
  selection?: AnnotationCapture | null;
  onSelectionHandled?: () => void;
  onSelectCapture?: (id: string, capture: AnnotationCapture) => void;
  onPrepareCapture?: (capture: AnnotationCapture) => Promise<AnnotationCapture>;
  onCreate: (
    input: CommentCreateInput,
    capture: AnnotationCapture,
    screenshot?: CommentScreenshotCapture,
  ) => Promise<void>;
};
/** Controlled annotation UI. Storage and source navigation belong to its host. */
export function AnnotationSurface({
  documentKey,
  comments,
  captures,
  children,
  error,
  view,
  selection,
  onSelectionHandled,
  onSelectCapture,
  onPrepareCapture,
  onCreate,
  ...callbacks
}: AnnotationSurfaceProps) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const storageKey = `${documentKey}:capture`;
  const [draft, setDraft] = useState<{
    capture: AnnotationCapture;
    element?: Element;
  } | null>(() => {
    const saved = sessionStorage.getItem(storageKey);
    return saved ? { capture: JSON.parse(saved) as AnnotationCapture } : null;
  });
  const [captureError, setCaptureError] = useState("");
  const prepare = async (capture: AnnotationCapture, element?: Element) => {
    try {
      const prepared = onPrepareCapture
        ? await onPrepareCapture(capture)
        : capture;
      setDraft({ capture: prepared, ...(element ? { element } : {}) });
      setCaptureError("");
    } catch (cause) {
      setCaptureError(String(cause));
    }
  };
  useEffect(() => {
    if (draft)
      sessionStorage.setItem(storageKey, JSON.stringify(draft.capture));
    else sessionStorage.removeItem(storageKey);
  }, [draft, storageKey]);
  const picker = useElementPicker({
    root,
    onPick: (element) => {
      if (!root.current) return;
      const anchor = commentAnchor(element, root.current);
      if (!anchor) throw new Error("Selected element cannot be anchored");
      const source = element
        .closest("[data-editable-source]")
        ?.getAttribute("data-editable-source");
      void prepare(
        {
          kind: "dom",
          version: 1,
          view,
          anchor,
          html: element.outerHTML.slice(0, 4096),
          label: elementLabel(element),
          locators: captureLocators(element, root.current),
          ...(source ? { source } : {}),
        },
        element,
      );
    },
  });
  const [pins, setPins] = useState<{ id: string; element: Element }[]>([]);
  useEffect(() => {
    if (selection) {
      void prepare(selection);
      setOpen(true);
      onSelectionHandled?.();
    }
  }, [selection]);
  useEffect(() => () => releaseScreenshotCapture(), []);
  useEffect(() => {
    const content = root.current;
    if (!content) return;
    const update = () =>
      setPins(
        comments.flatMap((comment) => {
          const capture = captures[comment.id];
          if (
            !capture?.anchor ||
            capture.view !== view ||
            capture.kind !== "dom"
          )
            return [];
          const match = resolveComment(
            content,
            capture.anchor,
            capture.locators ?? [],
          );
          return match ? [{ id: comment.id, element: match.element }] : [];
        }),
      );
    update();
    const observer = new MutationObserver(update);
    observer.observe(content, { childList: true, subtree: true });
    content.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      content.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [comments, captures, view]);
  const create = async (input: CommentCreateInput, action?: string) => {
    const capture =
      draft?.capture ??
      (await (onPrepareCapture?.({ kind: "document", version: 1, view }) ??
        Promise.resolve({ kind: "document", version: 1, view } as const)));
    const target = draft?.element ?? root.current;
    if (!target) throw new Error("Comment target is not mounted");
    const screenshot =
      action === "screenshot" ? await captureScreenshot(target) : undefined;
    await onCreate(input, capture, screenshot);
    setDraft(null);
    setOpen(true);
  };
  const actions = [
    { id: "plain", label: "Post comment" },
    ...(screenshotCaptureSupported()
      ? [{ id: "screenshot", label: "Post with screenshot" }]
      : []),
  ];
  return (
    <CommentProvider
      initialRailMode="all"
      onScrollToAnchor={(id) => {
        const capture = captures[id];
        if (!capture) return false;
        onSelectCapture?.(id, capture);
        const element = pins.find((pin) => pin.id === id)?.element;
        element?.scrollIntoView?.({ block: "center" });
        return (
          capture.kind === "document" ||
          Boolean(element) ||
          capture.location?.state === "matched"
        );
      }}
      onRailModeChange={(mode) => {
        if (mode === "closed") setOpen(false);
      }}
      persistenceKey={documentKey}
      comments={comments}
      config={config}
      {...callbacks}
      onCreate={create}
    >
      <AnnotationRailState open={open} />
      <AnnotationAnchors
        root={root}
        captures={captures}
        pins={pins}
        view={view}
      />
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex flex-wrap gap-2 py-1">
          <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
            Comments
          </Button>
          <Button
            size="sm"
            variant="outline"
            aria-pressed={picker.picking}
            onClick={() => picker.setPicking(!picker.picking)}
          >
            Comment on element
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              void prepare({ kind: "document", version: 1, view });
              setOpen(true);
            }}
          >
            Comment on file
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const feedback = comments
                .map((comment) => {
                  const capture = captures[comment.parentId ?? comment.id];
                  return `### ${comment.author?.name ?? "User"}\n\n${comment.body}\n\n${capture ? `\u0060\u0060\u0060json\n${JSON.stringify(capture, null, 2)}\n\u0060\u0060\u0060` : ""}`;
                })
                .join("\n\n");
              void navigator.clipboard
                .writeText(`${documentKey}\n${location.href}\n\n${feedback}`)
                .catch((cause) =>
                  setCaptureError(`Copy feedback failed: ${String(cause)}`),
                );
            }}
          >
            Copy feedback
          </Button>
        </div>
        {(error || captureError) && <p role="alert">{error || captureError}</p>}
        <div className="flex min-h-0 flex-1">
          <div
            ref={root}
            className="relative min-w-0 flex-1"
            {...picker.rootProps}
          >
            {children}
            {picker.outline}
            {pins.map((pin, index) => {
              const box = pin.element.getBoundingClientRect(),
                parent = root.current?.getBoundingClientRect();
              return (
                <CapturePin
                  key={pin.id}
                  id={pin.id}
                  index={index}
                  left={box.right - (parent?.left ?? 0)}
                  top={box.top - (parent?.top ?? 0)}
                  onSelect={() => {
                    setOpen(true);
                    const capture = captures[pin.id];
                    if (capture) onSelectCapture?.(pin.id, capture);
                  }}
                />
              );
            })}
          </div>
          <CommentRail open={open} onOpenChange={setOpen}>
            <div className="p-3">
              {draft && !draft.element && (
                <CommentDraftCard
                  label={
                    draft.capture.kind === "code-range"
                      ? "Source selection"
                      : draft.capture.kind === "document"
                        ? "File comment"
                        : "Saved element selection"
                  }
                  anchor={draft.capture.anchor ?? "source-selection"}
                  config={config}
                  onCreate={create}
                  onDiscard={() => setDraft(null)}
                />
              )}
              <CommentSidePanel
                formatAnchorLabel={(id) => {
                  const capture = captures[id];
                  return (
                    capture?.label ??
                    (capture?.kind === "document"
                      ? "File"
                      : capture?.patch
                        ? `Lines ${capture.patch.startLine}–${capture.patch.endLine}`
                        : "Element")
                  );
                }}
                hideComposer={Boolean(draft)}
                createActions={actions}
                detailTabs={[
                  {
                    id: "capture",
                    label: "Capture",
                    render: (thread) => {
                      const capture = captures[thread[0]!.id];
                      return (
                        <>
                          {capture?.screenshotUrl && (
                            <a
                              href={capture.screenshotUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={capture.screenshotUrl}
                                alt="Captured comment target"
                              />
                            </a>
                          )}
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(capture, null, 2)}
                          </pre>
                        </>
                      );
                    },
                  },
                ]}
                renderRootDetails={(comment) => {
                  const capture = captures[comment.id];
                  return capture ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectCapture?.(comment.id, capture)}
                    >
                      Show target
                    </Button>
                  ) : null;
                }}
              />
            </div>
          </CommentRail>
        </div>
        {draft?.element && (
          <CommentDraftPopover
            reference={draft.element}
            label="Selected element"
            anchor={draft.capture.anchor!}
            config={config}
            createActions={actions}
            onCreate={create}
            onDiscard={() => setDraft(null)}
          />
        )}
      </div>
    </CommentProvider>
  );
}

function AnnotationRailState({ open }: { open: boolean }) {
  const context = useCommentContext();
  useEffect(() => {
    if (open && context.railMode === "closed") context.openCommentList();
  }, [open, context]);
  return null;
}

function AnnotationAnchors({
  root,
  captures,
  pins,
  view,
}: {
  root: { current: HTMLDivElement | null };
  captures: Record<string, AnnotationCapture>;
  pins: { id: string; element: Element }[];
  view: AnnotationCapture["view"];
}) {
  const context = useCommentContext();
  useEffect(() => {
    context.contentRef.current = root.current;
    for (const [id, capture] of Object.entries(captures)) {
      const element =
        capture.kind === "document" ||
        (capture.kind === "code-range" &&
          view === "source" &&
          capture.location?.state === "matched")
          ? root.current
          : (pins.find((pin) => pin.id === id)?.element ?? null);
      context.registerAnchor(id, element);
    }
    return () => {
      for (const id of Object.keys(captures)) context.registerAnchor(id, null);
    };
  }, [context, root, captures, pins, view]);
  return null;
}
