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

  const humanClaude = label
    .toLowerCase()
    .trim()
    .match(
      /^(?:claude\s+)?(fable|opus|sonnet|haiku)(?:\s+(\d+(?:\.\d+)*))?(?:\s+(.+))?$/,
    );
  if (humanClaude) {
    const tier = humanClaude[1]!;
    const version = humanClaude[2];
    const rest = humanClaude[3];
    const name = tier.charAt(0).toUpperCase() + tier.slice(1);
    const head = version ? `${name} ${version}` : name;
    const tail = (rest ?? "").trim().replace(/\s+/g, "-");
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
