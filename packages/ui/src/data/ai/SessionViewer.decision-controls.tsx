import { useState } from "react";
import { Button } from "../../components/button";
import { UiCancel, UiCheck, UiComment, UiStop } from "../../icons";
import { Icon } from "../Icon";
import {
  offeredScopes,
  type ApprovalRequest,
  type ApprovalScope,
} from "./approval-request";
import {
  useDecision,
  type DecisionFields,
  type DecisionHandler,
} from "./SessionViewer.decision";
import type { SessionQuestion } from "./SessionViewer.input";
import type { SessionEvent } from "./SessionViewer.model";

export function DecisionError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="text-xs text-rose-600">
      {message}
    </div>
  );
}

const SCOPE_LABELS: Record<ApprovalScope, string> = {
  request: "This request",
  turn: "This turn",
  session: "This session",
};

/** The buttons every approval shares. Allow, Reject and Reject with comment are
 *  the original set; Cancel (deny + interrupt) shows only on an `interruptible`
 *  request, and the scope choice only lists scopes the request supports. */
export function DecisionActions({
  request,
  busy,
  comment,
  allowLabel = "Allow",
  allowDisabled = false,
  allowFields,
  denyLabel = "Reject",
  commentLabel = "Reject with comment",
  decide,
}: {
  request?: ApprovalRequest | undefined;
  busy: boolean;
  /** The rejection feedback; undefined hides Reject with comment. */
  comment?: string | undefined;
  allowLabel?: string;
  allowDisabled?: boolean;
  /** Fields sent with the allow (answers, grants, content). */
  allowFields?: (() => Omit<DecisionFields, "allow">) | undefined;
  denyLabel?: string;
  /** Label of the deny that carries the comment. */
  commentLabel?: string;
  decide: (fields: DecisionFields) => void;
}) {
  const scopes = offeredScopes(request);
  const [scope, setScope] = useState<ApprovalScope>("request");
  const message = comment?.trim();
  const withMessage = (fields: DecisionFields): DecisionFields => ({
    ...fields,
    ...(message ? { message } : {}),
  });
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        loading={busy}
        disabled={allowDisabled}
        onClick={() =>
          decide({
            allow: true,
            ...(scope !== "request" ? { scope } : {}),
            ...allowFields?.(),
          })
        }
      >
        <Icon icon={UiCheck} />
        {allowLabel}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => decide({ allow: false })}
      >
        <Icon icon={UiCancel} />
        {denyLabel}
      </Button>
      {comment !== undefined && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy || !message}
          onClick={() => decide(withMessage({ allow: false }))}
        >
          <Icon icon={UiComment} />
          {commentLabel}
        </Button>
      )}
      {request?.interruptible && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => decide(withMessage({ allow: false, interrupt: true }))}
        >
          <Icon icon={UiStop} />
          Cancel
        </Button>
      )}
      {scopes.length > 0 && (
        <select
          aria-label="Approval scope"
          value={scope}
          disabled={busy}
          onChange={(event) => setScope(event.target.value as ApprovalScope)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          <option value="request">{SCOPE_LABELS.request}</option>
          {scopes.map((value) => (
            <option key={value} value={value}>
              {SCOPE_LABELS[value]}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export function PendingDecisionControls({
  event,
  request,
  onDecision,
}: {
  event: SessionEvent;
  request?: ApprovalRequest | undefined;
  onDecision: DecisionHandler;
}) {
  const [comment, setComment] = useState("");
  const { busy, error, decide } = useDecision(event, onDecision);
  return (
    <div className="mt-2 space-y-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-density-3">
      <textarea
        aria-label="Decision comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Optional rejection feedback"
        className="min-h-16 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
      />
      <DecisionActions
        request={request}
        busy={busy}
        comment={comment}
        decide={decide}
      />
      <DecisionError message={error} />
    </div>
  );
}

/** A plan approval: approve it as written, or keep planning with the feedback
 *  sent back as the message. A plan is never edited through the decision. */
export function PlanDecisionControls({
  event,
  request,
  onDecision,
}: {
  event: SessionEvent;
  request: ApprovalRequest;
  onDecision: DecisionHandler;
}) {
  const [feedback, setFeedback] = useState("");
  const { busy, error, decide } = useDecision(event, onDecision);
  return (
    <div className="mt-2 space-y-2 rounded-md border border-sky-500/25 bg-sky-500/5 p-density-3">
      <textarea
        aria-label="Plan feedback"
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        placeholder="What should change before this plan is implemented?"
        className="min-h-16 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
      />
      <DecisionActions
        request={request}
        busy={busy}
        comment={feedback}
        allowLabel="Approve plan"
        denyLabel="Keep planning"
        commentLabel="Send feedback"
        decide={decide}
      />
      <DecisionError message={error} />
    </div>
  );
}

export function QuestionDecisionControls({
  event,
  request,
  questions,
  onDecision,
}: {
  event: SessionEvent;
  request?: ApprovalRequest | undefined;
  questions: SessionQuestion[];
  onDecision: DecisionHandler;
}) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [details, setDetails] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");
  const { busy, error, decide } = useDecision(event, onDecision);
  const answerFor = (question: SessionQuestion): string | string[] => {
    const selected = answers[question.id];
    const other = details[question.id]?.trim();
    if (question.options.length && question.isOther && other) {
      return question.multiSelect ? [...(Array.isArray(selected) ? selected : []), other] : other;
    }
    return selected ?? "";
  };
  const canSend = questions.length > 0 && questions.every((question) => {
    const answer = answerFor(question);
    return Array.isArray(answer)
      ? answer.length > 0 && answer.every((value) => value.trim() !== "")
      : answer.trim() !== "";
  });
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
                    Array.isArray(answers[question.id]) &&
                    (answers[question.id] as string[]).includes(option.value)
                  }
                  onChange={(event) =>
                    setAnswers((current) => {
                      const selected = Array.isArray(current[question.id])
                        ? (current[question.id] as string[])
                        : [];
                      return {
                        ...current,
                        [question.id]: event.target.checked
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
                  checked={answers[question.id] === option.value && !details[question.id]?.trim()}
                  onChange={() => {
                    setDetails((current) => ({ ...current, [question.id]: "" }));
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: option.value,
                    }));
                  }}
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
          {(!question.options.length || question.isOther) && <textarea
            aria-label={`${question.text} ${question.options.length ? "other answer" : "answer"}`}
            value={
              question.options.length
                ? (details[question.id] ?? "")
                : typeof answers[question.id] === "string"
                  ? (answers[question.id] as string)
                  : ""
            }
            onChange={(event) =>
              question.options.length
                ? setDetails((current) => ({
                    ...current,
                    [question.id]: event.target.value,
                  }))
                : setAnswers((current) => ({
                    ...current,
                    [question.id]: event.target.value,
                  }))
            }
            placeholder={
              question.options.length ? "Other answer" : "Your answer"
            }
            className="min-h-16 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />}
        </fieldset>
      ))}
      <textarea
        aria-label="Rejection comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Optional rejection feedback"
        className="min-h-16 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
      />
      <DecisionActions
        request={request}
        busy={busy}
        comment={comment}
        allowLabel="Send answer"
        allowDisabled={!canSend}
        allowFields={() => ({
          answers: Object.fromEntries(
            questions.map((question) => [question.id, answerFor(question)]),
          ),
        })}
        decide={decide}
      />
      <DecisionError message={error} />
    </div>
  );
}
