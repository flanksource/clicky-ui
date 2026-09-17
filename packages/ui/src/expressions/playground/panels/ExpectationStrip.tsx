import { useState } from "react";
import { Badge } from "../../../data/Badge";
import { UiCheck, UiWarningTriangle } from "../../../icons";
import type { EvalResponse, ResultExpectation } from "../api.ts";

/** Chips shown before the list collapses behind "+N more". */
const OPTION_LIMIT = 12;

interface ExpectationStripProps {
  expectation: ResultExpectation;
  response: EvalResponse | null;
  /** The response predates the current source or input. */
  stale: boolean;
}

/**
 * What the result has to be, beside what it is.
 *
 * An expression that evaluates cleanly can still produce a value its target
 * rejects -- a code that is not in the list, text where a number goes -- and
 * that only surfaces much later, when the value is used. So the allowed values
 * and rules sit above the result, and the host's validator judges it here.
 */
export function ExpectationStrip({ expectation, response, stale }: ExpectationStripProps) {
  const [showAll, setShowAll] = useState(false);
  const options = expectation.options ?? [];
  const rules = expectation.rules ?? [];
  const succeeded = response && !response.error ? response : null;
  // Exact, not trimmed: the validator judges the raw result, and a chip must
  // never read as matched beside a verdict that rejects the same value.
  const result = succeeded?.result;
  const shown = showAll ? options : options.slice(0, OPTION_LIMIT);
  const issues = succeeded && expectation.validate ? expectation.validate(succeeded) : null;

  if (options.length === 0 && rules.length === 0 && issues === null) return null;

  return (
    <section
      aria-label="Expected result"
      className={`space-y-1.5 border-b border-border px-4 py-2 text-xs ${stale && response ? "opacity-50" : ""}`}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-medium uppercase tracking-wide text-muted-foreground">Expected</span>
        {rules.length > 0 ? <span>{rules.join(" · ")}</span> : null}
      </div>

      {options.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-1">
          {shown.map((option) => {
            const matched = result !== undefined && option.value === result;
            return (
              <li key={option.value} data-testid="expected-option" data-matched={matched}>
                <Badge tone={matched ? "success" : "neutral"} variant={matched ? "soft" : "outline"} size="sm">
                  <code className="font-mono">{option.value}</code>
                  {option.label && option.label !== option.value ? (
                    <span className="ml-1 text-muted-foreground">{option.label}</span>
                  ) : null}
                </Badge>
              </li>
            );
          })}
          {options.length > OPTION_LIMIT && !showAll ? (
            <li>
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="rounded px-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                +{options.length - OPTION_LIMIT} more
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}

      {issues === null ? null : issues.length === 0 ? (
        <p role="status" className="flex items-center gap-1 text-green-700 dark:text-green-400">
          <UiCheck className="size-3.5 shrink-0" aria-hidden="true" />
          Valid
        </p>
      ) : (
        <ul role="status" className="space-y-0.5 text-destructive">
          {issues.map((issue) => (
            <li key={issue} className="flex items-start gap-1">
              <UiWarningTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
              {issue}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
