const ANSI_COLORS: Record<string, string> = {
  "30": "color:#1e1e1e",
  "31": "color:#cd3131",
  "32": "color:#0dbc79",
  "33": "color:#e5e510",
  "34": "color:#2472c8",
  "35": "color:#bc3fbc",
  "36": "color:#11a8cd",
  "37": "color:#e5e5e5",
  "90": "color:#666",
  "91": "color:#f14c4c",
  "92": "color:#23d18b",
  "93": "color:#f5f543",
  "94": "color:#3b8eea",
  "95": "color:#d670d6",
  "96": "color:#29b8db",
  "97": "color:#fff",
  "1": "font-weight:bold",
  "2": "opacity:0.7",
  "3": "font-style:italic",
  "4": "text-decoration:underline",
};

type Span = { text: string; style: string };

function parseAnsi(raw: string): Span[] {
  const spans: Span[] = [];
  // eslint-disable-next-line no-control-regex
  const re = /\x1b\[([0-9;]*)m/g;
  let last = 0;
  let styles: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = re.exec(raw)) !== null) {
    if (match.index > last) {
      spans.push({ text: raw.slice(last, match.index), style: styles.join(";") });
    }
    const codes = (match[1] ?? "").split(";").filter(Boolean);
    for (const code of codes) {
      if (code === "0" || code === "") {
        styles = [];
      } else {
        const rule = ANSI_COLORS[code];
        if (rule) styles.push(rule);
      }
    }
    last = match.index + match[0].length;
  }

  if (last < raw.length) {
    spans.push({ text: raw.slice(last), style: styles.join(";") });
  }

  return spans;
}

function spanToStyle(style: string): React.CSSProperties {
  const out: Record<string, string> = {};
  for (const rule of style.split(";")) {
    const [k, v] = rule.split(":");
    if (!k || !v) continue;
    const key = k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = v;
  }
  return out as React.CSSProperties;
}

export type AnsiHtmlProps = {
  text: string;
  className?: string;
  as?: "pre" | "span";
};

export function AnsiHtml({ text, className, as = "pre" }: AnsiHtmlProps) {
  const spans = parseAnsi(text);
  const children = spans.map((s, i) =>
    s.style ? (
      <span key={i} style={spanToStyle(s.style)}>
        {s.text}
      </span>
    ) : (
      <span key={i}>{s.text}</span>
    ),
  );
  if (as === "span") return <span className={className}>{children}</span>;
  return <pre className={className}>{children}</pre>;
}
