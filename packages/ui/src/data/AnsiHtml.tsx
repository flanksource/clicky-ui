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

function indexedColor(index: number): string | undefined {
  if (!Number.isInteger(index) || index < 0 || index > 255) return undefined;
  if (index < 16)
    return ANSI_COLORS[String(index < 8 ? 30 + index : 90 + index - 8)]?.slice(
      6,
    );
  if (index >= 232) {
    const value = 8 + (index - 232) * 10;
    return `rgb(${value},${value},${value})`;
  }
  const offset = index - 16;
  const level = (value: number) => (value === 0 ? 0 : 55 + value * 40);
  return `rgb(${level(Math.floor(offset / 36))},${level(Math.floor(offset / 6) % 6)},${level(offset % 6)})`;
}

function applySgr(
  styles: Record<string, string>,
  codes: number[],
): Record<string, string> {
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    if (code === 0) {
      styles = {};
    } else if (code === 38 || code === 48) {
      const property = code === 38 ? "color" : "background-color";
      const mode = codes[++i];
      let color: string | undefined;
      if (mode === 2) {
        const rgb = codes.slice(i + 1, i + 4);
        i += 3;
        if (
          rgb.length === 3 &&
          rgb.every(
            (value) => Number.isInteger(value) && value >= 0 && value <= 255,
          )
        )
          color = `rgb(${rgb.join(",")})`;
      } else if (mode === 5) {
        const index = codes[++i];
        if (index !== undefined) color = indexedColor(index);
      }
      if (color !== undefined) styles[property] = color;
    } else if (code === 22) {
      delete styles["font-weight"];
      delete styles.opacity;
    } else if (code === 23) {
      delete styles["font-style"];
    } else if (code === 24) {
      delete styles["text-decoration"];
    } else if (code === 39) {
      delete styles.color;
    } else if (code === 49) {
      delete styles["background-color"];
    } else if (code !== undefined) {
      const background =
        (code >= 40 && code <= 47) || (code >= 100 && code <= 107);
      const rule = ANSI_COLORS[String(background ? code - 10 : code)];
      if (rule) {
        const [property, value] = rule.split(":");
        if (property && value)
          styles[background ? "background-color" : property] = value;
      }
    }
  }
  return styles;
}

function parseAnsi(raw: string): Span[] {
  const spans: Span[] = [];
  // eslint-disable-next-line no-control-regex
  const re = /\x1b\[([0-9;]*)m/g;
  let last = 0;
  let styles: Record<string, string> = {};
  const style = () =>
    Object.entries(styles)
      .map(([property, value]) => `${property}:${value}`)
      .join(";");
  let match: RegExpExecArray | null;

  while ((match = re.exec(raw)) !== null) {
    if (match.index > last) {
      spans.push({ text: raw.slice(last, match.index), style: style() });
    }
    styles = applySgr(styles, (match[1] ?? "").split(";").map(Number));
    last = match.index + match[0].length;
  }

  if (last < raw.length) {
    spans.push({ text: raw.slice(last), style: style() });
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
  /** Text containing ANSI SGR escape sequences. */
  text: string;
  /** Classes applied to the rendered element. */
  className?: string;
  /** Element to render: `pre` for blocks or `span` for inline log cells. */
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
