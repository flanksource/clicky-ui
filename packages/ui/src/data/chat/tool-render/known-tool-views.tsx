import type { ReactNode } from "react";
import { CodeBlock } from "../../CodeBlock";
import { CodeDiff } from "../../CodeDiff";
import { languageFromPath } from "../../code-highlight";
import type { ToolRenderAdapterContext } from "./adapter";
import { ToolParams } from "./ToolParams";
import { ToolValue } from "./ToolValue";

function inputRecord(
  ctx: ToolRenderAdapterContext,
): Record<string, unknown> | null {
  return typeof ctx.input === "object" &&
    ctx.input !== null &&
    !Array.isArray(ctx.input)
    ? (ctx.input as Record<string, unknown>)
    : null;
}

function stringField(
  input: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = input[key];
    if (typeof value === "string" && value !== "") return value;
  }
  return "";
}

function remainingInput(
  input: Record<string, unknown>,
  consumed: readonly string[],
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([key, value]) => {
      return (
        !consumed.includes(key) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      );
    }),
  );
}

function ExtraParams({
  ctx,
  consumed,
}: {
  ctx: ToolRenderAdapterContext;
  consumed: readonly string[];
}): ReactNode {
  const input = inputRecord(ctx);
  if (!input) return null;
  const remaining = remainingInput(input, consumed);
  if (Object.keys(remaining).length === 0) return null;
  return (
    <ToolParams
      input={remaining}
      {...(ctx.tool?.inputSchema ? { schema: ctx.tool.inputSchema } : {})}
    />
  );
}

function renderTextOutput(
  ctx: ToolRenderAdapterContext,
  slot: string,
): ReactNode {
  if (typeof ctx.output !== "string") return ctx.defaultView;
  return (
    <div data-slot={slot}>
      <CodeBlock bare language="text" source={ctx.output} />
    </div>
  );
}

export function ShellInput(ctx: ToolRenderAdapterContext): ReactNode {
  const input = inputRecord(ctx);
  if (!input) return ctx.defaultView;
  const command = stringField(input, "command", "cmd");
  if (!command) return ctx.defaultView;
  return (
    <div data-slot="tool-render-shell-input" className="space-y-1.5">
      <CodeBlock bare language="bash" source={command} />
      <ExtraParams ctx={ctx} consumed={["command", "cmd"]} />
    </div>
  );
}

export function ShellOutput(ctx: ToolRenderAdapterContext): ReactNode {
  return renderTextOutput(ctx, "tool-render-shell-output");
}

export function TextToolOutput(ctx: ToolRenderAdapterContext): ReactNode {
  return renderTextOutput(ctx, "tool-render-text-output");
}

export function FileReadOutput(ctx: ToolRenderAdapterContext): ReactNode {
  if (typeof ctx.output !== "string") return ctx.defaultView;
  const input = inputRecord(ctx);
  const path = input
    ? stringField(input, "file_path", "notebook_path", "path")
    : "";
  const language = languageFromPath(path);
  return (
    <div data-slot="tool-render-file-read">
      <CodeBlock bare source={ctx.output} {...(language ? { language } : {})} />
    </div>
  );
}

type EditSegment = {
  original: string;
  modified: string;
};

function editSegments(
  toolName: string,
  input: Record<string, unknown>,
): EditSegment[] {
  if (toolName === "Write") {
    const content = stringField(input, "content");
    return content ? [{ original: "", modified: content }] : [];
  }
  if (toolName === "Edit" || toolName === "NotebookEdit") {
    const original = stringField(input, "old_string", "old_source");
    const modified = stringField(input, "new_string", "new_source");
    return original || modified ? [{ original, modified }] : [];
  }
  if (toolName !== "MultiEdit" || !Array.isArray(input["edits"])) return [];
  return input["edits"].flatMap((edit) => {
    if (typeof edit !== "object" || edit === null || Array.isArray(edit))
      return [];
    const record = edit as Record<string, unknown>;
    const original = stringField(record, "old_string");
    const modified = stringField(record, "new_string");
    return original || modified ? [{ original, modified }] : [];
  });
}

export function FileEditInput(ctx: ToolRenderAdapterContext): ReactNode {
  const input = inputRecord(ctx);
  if (!input) return ctx.defaultView;
  const path = stringField(input, "file_path", "notebook_path", "path");
  const patch =
    ctx.toolName === "apply_patch" ? stringField(input, "patch") : "";
  const segments = editSegments(ctx.toolName, input);
  if (!patch && segments.length === 0) return ctx.defaultView;
  const language = languageFromPath(path);
  return (
    <div data-slot="tool-render-file-edit" className="space-y-1.5">
      {path && (
        <div className="truncate font-mono text-[11px] text-muted-foreground">
          {path}
        </div>
      )}
      {patch ? (
        <CodeBlock bare language="diff" source={patch} />
      ) : (
        segments.map((segment, index) => (
          <CodeDiff
            key={index}
            bare
            showLineNumbers={false}
            original={segment.original}
            modified={segment.modified}
            {...(language ? { language } : {})}
          />
        ))
      )}
      <ExtraParams
        ctx={ctx}
        consumed={[
          "file_path",
          "notebook_path",
          "path",
          "content",
          "old_string",
          "old_source",
          "new_string",
          "new_source",
          "edits",
          "patch",
        ]}
      />
    </div>
  );
}

export function PlanInput(ctx: ToolRenderAdapterContext): ReactNode {
  const input = inputRecord(ctx);
  if (!input) return ctx.defaultView;
  const key = Array.isArray(input["plan"])
    ? "plan"
    : Array.isArray(input["todos"])
      ? "todos"
      : "";
  if (!key) return ctx.defaultView;
  return (
    <div data-slot="tool-render-plan" className="space-y-1.5">
      <ExtraParams ctx={ctx} consumed={[key]} />
      <ToolValue
        value={input[key]}
        {...(ctx.options.maxRows !== undefined
          ? { maxRows: ctx.options.maxRows }
          : {})}
      />
    </div>
  );
}

type Question = {
  heading: string;
  text: string;
  options: { label: string; description: string }[];
};

function questionFromValue(value: unknown): Question | null {
  if (typeof value === "string") {
    return value.trim()
      ? { heading: "", text: value.trim(), options: [] }
      : null;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return null;
  const question = value as Record<string, unknown>;
  const text = stringField(question, "question", "text", "prompt", "label");
  if (!text) return null;
  const options = Array.isArray(question["options"])
    ? question["options"].flatMap((option) => {
        if (typeof option === "string") {
          return option ? [{ label: option, description: "" }] : [];
        }
        if (
          typeof option !== "object" ||
          option === null ||
          Array.isArray(option)
        )
          return [];
        const record = option as Record<string, unknown>;
        const label = stringField(record, "label", "value", "id");
        return label
          ? [{ label, description: stringField(record, "description") }]
          : [];
      })
    : [];
  return {
    heading: stringField(question, "header", "context", "description"),
    text,
    options,
  };
}

export function QuestionInput(ctx: ToolRenderAdapterContext): ReactNode {
  const input = inputRecord(ctx);
  if (!input) return ctx.defaultView;
  const raw = Array.isArray(input["questions"]) ? input["questions"] : [input];
  const questions = raw
    .map(questionFromValue)
    .filter((question): question is Question => question !== null);
  if (questions.length === 0) return ctx.defaultView;
  return (
    <div data-slot="tool-render-question" className="space-y-1.5">
      {questions.map((question, index) => (
        <div
          key={`${question.text}-${index}`}
          className="rounded-md border border-sky-500/20 bg-sky-500/5 px-density-3 py-density-2"
        >
          {question.heading && (
            <div className="text-[11px] font-medium uppercase text-muted-foreground">
              {question.heading}
            </div>
          )}
          <div className="whitespace-pre-wrap break-words text-sm text-foreground">
            {question.text}
          </div>
          {question.options.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {question.options.map((option) => (
                <span
                  key={option.label}
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
      ))}
    </div>
  );
}
