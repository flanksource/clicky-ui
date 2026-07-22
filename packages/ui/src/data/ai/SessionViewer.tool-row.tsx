import { useState } from "react";
import { Button } from "../../components/button";
import { UiCancel, UiCheck, UiChevronDown, UiComment } from "../../icons";
import { cn } from "../../lib/utils";
import { CodeBlock } from "../CodeBlock";
import { Icon } from "../Icon";
import {
  questionsFromToolInput,
  shellCommand,
  summarizeToolInput,
  toolDiff,
  toolInputParams,
  type SessionQuestion,
} from "./SessionViewer.input";
import type { SessionEvent } from "./SessionViewer.model";
import { ApprovalBadge } from "./SessionViewer.row-metadata";
import {
  DetailBlock,
  DiffBlock,
  InlineParams,
  QuestionCard,
  ResponseBlock,
} from "./SessionViewer.tool-details";
import type { SessionToolDecision } from "./SessionViewer";

export function ToolBody({
  event,
  visual,
  defaultExpanded,
  onPendingToolDecision,
}: {
  event: SessionEvent;
  visual: { label: string; summaryOnly: boolean };
  defaultExpanded: boolean;
  onPendingToolDecision?:
    | ((decision: SessionToolDecision) => Promise<void> | void)
    | undefined;
}) {
  const summary = summarizeToolInput(
    event.tool ?? "",
    event.toolInput,
    event.cwd,
  );
  const command = shellCommand(event.tool ?? "", event.toolInput);
  const [open, setOpen] = useState(defaultExpanded);

  if (event.tool === "AskUserQuestion") {
    return (
      <QuestionToolBody
        event={event}
        visual={visual}
        onDecision={onPendingToolDecision}
      />
    );
  }

  if (command !== undefined) {
    return (
      <div className="not-prose">
        <div className="flex items-start gap-1.5">
          <div className="min-w-0 flex-1">
            <CodeBlock bare language="bash" source={command} />
          </div>
          <ApprovalBadge event={event} />
          {event.toolResponse !== undefined && (
            <button
              type="button"
              aria-expanded={open}
              aria-label="Toggle response"
              onClick={() => setOpen((value) => !value)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon
                icon={UiChevronDown}
                className={cn(
                  "size-3 shrink-0 transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
          )}
        </div>
        {open && event.toolResponse !== undefined && (
          <div className="mt-1.5">
            <ResponseBlock response={event.toolResponse} />
          </div>
        )}
        {event.pending && onPendingToolDecision && (
          <PendingDecisionControls
            event={event}
            onDecision={onPendingToolDecision}
          />
        )}
      </div>
    );
  }

  const hasDetail =
    event.toolInput !== undefined || event.toolResponse !== undefined;
  const params = toolInputParams(event.tool ?? "", event.toolInput, event.cwd);
  const diff = toolDiff(event.tool ?? "", event.toolInput);
  const header = (
    <>
      {visual.summaryOnly && summary ? (
        <span className="min-w-0 truncate font-mono text-xs text-foreground ">
          {summary}
        </span>
      ) : (
        <span className="shrink-0 font-medium text-foreground">
          {visual.label}
        </span>
      )}
      {diff && (
        <span className="shrink-0 font-mono text-xs">
          {diff.added > 0 && (
            <span className="text-emerald-600 [[data-theme=dark]_&]:text-emerald-400">
              +{diff.added}
            </span>
          )}
          {diff.removed > 0 && (
            <span className="ml-1 text-rose-600 [[data-theme=dark]_&]:text-rose-400">
              -{diff.removed}
            </span>
          )}
        </span>
      )}
      <ApprovalBadge event={event} />
      {params.length > 0 && <InlineParams params={params} />}
    </>
  );

  return (
    <div className="not-prose">
      {hasDetail ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center gap-1.5 text-left hover:text-foreground"
        >
          {header}
          <Icon
            icon={UiChevronDown}
            className={cn(
              "ml-auto size-3 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      ) : (
        <div className="flex items-center gap-1.5">{header}</div>
      )}

      {open && hasDetail && (
        <div className="mt-1.5 space-y-1.5">
          {diff ? (
            <DiffBlock diff={diff} />
          ) : (
            event.toolInput !== undefined && (
              <DetailBlock
                language="json"
                source={JSON.stringify(event.toolInput, null, 2)}
              />
            )
          )}
          {event.toolResponse !== undefined && (
            <ResponseBlock response={event.toolResponse} />
          )}
        </div>
      )}
      {event.pending && onPendingToolDecision && (
        <PendingDecisionControls
          event={event}
          onDecision={onPendingToolDecision}
        />
      )}
    </div>
  );
}

function QuestionToolBody({
  event,
  visual,
  onDecision,
}: {
  event: SessionEvent;
  visual: { label: string };
  onDecision?:
    | ((decision: SessionToolDecision) => Promise<void> | void)
    | undefined;
}) {
  const questions = questionsFromToolInput(event.toolInput);
  const summary = summarizeToolInput(
    event.tool ?? "",
    event.toolInput,
    event.cwd,
  );

  return (
    <div className="not-prose">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="shrink-0 font-medium text-foreground">
          {visual.label}
        </span>
        <ApprovalBadge event={event} />
        {summary && questions.length !== 1 && (
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {summary}
          </span>
        )}
      </div>
      <div className="mt-1.5 space-y-1.5">
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <QuestionCard
              key={`${question.id}-${index}`}
              question={question}
              index={index}
            />
          ))
        ) : event.toolInput ? (
          <DetailBlock
            language="json"
            source={JSON.stringify(event.toolInput, null, 2)}
          />
        ) : null}
        {event.toolResponse !== undefined && (
          <div className="space-y-1">
            <div className="text-[11px] font-medium uppercase text-muted-foreground">
              Answer
            </div>
            <ResponseBlock response={event.toolResponse} />
          </div>
        )}
        {event.pending && onDecision && (
          <QuestionDecisionControls
            event={event}
            questions={questions}
            onDecision={onDecision}
          />
        )}
      </div>
    </div>
  );
}

function PendingDecisionControls({
  event,
  onDecision,
}: {
  event: SessionEvent;
  onDecision: (decision: SessionToolDecision) => Promise<void> | void;
}) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const decide = async (allow: boolean, message?: string) => {
    setBusy(true);
    setError("");
    try {
      await onDecision({ event, allow, ...(message ? { message } : {}) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-2 space-y-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-density-3">
      <textarea
        aria-label="Decision comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Optional rejection feedback"
        className="min-h-16 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" loading={busy} onClick={() => decide(true)}>
          <Icon icon={UiCheck} />
          Allow
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => decide(false)}
        >
          <Icon icon={UiCancel} />
          Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy || !comment.trim()}
          onClick={() => decide(false, comment.trim())}
        >
          <Icon icon={UiComment} />
          Reject with comment
        </Button>
      </div>
      {error && (
        <div role="alert" className="text-xs text-rose-600">
          {error}
        </div>
      )}
    </div>
  );
}

function QuestionDecisionControls({
  event,
  questions,
  onDecision,
}: {
  event: SessionEvent;
  questions: SessionQuestion[];
  onDecision: (decision: SessionToolDecision) => Promise<void> | void;
}) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [details, setDetails] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const decide = async (allow: boolean, message?: string) => {
    setBusy(true);
    setError("");
    const submittedAnswers = Object.fromEntries(
      Object.entries(answers).map(([question, answer]) => {
        const detail = details[question]?.trim();
        if (!detail) return [question, answer];
        return [
          question,
          Array.isArray(answer)
            ? [...answer, `Additional details: ${detail}`]
            : `${answer}\nAdditional details: ${detail}`,
        ];
      }),
    );
    try {
      await onDecision({
        event,
        allow,
        answers: submittedAnswers,
        ...(message ? { message } : {}),
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-3 rounded-md border border-sky-500/25 bg-sky-500/5 p-density-3">
      {questions.map((question) => (
        <fieldset key={question.id} className="space-y-1.5">
          <legend className="text-sm font-medium text-foreground">
            {question.text}
          </legend>
          {question.options.map((option) =>
            question.multiSelect ? (
              <label
                key={option.value}
                className="flex items-start gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={
                    Array.isArray(answers[question.text]) &&
                    (answers[question.text] as string[]).includes(option.value)
                  }
                  onChange={(event) =>
                    setAnswers((current) => {
                      const selected = Array.isArray(current[question.text])
                        ? (current[question.text] as string[])
                        : [];
                      return {
                        ...current,
                        [question.text]: event.target.checked
                          ? [...selected, option.value]
                          : selected.filter((value) => value !== option.value),
                      };
                    })
                  }
                />
                <span>
                  {option.label}
                  {option.description && (
                    <span className="ml-1 text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </span>
              </label>
            ) : (
              <label
                key={option.value}
                className="flex items-start gap-2 text-sm"
              >
                <input
                  type="radio"
                  name={`question-${event.id}-${question.id}`}
                  value={option.value}
                  checked={answers[question.text] === option.value}
                  onChange={() =>
                    setAnswers((current) => ({
                      ...current,
                      [question.text]: option.value,
                    }))
                  }
                />
                <span>
                  {option.label}
                  {option.description && (
                    <span className="ml-1 text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </span>
              </label>
            ),
          )}
          <textarea
            aria-label={`${question.text} additional details`}
            value={
              question.options.length
                ? (details[question.text] ?? "")
                : typeof answers[question.text] === "string"
                  ? (answers[question.text] as string)
                  : ""
            }
            onChange={(event) =>
              question.options.length
                ? setDetails((current) => ({
                    ...current,
                    [question.text]: event.target.value,
                  }))
                : setAnswers((current) => ({
                    ...current,
                    [question.text]: event.target.value,
                  }))
            }
            placeholder={
              question.options.length ? "Additional details" : "Your answer"
            }
            className="min-h-16 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />
        </fieldset>
      ))}
      <textarea
        aria-label="Rejection comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Optional rejection feedback"
        className="min-h-16 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" loading={busy} onClick={() => decide(true)}>
          <Icon icon={UiCheck} />
          Send answer
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => decide(false)}
        >
          <Icon icon={UiCancel} />
          Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy || !comment.trim()}
          onClick={() => decide(false, comment.trim())}
        >
          <Icon icon={UiComment} />
          Reject with comment
        </Button>
      </div>
      {error && (
        <div role="alert" className="text-xs text-rose-600">
          {error}
        </div>
      )}
    </div>
  );
}
