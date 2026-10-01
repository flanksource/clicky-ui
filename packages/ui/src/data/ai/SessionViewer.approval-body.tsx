import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import type { ApprovalRequest } from "./approval-request";
import { questionsFromApproval } from "./SessionViewer.input";
import type { SessionEvent } from "./SessionViewer.model";
import {
  ElicitationFormControls,
  ElicitationUrlControls,
  PermissionsControls,
} from "./SessionViewer.approval-forms";
import type { DecisionHandler } from "./SessionViewer.decision";
import {
  PendingDecisionControls,
  PlanDecisionControls,
  QuestionDecisionControls,
} from "./SessionViewer.decision-controls";
import { Markdown } from "../Markdown";
import { DetailBlock, QuestionCard } from "./SessionViewer.tool-details";

function Badge({ tone, children }: { tone: "amber" | "rose"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[11px] font-medium",
        tone === "amber" && "bg-amber-500/15 text-amber-700 [[data-theme=dark]_&]:text-amber-300",
        tone === "rose" && "bg-rose-500/15 text-rose-700 [[data-theme=dark]_&]:text-rose-300",
      )}
    >
      {children}
    </span>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <dt className="w-14 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 break-all">{children}</dd>
    </div>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return <code className="font-mono text-foreground">{children}</code>;
}

function RequestFacts({ request }: { request: ApprovalRequest }) {
  const { command, filesystem, network, elicitation, plan } = request;
  return (
    <dl className="space-y-1">
      {command?.command && <Fact label="Command"><Mono>{command.command}</Mono></Fact>}
      {command?.stdin && (
        <Fact label="Stdin">
          <span>
            terminal {command.stdin.terminal}: <Mono>{JSON.stringify(command.stdin.chars)}</Mono>
          </span>
        </Fact>
      )}
      {command?.cwd && <Fact label="Cwd"><Mono>{command.cwd}</Mono></Fact>}
      {command?.proposedPolicy && command.proposedPolicy.length > 0 && (
        <Fact label="Rule">
          <span data-approval-proposed-policy className="text-muted-foreground">
            Proposed rule (not applied): {command.proposedPolicy.join(" ")}
          </span>
        </Fact>
      )}
      {filesystem && <Fact label="Action"><span>{filesystem.operation}</span></Fact>}
      {filesystem?.paths?.map((path) => (
        <Fact key={path} label="Path"><Mono>{path}</Mono></Fact>
      ))}
      {filesystem?.changes?.map((change) => (
        <Fact key={`${change.kind}:${change.path}`} label="Change">
          <span className="inline-flex gap-1.5">
            <span className="font-medium">{change.kind}</span>
            <Mono>{change.path}</Mono>
          </span>
        </Fact>
      ))}
      {network?.host && <Fact label="Host"><span>{network.host}</span></Fact>}
      {network?.protocol && <Fact label="Protocol"><span>{network.protocol}</span></Fact>}
      {network?.url && <Fact label="URL"><Mono>{network.url}</Mono></Fact>}
      {network?.command && <Fact label="Command"><Mono>{network.command}</Mono></Fact>}
      {elicitation && <Fact label="Server"><span>{elicitation.server}</span></Fact>}
      {elicitation?.message && <Fact label="Message"><span>{elicitation.message}</span></Fact>}
      {plan?.path && <Fact label="Plan"><Mono>{plan.path}</Mono></Fact>}
      {request.reason && <Fact label="Reason"><span>{request.reason}</span></Fact>}
    </dl>
  );
}

function RequestFlags({ request }: { request: ApprovalRequest }) {
  const unsandboxed = request.command?.unsandboxed === true;
  if (!request.escalates && !unsandboxed) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {request.escalates && <Badge tone="amber">Escalates sandbox</Badge>}
      {unsandboxed && <Badge tone="rose">Unsandboxed</Badge>}
    </div>
  );
}

/** The body of a typed approval: what is being asked for, then the controls for
 *  its kind. Without `onDecision` it only describes the request. */
export function TypedApprovalBody({
  event,
  request,
  onDecision,
}: {
  event: SessionEvent;
  request: ApprovalRequest;
  onDecision?: DecisionHandler | undefined;
}) {
  return (
    <div className="mt-1.5 space-y-1.5" data-approval-kind={request.kind}>
      <RequestFlags request={request} />
      <RequestFacts request={request} />
      {request.kind === "tool" && request.input && (
        <DetailBlock language="json" source={JSON.stringify(request.input, null, 2)} />
      )}
      {request.kind === "plan" && request.plan && (
        <div data-approval-plan className="rounded-md border border-border bg-background p-density-3 text-sm">
          <Markdown text={request.plan.content} />
        </div>
      )}
      {request.kind === "question" &&
        questionsFromApproval(request.questions ?? []).map((question, index) => (
          <QuestionCard key={`${question.id}-${index}`} question={question} index={index} />
        ))}
      {onDecision && <KindControls event={event} request={request} onDecision={onDecision} />}
    </div>
  );
}

function KindControls({
  event,
  request,
  onDecision,
}: {
  event: SessionEvent;
  request: ApprovalRequest;
  onDecision: DecisionHandler;
}) {
  switch (request.kind) {
    case "permissions":
      return <PermissionsControls event={event} request={request} onDecision={onDecision} />;
    case "elicitation":
      if (!request.elicitation) return <MissingPayload request={request} />;
      return request.elicitation.mode === "url" ? (
        <ElicitationUrlControls
          event={event}
          request={request}
          elicitation={request.elicitation}
          onDecision={onDecision}
        />
      ) : (
        <ElicitationFormControls
          event={event}
          request={request}
          elicitation={request.elicitation}
          onDecision={onDecision}
        />
      );
    case "plan":
      if (!request.plan) return <MissingPayload request={request} />;
      return <PlanDecisionControls event={event} request={request} onDecision={onDecision} />;
    case "question":
      return (
        <QuestionDecisionControls
          event={event}
          request={request}
          questions={questionsFromApproval(request.questions ?? [])}
          onDecision={onDecision}
        />
      );
    case "command":
    case "filesystem":
    case "network":
    case "tool":
      return <PendingDecisionControls event={event} request={request} onDecision={onDecision} />;
  }
}

function MissingPayload({ request }: { request: ApprovalRequest }) {
  return (
    <div role="alert" className="text-xs text-rose-600">
      This {request.kind} approval for {request.tool} is missing its {request.kind} payload.
    </div>
  );
}
