type Version = { parts: number[]; pre: string[] };

function version(text: string): Version {
  const match = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\w.-]+))?(?:\+[\w.-]+)?$/.exec(text);
  if (!match) throw new Error(`invalid semantic version ${text}`);
  return { parts: [Number(match[1]), Number(match[2]), Number(match[3])], pre: match[4]?.split(".") ?? [] };
}

function compare(a: Version, b: Version): number {
  for (let i = 0; i < 3; i++) if (a.parts[i] !== b.parts[i]) return a.parts[i]! - b.parts[i]!;
  if (!a.pre.length || !b.pre.length) return Number(!a.pre.length) - Number(!b.pre.length);
  for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i++) {
    const x = a.pre[i]; const y = b.pre[i];
    if (x === y) continue;
    if (x === undefined || y === undefined) return x === undefined ? -1 : 1;
    if (/^\d+$/.test(x) && /^\d+$/.test(y)) return Number(x) - Number(y);
    if (/^\d+$/.test(x) !== /^\d+$/.test(y)) return /^\d+$/.test(x) ? -1 : 1;
    return x < y ? -1 : 1;
  }
  return 0;
}

export function compareVersions(a: string, b: string): number { return compare(version(a), version(b)); }

function partial(text: string): { v: Version; count: number } {
  const match = /^v?(\d+|[xX*])(?:\.(\d+|[xX*]))?(?:\.(\d+|[xX*]))?(-[\w.-]+)?(?:\+[\w.-]+)?$/.exec(text);
  if (!match) throw new Error(`invalid semantic range ${text}`);
  const parts = match.slice(1, 4);
  let count = parts.findIndex((p) => p === undefined || /[xX*]/.test(p));
  if (count === -1) count = 3;
  if (parts.slice(count).some((p) => p !== undefined && !/[xX*]/.test(p))) throw new Error(`invalid semantic range ${text}`);
  return { v: version(`${parts.map((p, i) => i < count ? p : "0").join(".")}${match[4] ?? ""}`), count };
}

function upper(v: Version, index: number): Version {
  return { parts: v.parts.map((n, i) => i < index ? n : i === index ? n + 1 : 0), pre: ["0"] };
}

function comparator(actual: Version, token: string): boolean {
  const match = /^(\^|~|>=|<=|>|<|=)?(.+)$/.exec(token);
  if (!match?.[2]) throw new Error(`invalid semantic range ${token}`);
  const op = match[1] ?? "=";
  const { v, count } = partial(match[2]);
  if (!count) return op !== ">" && op !== "<";
  const c = compare(actual, v);
  if (op === "^") {
    const first = v.parts.findIndex((n, i) => n > 0 || i === count - 1);
    return c >= 0 && compare(actual, upper(v, first)) < 0;
  }
  if (op === "~") return c >= 0 && compare(actual, upper(v, Math.min(count - 1, 1))) < 0;
  if (op === "=") return count === 3 ? c === 0 : c >= 0 && compare(actual, upper(v, count - 1)) < 0;
  if (op === ">=") return c >= 0;
  if (op === "<") return c < 0;
  if (op === ">") return count === 3 ? c > 0 : compare(actual, upper(v, count - 1)) >= 0;
  return count === 3 ? c <= 0 : compare(actual, upper(v, count - 1)) < 0;
}

function rangeTokens(branch: string): string[] {
  const normalized = branch.trim().replace(/(\S+)\s+-\s+(\S+)/g, (_, lo: string, hi: string) => {
      const end = partial(hi);
      const bound = end.count === 3 ? `<=${hi}` : `<${upper(end.v, end.count - 1).parts.join(".")}-0`;
      return `>=${partial(lo).v.parts.join(".")} ${bound}`;
    }).replace(/(\^|~|>=|<=|>|<|=)\s+/g, "$1");
  return normalized ? normalized.split(/\s+/) : ["*"];
}

export function validateVersionRange(range: string): void {
  if (!range.trim()) throw new Error("empty semantic version range");
  for (const branch of range.split("||")) for (const token of rangeTokens(branch)) comparator(version("0.0.0"), token);
}

export function satisfiesVersion(text: string, range: string): boolean {
  const actual = version(text);
  return range.split("||").some((branch) => {
    const tokens = rangeTokens(branch);
    if (actual.pre.length && !tokens.some((token) => {
      const target = partial(token.replace(/^(\^|~|>=|<=|>|<|=)/, "")).v;
      return target.pre.length && target.parts.every((n, i) => n === actual.parts[i]);
    })) return false;
    return tokens.every((token) => comparator(actual, token));
  });
}

export function chooseVersion(options: { name: string; range: string; times: Record<string, string>; ageDays: number; now: number }): string {
  const eligible = Object.entries(options.times).filter(([v, date]) => /^v?\d+\.\d+\.\d+/.test(v) && satisfiesVersion(v, options.range) && Date.parse(date) <= options.now - options.ageDays * 86_400_000);
  eligible.sort(([a], [b]) => compareVersions(b, a));
  if (!eligible[0]) throw new Error(`${options.name}: no version matches ${options.range} with minimum release age ${options.ageDays} days`);
  return eligible[0][0];
}
