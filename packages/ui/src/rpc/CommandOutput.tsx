import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Clicky,
  type ClickyTableRowClick,
  type ClickyTableRowHref,
  type ClickyTableRowPredicate,
} from "../data/Clicky";
import { JsonView } from "../data/JsonView";
import type { ExecutionResponse } from "./types";

export type CommandOutputProps = {
  response: ExecutionResponse;
  bare?: boolean;
  onTableRowClick?: ClickyTableRowClick;
  getTableRowHref?: ClickyTableRowHref;
  isTableRowClickable?: ClickyTableRowPredicate;
};

export function CommandOutput({
  response,
  bare = false,
  onTableRowClick,
  getTableRowHref,
  isTableRowClickable,
}: CommandOutputProps) {
  const text = response.stdout || response.output || "";
  const ct = response.contentType || "application/json";

  const parsed = useMemo(() => {
    if (response.parsed !== undefined) return response.parsed;
    if (!text.trim()) return null;
    try {
      return JSON.parse(text.trim());
    } catch {
      return null;
    }
  }, [response.parsed, text]);

  const output = (
    <OutputBody
      text={text}
      parsed={parsed}
      contentType={ct}
      bare={bare}
      {...(response.blob ? { blob: response.blob } : {})}
      {...(onTableRowClick ? { onTableRowClick } : {})}
      {...(getTableRowHref ? { getTableRowHref } : {})}
      {...(isTableRowClickable ? { isTableRowClickable } : {})}
    />
  );

  if (bare) return output;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span
          className={
            response.success
              ? "rounded-md border px-2 py-0.5 text-xs"
              : "rounded-md bg-destructive px-2 py-0.5 text-xs text-destructive-foreground"
          }
        >
          {response.success ? "Success" : "Failed"}
        </span>
        <span className="rounded-md border px-2 py-0.5 font-mono text-xs">
          exit {response.exit_code}
        </span>
        {ct !== "application/json" && (
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground">
            {ct.split(";")[0]}
          </span>
        )}
        {response.error && <span className="text-sm text-destructive">{response.error}</span>}
      </div>

      {response.cli && (
        <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
          $ {response.cli}
        </pre>
      )}

      {output}
    </div>
  );
}

function OutputBody({
  text,
  parsed,
  contentType,
  blob,
  bare,
  onTableRowClick,
  getTableRowHref,
  isTableRowClickable,
}: {
  text: string;
  parsed: unknown;
  contentType: string;
  blob?: Blob;
  bare?: boolean;
  onTableRowClick?: ClickyTableRowClick;
  getTableRowHref?: ClickyTableRowHref;
  isTableRowClickable?: ClickyTableRowPredicate;
}) {
  const ct = (contentType.split(";")[0] ?? "").trim();

  if (ct === "application/pdf" && blob) {
    return <PdfOutput blob={blob} />;
  }

  if (ct === "application/clicky+json" || ct === "application/json+clicky") {
    const clicky = (
      <Clicky
        data={(parsed as Parameters<typeof Clicky>[0]["data"]) ?? text}
        {...(onTableRowClick ? { onTableRowClick } : {})}
        {...(getTableRowHref ? { getTableRowHref } : {})}
        {...(isTableRowClickable ? { isTableRowClickable } : {})}
      />
    );

    const detailOutput = <div className="detail-output">{clicky}</div>;
    if (bare) return detailOutput;

    return (
      <Tabs
        defaultValue="rendered"
        tabs={[
          { value: "rendered", label: "Rendered", content: detailOutput },
          { value: "raw", label: "Raw", content: <TextOutput text={text} /> },
        ]}
      />
    );
  }

  if (ct === "text/html") {
    const iframe = (
      <iframe
        srcDoc={text}
        className="h-[600px] w-full rounded-md border bg-white"
        sandbox="allow-same-origin"
      />
    );
    if (bare) return iframe;
    return (
      <Tabs
        defaultValue="preview"
        tabs={[
          { value: "preview", label: "Preview", content: iframe },
          { value: "source", label: "Source", content: <TextOutput text={text} /> },
        ]}
      />
    );
  }

  if (parsed) {
    const json = <JsonViewer data={parsed} />;
    if (bare) return json;
    return (
      <Tabs
        defaultValue="output"
        tabs={[
          { value: "output", label: "Output", content: json },
          { value: "raw", label: "Raw", content: <TextOutput text={text} /> },
        ]}
      />
    );
  }

  if (text) return <TextOutput text={text} />;

  return <p className="py-4 text-sm text-muted-foreground">No output</p>;
}

function PdfOutput({ blob }: { blob: Blob }) {
  const [url, setURL] = useState("");

  useEffect(() => {
    const next = URL.createObjectURL(blob);
    setURL(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);

  if (!url) return null;
  return (
    <div className="space-y-2">
      <a
        href={url}
        download="output.pdf"
        className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
      >
        Download PDF
      </a>
      <iframe src={url} className="h-[600px] w-full rounded-md border" />
    </div>
  );
}

function JsonViewer({ data }: { data: unknown }) {
  return (
    <div className="overflow-auto rounded-md bg-muted p-4 font-mono text-xs">
      <JsonView data={data as object | unknown[]} defaultOpenDepth={Number.MAX_SAFE_INTEGER} />
    </div>
  );
}

function TextOutput({
  text,
  variant = "default",
}: {
  text: string;
  variant?: "default" | "error";
}) {
  return (
    <pre
      className={`max-h-96 overflow-auto whitespace-pre-wrap rounded-md p-4 font-mono text-sm ${
        variant === "error"
          ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
          : "bg-muted"
      }`}
    >
      {text}
    </pre>
  );
}

function Tabs({
  defaultValue,
  tabs,
}: {
  defaultValue: string;
  tabs: Array<{ value: string; label: string; content: ReactNode }>;
}) {
  const [value, setValue] = useState(defaultValue);
  const active = tabs.find((tab) => tab.value === value) ?? tabs[0];
  if (!active) return null;
  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-md border bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`rounded px-2 py-1 text-xs ${
              tab.value === active.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
            onClick={() => setValue(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{active.content}</div>
    </div>
  );
}
