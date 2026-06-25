import { getSessionAction, type SessionEvent } from "./SessionViewer.model";

// ── Captain category taxonomy ───────────────────────────────────────────────
// A faithful TypeScript port of captain's `pkg/bash` category classifier
// (`category.go` + `category_config.yaml`) so the SessionViewer's filter mirrors
// what `captain history --category` / `--tool` expose. A tool maps to a category
// either directly (Read → explore, Edit → edit, …) or, for Bash, by classifying
// the command string.

export type SessionCategory =
  | "build"
  | "test"
  | "install"
  | "explore"
  | "lint"
  | "cleanup"
  | "git"
  | "docker"
  | "k8s"
  | "run"
  | "plan"
  | "edit"
  | "clarify"
  | "read"
  | "other";

export const CATEGORY_LABELS: Record<SessionCategory, string> = {
  build: "Build",
  test: "Test",
  install: "Install",
  explore: "Explore",
  lint: "Lint",
  cleanup: "Cleanup",
  git: "Git",
  docker: "Docker",
  k8s: "Kubernetes",
  run: "Run",
  plan: "Plan",
  edit: "Edit",
  clarify: "Clarify",
  read: "Read",
  other: "Other",
};

const CATEGORY_PRIORITY: Record<SessionCategory, number> = {
  install: 100,
  edit: 90,
  run: 80,
  test: 70,
  build: 60,
  cleanup: 50,
  docker: 40,
  k8s: 40,
  git: 30,
  explore: 20,
  lint: 20,
  plan: 20,
  read: 15,
  clarify: 10,
  other: 0,
};

interface CategoryRule {
  tools?: string[];
  commands?: string[];
  patterns?: string[];
}

// Mirrors pkg/bash/category_config.yaml. Order is irrelevant — ties resolve by
// match specificity, then priority, then category name (see chooseBetterMatch).
const CATEGORY_CONFIG: Array<[SessionCategory, CategoryRule]> = [
  [
    "build",
    {
      commands: ["go build", "make build", "make all", "cargo build", "npm run build", "yarn build", "task build", "gradle build", "mvn compile", "mvn package", "dotnet build", "pnpm build", "bun build", "mage", "bazel build", "nx build", "turbo build", "javac"],
      patterns: [".*gradle.*(build|compile|bootJar|jar).*", ".*mvn.*(compile|package)", "^go build", "^make\\s*$", "^make\\s+(build|all)\\b", "^cargo build", "^task build"],
    },
  ],
  [
    "test",
    {
      commands: ["go test", "pytest", "npm test", "yarn test", "task test", "make test", "cargo test", "mvn test", "gradle test", "vitest", "jest", "bun test", "dotnet test", "ginkgo", "gotestsum", "zig test"],
      patterns: [".*gradle.*test", ".*mvn.*test", "^go test", "^pytest", "^npm (run )?test", "^make\\s+test", "^vitest", "^jest", "^bun test", "^ginkgo", "^gotestsum"],
    },
  ],
  [
    "install",
    {
      commands: ["npm install", "npm i", "yarn install", "yarn add", "go mod tidy", "go mod download", "go get", "pip install", "pip3 install", "cargo add", "brew install", "apt install", "apt-get install", "pnpm install", "pnpm add", "bun install", "bun add", "poetry install", "poetry add", "uv pip install", "pdm install", "pdm add"],
      patterns: ["^npm (install|i)\\b", "^yarn (install|add)\\b", "^pip3? install", "^go (mod tidy|mod download|get)", "^pnpm (install|add)\\b", "^bun (install|add)\\b", "^poetry (install|add)\\b", "^uv pip install", "^pdm (install|add)\\b"],
    },
  ],
  [
    "explore",
    {
      tools: ["Read", "Grep", "Glob", "LSP", "WebFetch", "WebSearch"],
      commands: ["ls", "md5", "echo", "find", "grep", "rg", "ag", "cat", "head", "tail", "less", "more", "tree", "wc", "file", "stat", "du", "df", "pwd", "which", "whereis", "type", "fd", "bat", "exa", "eza", "fzf", "jq", "yq", "ripgrep", "sd", "diff", "go list", "git status", "git diff", "git log", "ps", "printenv", "sed"],
      patterns: ["^ls\\b", "^find\\b", "^grep\\b", "^rg\\b", "^cat\\b", "^head\\b", "^tail\\b", "^tree\\b", "^fd\\b", "^bat\\b", "^exa\\b", "^eza\\b", "^jq\\b", "^yq\\b", "^diff\\b", "^go list\\b", "^git\\s+(status|diff|log)\\b"],
    },
  ],
  [
    "lint",
    {
      commands: ["golangci-lint", "eslint", "gofmt", "go fmt", "prettier", "black", "flake8", "pylint", "rubocop", "shellcheck", "task fmt", "make fmt", "make lint", "biome", "ruff", "mypy", "staticcheck", "buf lint", "deno lint", "oxlint"],
      patterns: ["lint", "^go fmt", "^gofmt", "^prettier", "^black\\b", "^biome\\b", "^ruff\\b", "^mypy\\b", "^staticcheck\\b"],
    },
  ],
  [
    "cleanup",
    {
      commands: ["rm", "rmdir", "git clean", "make clean", "cargo clean", "go clean", "npm cache clean", "docker prune", "docker system prune"],
      patterns: ["^rm\\b", "^rmdir\\b", "clean\\b", "prune\\b"],
    },
  ],
  [
    "git",
    {
      commands: ["git show", "git branch", "git checkout", "git switch", "git commit", "git push", "git pull", "git fetch", "git merge", "git rebase", "git stash", "git add", "git reset", "git clone", "git remote", "git tag"],
      patterns: ["^git\\b"],
    },
  ],
  [
    "docker",
    {
      commands: ["docker run", "docker build", "docker push", "docker pull", "docker ps", "docker images", "docker logs", "docker exec", "docker stop", "docker start", "docker rm", "docker rmi", "docker-compose", "podman"],
      patterns: ["^docker\\b", "^docker-compose\\b", "^podman\\b"],
    },
  ],
  [
    "k8s",
    {
      commands: ["kubectl", "helm", "k9s", "kubectx", "kubens", "kustomize", "minikube", "kind"],
      patterns: ["^kubectl\\b", "^helm\\b", "^k9s\\b", "^kubectx\\b", "^kubens\\b", "^kustomize\\b", "^minikube\\b", "^kind\\b"],
    },
  ],
  [
    "run",
    {
      tools: ["KillShell"],
      commands: ["go run", "python", "python3", "node", "bun run", "deno run", "ruby", "perl", "php", "java"],
      patterns: [".*gradle.*run.*", "^go run\\b", "^python3?\\b", "^node\\b", "^bun run\\b", "^deno run\\b", "^ruby\\b", "^perl\\b", "^php\\b", "^java\\s+-jar\\b", "^\\./[\\w.-]+\\.(sh|bash|py|rb|pl)$", "^bash\\s+\\S+\\.sh"],
    },
  ],
  [
    "plan",
    {
      tools: ["Task", "TodoWrite", "EnterPlanMode"],
      commands: ["task", "make help", "task explore", "task plan", "task todos", "task todo"],
      patterns: ["^task\\s*$", "^task\\s+--list", "^make\\s+help"],
    },
  ],
  [
    "edit",
    {
      tools: ["Edit", "Write", "NotebookEdit"],
      commands: ["mkdir"],
      patterns: ["sed.* -i"],
    },
  ],
  ["clarify", { tools: ["AskUserQuestion", "ExitPlanMode", "TaskOutput"] }],
];

const COMPILED: Array<[SessionCategory, RegExp[]]> = CATEGORY_CONFIG.map(([cat, rule]) => [
  cat,
  (rule.patterns ?? []).map((p) => new RegExp(p)),
]);

interface CategoryMatch {
  category: SessionCategory;
  specificity: number;
  matched: boolean;
}

// Port of betterCategoryMatch: prefer higher match specificity, then higher
// category priority, then the lexicographically smaller name.
function chooseBetterMatch(current: CategoryMatch, candidate: CategoryMatch): CategoryMatch {
  if (!candidate.matched || candidate.category === "other") return current;
  if (!current.matched || current.category === "other") return candidate;
  if (candidate.specificity > current.specificity) return candidate;
  if (candidate.specificity < current.specificity) return current;
  const cp = CATEGORY_PRIORITY[candidate.category];
  const kp = CATEGORY_PRIORITY[current.category];
  if (cp > kp) return candidate;
  if (cp < kp) return current;
  return candidate.category < current.category ? candidate : current;
}

/** Classify a raw shell command, mirroring captain's `Classify`. */
export function classifyCommand(command: string): SessionCategory {
  const cmd = command.trim();
  if (!cmd) return "other";
  let best: CategoryMatch = { category: "other", specificity: 0, matched: false };
  for (const [cat, rule] of CATEGORY_CONFIG) {
    for (const prefix of rule.commands ?? []) {
      if (cmd === prefix || cmd.startsWith(`${prefix} `)) {
        best = chooseBetterMatch(best, { category: cat, specificity: prefix.length, matched: true });
      }
    }
  }
  for (const [cat, regexps] of COMPILED) {
    for (const re of regexps) {
      if (re.test(cmd)) {
        best = chooseBetterMatch(best, { category: cat, specificity: re.source.length, matched: true });
      }
    }
  }
  return best.category;
}

function classifyTool(tool: string): SessionCategory {
  for (const [cat, rule] of CATEGORY_CONFIG) {
    if (rule.tools?.includes(tool)) return cat;
  }
  return "other";
}

function inputString(input: Record<string, unknown> | undefined, key: string): string {
  return typeof input?.[key] === "string" ? (input[key] as string) : "";
}

/** Category for a tool invocation, mirroring captain's classifyToolUse: a
 *  `.claude/plans/` path is plan; a Bash command falls through to command
 *  classification when the tool itself is uncategorized. */
export function classifyToolCategory(tool: string, input?: Record<string, unknown>): SessionCategory {
  const filePath =
    inputString(input, "file_path") || inputString(input, "notebook_path") || inputString(input, "path");
  if (filePath.includes("/.claude/plans/")) return "plan";
  const cat = classifyTool(tool);
  if (cat === "other" && tool === "Bash") return classifyCommand(inputString(input, "command"));
  return cat;
}

/** The category of a normalized event, or null for non-tool events. */
export function eventCategory(event: SessionEvent): SessionCategory | null {
  if (event.kind !== "tool") return null;
  return classifyToolCategory(event.tool ?? "", event.toolInput);
}

export interface SessionFilters {
  /** Distinct categories present, ordered by descending impact priority. */
  categories: SessionCategory[];
  /** Distinct tools present, with display labels, ordered by label. */
  tools: Array<{ key: string; label: string }>;
  /** Distinct sources present (e.g. "claude", "codex"). */
  sources: string[];
}

export interface SessionVisibility {
  hiddenCategories: ReadonlySet<SessionCategory>;
  hiddenTools: ReadonlySet<string>;
  hiddenSources: ReadonlySet<string>;
  /** When false, reasoning ("thinking") events are hidden. */
  showThinking: boolean;
}

/** Whether an event survives the active filters. Tool events are gated by their
 *  tool, category and source; reasoning by `showThinking`; everything else
 *  (user/assistant/error) is always shown. */
export function isEventVisible(event: SessionEvent, v: SessionVisibility): boolean {
  if (event.kind === "thinking") return v.showThinking;
  if (event.kind !== "tool") return true;
  const tool = event.tool ?? "";
  if (v.hiddenTools.has(tool)) return false;
  if (v.hiddenCategories.has(classifyToolCategory(tool, event.toolInput))) return false;
  if (event.source && v.hiddenSources.has(event.source)) return false;
  return true;
}

/** Collect the filter facets (category / tool / source) present in a session. */
export function collectSessionFilters(events: SessionEvent[]): SessionFilters {
  const categories = new Set<SessionCategory>();
  const tools = new Map<string, string>();
  const sources = new Set<string>();
  for (const event of events) {
    if (event.kind !== "tool") continue;
    const tool = event.tool ?? "";
    categories.add(classifyToolCategory(tool, event.toolInput));
    if (!tools.has(tool)) tools.set(tool, getSessionAction(tool).label);
    if (event.source) sources.add(event.source);
  }
  return {
    categories: [...categories].sort(
      (a, b) => CATEGORY_PRIORITY[b] - CATEGORY_PRIORITY[a] || a.localeCompare(b),
    ),
    tools: [...tools].map(([key, label]) => ({ key, label })).sort((a, b) => a.label.localeCompare(b.label)),
    sources: [...sources].sort(),
  };
}
