import { useState } from "react";
import { UiChevronDown } from "../../icons";
import { cn } from "../../lib/utils";
import { CodeBlock } from "../CodeBlock";
import { Icon } from "../Icon";
import {
  questionsFromApproval,
  questionsFromToolInput,
  shellCommand,
  summarizeToolInput,
  toolDiff,
  toolInputParams,
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
import { hasApprovalBody } from "./approval-request";
import { TypedApprovalBody } from "./SessionViewer.approval-body";
import {
  PendingDecisionControls,
  QuestionDecisionControls,
} from "./SessionViewer.decision-controls";
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

  if (event.tool === "AskUserQuestion" || event.approvalKind === "question") {
    return (
      <QuestionToolBody
        event={event}
        visual={visual}
        onDecision={onPendingToolDecision}
      />
    );
  }

  if (event.pending && hasApprovalBody(event.approvalRequest)) {
    return (
      <div className="not-prose">
        <div className="flex items-center gap-1.5">
          <span className="shrink-0 font-medium text-foreground">
            {visual.label}
          </span>
          <ApprovalBadge event={event} />
        </div>
        <TypedApprovalBody
          event={event}
          request={event.approvalRequest}
          onDecision={onPendingToolDecision}
        />
      </div>
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
            request={event.approvalRequest}
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
          request={event.approvalRequest}
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
  const typedQuestions = event.approvalRequest?.questions;
  const questions = typedQuestions?.length
    ? questionsFromApproval(typedQuestions)
    : questionsFromToolInput(event.toolInput);
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
            request={event.approvalRequest}
            questions={questions}
            onDecision={onDecision}
          />
        )}
      </div>
    </div>
  );
}
