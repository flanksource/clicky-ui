import { useId, useMemo, type ReactNode } from "react";
import { AccordionList } from "../../components/AccordionList";
import { Badge } from "../Badge";
import { parseJsonSource } from "./parse-source";

export function JsonSource({
  source,
  inputFormat,
  renderValue,
}: {
  source: string;
  inputFormat: "json" | "ndjson";
  renderValue: (value: unknown) => ReactNode;
}) {
  const sourceId = useId();
  const result = useMemo(
    () => parseJsonSource(source, inputFormat),
    [source, inputFormat],
  );
  const label = inputFormat === "ndjson" ? "NDJSON" : "JSON";
  if (result.status !== "complete" && !result.diagnostic)
    throw new Error("JSON source status has no diagnostic");
  return (
    <div className="space-y-density-2" data-source-status={result.status}>
      {"value" in result && renderValue(result.value)}
      {result.partialRecord && (
        <div className="space-y-density-1">
          <div className="text-muted-foreground font-sans text-sm">
            Line {result.partialRecord.line} (incomplete record)
          </div>
          {renderValue(result.partialRecord.value)}
        </div>
      )}
      {result.status === "incomplete" &&
        !("value" in result) &&
        !result.partialRecord && (
          <div className="font-sans text-sm text-muted-foreground">
            No completed values received.
          </div>
        )}
      <AccordionList
        idPrefix={sourceId}
        items={[source]}
        readOnly
        renderHeader={() => (
          <span className="flex min-w-0 flex-wrap items-center gap-density-2 font-sans text-sm">
            Original source
            {result.diagnostic && (
              <span
                role={result.status === "invalid" ? "alert" : "status"}
                className="inline-flex flex-wrap items-center gap-density-2"
              >
                <Badge
                  variant="status"
                  status={result.status === "invalid" ? "error" : "warning"}
                  size="xs"
                  clickToCopy={false}
                >
                  {result.status === "invalid" ? "Invalid" : "Incomplete"}{" "}
                  {label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Line {result.diagnostic.line}, column{" "}
                  {result.diagnostic.column}
                </span>
              </span>
            )}
          </span>
        )}
        renderBody={({ item }) => (
          <div className="space-y-density-2">
            {result.diagnostic && (
              <p className="font-sans text-sm text-muted-foreground whitespace-normal">
                {result.diagnostic.message}.
                {result.status === "incomplete" &&
                  " Showing completed values only."}
              </p>
            )}
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words font-mono text-xs">
              {item}
            </pre>
          </div>
        )}
      />
    </div>
  );
}
