import type { ReactNode } from "react";
import { CodeBlock } from "../CodeBlock";
import { CodeDiff } from "../CodeDiff";
import type {
  SessionQuestion,
  ToolDiff,
  ToolParam,
} from "./SessionViewer.input";

export function QuestionCard({
  question,
  index,
}: {
  question: SessionQuestion;
  index: number;
}) {
  const label =
    question.context ||
    (question.id ? `Question ${question.id}` : `Question ${index + 1}`);
  return (
    <div className="rounded-md border border-sky-500/20 bg-sky-500/5 px-density-3 py-density-2">
      <div className="text-[11px] font-medium uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 whitespace-pre-wrap break-words text-sm text-foreground">
        {question.text}
      </div>
      {question.options.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {question.options.map((option) => (
            <span
              key={option.value}
              className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground"
            >
              <span className="font-medium text-foreground">
                {option.label}
              </span>
              {option.description && (
                <span className="ml-1">{option.description}</span>
              )}
            </span>
          ))}
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
    <div className="overflow-x-auto text-xs">
      <CodeBlock bare language={language} source={source} />
    </div>
  );
}
