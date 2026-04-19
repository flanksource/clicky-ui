import { useState } from "react";

export type JsonViewProps = {
  data: unknown;
  name?: string;
  depth?: number;
  defaultOpenDepth?: number;
};

export function JsonView({ data, name, depth = 0, defaultOpenDepth = 2 }: JsonViewProps) {
  const [open, setOpen] = useState(depth < defaultOpenDepth);

  if (data === null || data === undefined) {
    return <span className="text-muted-foreground italic">null</span>;
  }

  if (typeof data === "string") {
    return <span className="text-green-700 dark:text-green-400">"{data}"</span>;
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return <span className="text-blue-700 dark:text-blue-400">{String(data)}</span>;
  }

  if (typeof data !== "object") {
    return <span className="text-muted-foreground">{String(data)}</span>;
  }

  const isArray = Array.isArray(data);
  const entries: Array<[string | number, unknown]> = isArray
    ? (data as unknown[]).map((v, i) => [i, v])
    : Object.entries(data as Record<string, unknown>);
  const [openB, closeB] = isArray ? ["[", "]"] : ["{", "}"];

  if (entries.length === 0) {
    return (
      <span className="text-muted-foreground">
        {openB}
        {closeB}
      </span>
    );
  }

  return (
    <div className="text-sm font-mono" style={{ paddingLeft: depth > 0 ? "12px" : "0" }}>
      <span
        className="cursor-pointer hover:bg-accent rounded px-0.5 select-none"
        onClick={() => setOpen(!open)}
      >
        <span className="text-muted-foreground text-xs mr-1">{open ? "▼" : "▶"}</span>
        {name && <span className="text-purple-600 dark:text-purple-400">{name}</span>}
        {name && <span className="text-muted-foreground">: </span>}
        {!open && (
          <span className="text-muted-foreground">
            {openB} {entries.length} {isArray ? "items" : "keys"} {closeB}
          </span>
        )}
        {open && <span className="text-muted-foreground">{openB}</span>}
      </span>
      {open && (
        <>
          {entries.map(([key, val]) => (
            <div key={key} className="pl-3 border-l border-border ml-1">
              {typeof val === "object" && val !== null ? (
                <JsonView
                  data={val}
                  name={String(key)}
                  depth={depth + 1}
                  defaultOpenDepth={defaultOpenDepth}
                />
              ) : (
                <div>
                  <span className="text-purple-600 dark:text-purple-400">
                    {isArray ? "" : String(key)}
                  </span>
                  {!isArray && <span className="text-muted-foreground">: </span>}
                  <JsonView data={val} depth={depth + 1} defaultOpenDepth={defaultOpenDepth} />
                </div>
              )}
            </div>
          ))}
          <span className="text-muted-foreground">{closeB}</span>
        </>
      )}
    </div>
  );
}
