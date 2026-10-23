// MDX carries frontmatter and ESM `import`/`export` statements that a markdown
// renderer would print as prose. Rendering them away must not shift the
// document, or the line numbers findings are anchored to stop matching.

const FENCE = /^\s{0,3}(`{3,}|~{3,})/;
const ESM_STATEMENT = /^(import|export)\s/;

function bracketBalance(line: string): number {
  let balance = 0;
  for (const char of line) {
    if ("{[(".includes(char)) balance += 1;
    else if ("}])".includes(char)) balance -= 1;
  }
  return balance;
}

/**
 * `source` with the frontmatter block and every top-level `import`/`export`
 * statement (including ones that span lines) replaced by empty lines. The
 * result has exactly as many lines as the input. Fenced code is left alone.
 */
export function blankMdxPreamble(source: string): string {
  const lines = source.split("\n");
  const blanked = lines.slice();

  let index = 0;
  if (lines[0] === "---") {
    const close = lines.indexOf("---", 1);
    if (close !== -1) {
      for (; index <= close; index += 1) blanked[index] = "";
    }
  }

  let fence: string | null = null;
  for (; index < lines.length; index += 1) {
    const line = lines[index]!;
    const fenceMatch = FENCE.exec(line);
    if (fence) {
      if (fenceMatch && fenceMatch[1]![0] === fence[0] && fenceMatch[1]!.length >= fence.length) fence = null;
      continue;
    }
    if (fenceMatch) {
      fence = fenceMatch[1]!;
      continue;
    }
    if (!ESM_STATEMENT.test(line)) continue;

    let balance = bracketBalance(line);
    blanked[index] = "";
    while (balance > 0 && index + 1 < lines.length) {
      index += 1;
      balance += bracketBalance(lines[index]!);
      blanked[index] = "";
    }
  }
  return blanked.join("\n");
}
