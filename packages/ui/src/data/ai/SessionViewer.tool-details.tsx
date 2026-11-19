import type { ReactNode } from "react";
import { DensityValueProvider } from "../../hooks/density-provider";
import { CodeBlock } from "../CodeBlock";
import { CodeDiff } from "../CodeDiff";
import { Icon } from "../Icon";
import { cn } from "../../lib/utils";
import { UiCheck, UiCircleOutline } from "../../icons";
import {
  optionAnswered,
  type SessionQuestion,
  type ToolDiff,
  type ToolParam,
} from "./SessionViewer.input";

/**
 * One question with its options listed one per line. Once `answer` is known the
 * chosen options are marked and the rest muted; an answer that matches no
 * option (a typed-in reply) is shown beneath them.
 */
export function QuestionCard({
  question,
  index,
  answer,
}: {
  question: SessionQuestion;
  index: number;
  answer?: readonly string[] | undefined;
}) {
  const label =
    question.context ||
    (question.id ? `Question ${question.id}` : `Question ${index + 1}`);
  const freeText = answer?.filter((value) => !question.options.some((option) => optionAnswered(option, [value]))) ?? [];
  return (
    <div className="rounded-md border border-sky-500/20 bg-sky-500/5 px-density-3 py-density-2" data-question-card="">
      <div className="text-[11px] font-medium uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 whitespace-pre-wrap break-words text-sm text-foreground">
        {question.text}
      </div>
      {question.options.length > 0 && (
        <ul className="mt-1.5 flex list-none flex-col gap-1 p-0">
          {question.options.map((option) => {
            const chosen = !!answer && optionAnswered(option, answer);
            return (
              <li
                key={option.value}
                data-chosen={answer ? String(chosen) : undefined}
                className={cn(
                  "flex items-start gap-1.5 rounded border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground",
                  chosen ? "border-sky-500/60" : "border-border",
                  answer && !chosen && "opacity-50",
                )}
              >
                {answer && (
                  <Icon
                    icon={chosen ? UiCheck : UiCircleOutline}
                    className={cn("mt-0.5 size-3 shrink-0", chosen ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground")}
                    aria-label={chosen ? "Chosen" : "Not chosen"}
                  />
                )}
                <span className="min-w-0">
                  <span className="font-medium text-foreground">{option.label}</span>
                  {option.description && <span className="ml-1">{option.description}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {freeText.length > 0 && (
        <div className="mt-1.5 whitespace-pre-wrap break-words text-xs text-foreground" data-question-free-answer="">
          <span className="mr-1 text-[11px] font-medium uppercase text-muted-foreground">Answer</span>
          {freeText.join(", ")}
        </div>
      )}
    </div>
  );
}

export function InlineParams({ params }: { params: ToolParam[] }) {
  return (
    <span className="min-w-0 flex-1 truncate font-mono text-xs">
      {params.map((param) => (
        <span key={param.name} className="[&:not(:first-child)]:ml-2">
          <span className="text-muted-foreground/70">{param.name}: </span>
          <span className="text-muted-foreground">{param.value}</span>
        </span>
      ))}
    </span>
  );
}

export function DiffBlock({ diff }: { diff: ToolDiff }) {
  return (
    <div className="space-y-1.5">
      {diff.segments.map((segment, index) => (
        <CodeDiff
          key={index}
          bare
          showLineNumbers={false}
          original={segment.original}
          modified={segment.modified}
          {...(diff.language ? { language: diff.language } : {})}
        />
      ))}
    </div>
  );
}

export function ResponseBlock({ response }: { response: string }) {
  const trimmed = response.trim();
  const isJson = trimmed.startsWith("{") || trimmed.startsWith("[");
  return <DetailBlock language={isJson ? "json" : "text"} source={response} />;
}

export function DetailBlock({
  language,
  source,
}: {
  language: string;
  source: string;
}): ReactNode {
  return (
    <DensityValueProvider density="compact">
      <div className="overflow-x-auto text-xs">
        <CodeBlock bare language={language} source={source} jsonFormat="yaml" />
      </div>
    </DensityValueProvider>
  );
}
