export function shortContextModelName(model: string): string {
  let label = model.trim();
  if (!label) return "default";
  const slash = label.lastIndexOf("/");
  if (slash >= 0) label = label.slice(slash + 1);
  for (const prefix of ["claude-agent-", "claude-code-", "claude-", "codex-"]) {
    if (label.startsWith(prefix)) {
      label = label.slice(prefix.length);
      break;
    }
  }

  // A human-written name ("Claude Opus 4.8 fast") is read word by word: a
  // single regex over the whole label backtracks polynomially on runs of spaces.
  const words = label.toLowerCase().trim().split(/\s+/);
  let word = words[0] === "claude" ? 1 : 0;
  const humanTier = words[word];
  if (humanTier && ["fable", "opus", "sonnet", "haiku"].includes(humanTier)) {
    word += 1;
    const version = /^\d+(?:\.\d+)*$/.test(words[word] ?? "") ? words[word++] : undefined;
    const name = humanTier.charAt(0).toUpperCase() + humanTier.slice(1);
    const head = version ? `${name} ${version}` : name;
    const tail = words.slice(word).join("-");
    return tail ? `${head} ${tail}` : head;
  }
  if (label.toLowerCase().startsWith("gpt-")) return label.replace(/^gpt/i, "GPT");

  const parts = label.toLowerCase().split("-").filter(Boolean);
  const tier = parts[0];
  if (tier && ["fable", "opus", "sonnet", "haiku"].includes(tier)) {
    const version: string[] = [];
    let index = 1;
    while (index < parts.length && /^\d{1,2}(?:\.\d+)*$/.test(parts[index]!)) {
      version.push(parts[index]!);
      index += 1;
    }
    const name = tier.charAt(0).toUpperCase() + tier.slice(1);
    const head = version.length ? `${name} ${version.join(".")}` : name;
    const rest = parts.slice(index).filter(part => !/^\d{8}$/.test(part)).join("-");
    return rest ? `${head} ${rest}` : head;
  }
  return label;
}

/** Infer only recognized provider/model aliases; leave custom agent names alone. */
export function modelProvider(model: string): string | undefined {
  const value = model.toLowerCase().trim();
  const prefix = value.split("/")[0];
  if (prefix && ["anthropic", "openai", "google", "googleai", "gemini", "mistral", "deepseek", "ollama", "meta"].includes(prefix)) return prefix;
  if (/^(?:claude|opus|sonnet|haiku|fable)(?:[-\s]|$)/.test(value)) return "anthropic";
  if (/^(?:codex|gpt|openai)(?:[-\s]|$)/.test(value)) return "openai";
  if (/^gemini(?:[-\s]|$)/.test(value)) return "gemini";
  return undefined;
}
