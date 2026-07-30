import { Clicky, CodeBlock, CodeDiff, type ClickyDocument, type ClickyNode } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

// A before/after pair used to demonstrate the language-aware diff viewer under
// the React kitchen-sink runtime — the same computed-diff path Storybook shows.
const DIFF_BEFORE = `export function greet(name: string): string {
  return "Hello, " + name;
}`;

const DIFF_AFTER = `export function greet(name: string, excited = false): string {
  const suffix = excited ? "!" : ".";
  return \`Hello, \${name}\${suffix}\`;
}`;

// Each entry mirrors what `clicky.CodeBlock(language, source)` produces on the
// Go side: a node with kind="code", a `language` hint, and a `source` payload
// (raw text). The Clicky renderer wires the language into its syntax-
// highlighting layer, falling back to escaped plain text when the grammar is
// unknown.
type Sample = { id: string; title: string; description: string; language: string; source: string };

const samples: Sample[] = [
  {
    id: "java",
    title: "Java",
    description: "Classic Hello, World in Java.",
    language: "java",
    source: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}`,
  },
  {
    id: "sql",
    title: "SQL",
    description: "A tiny greetings table query.",
    language: "sql",
    source: `SELECT id, name, greeting
  FROM greetings
 WHERE name = 'world'
 ORDER BY id
 LIMIT 1;`,
  },
  {
    id: "json",
    title: "JSON",
    description: "A minimal Hello, World payload.",
    language: "json",
    source: `{
  "message": "Hello, world!",
  "lang": "en",
  "count": 1
}`,
  },
  {
    id: "go",
    title: "Go",
    description: "Hello, World in Go.",
    language: "go",
    source: `package main

import "fmt"

func main() {
    fmt.Println("Hello, world!")
}`,
  },
  {
    id: "ts",
    title: "TypeScript",
    description: "Hello, World as a typed function.",
    language: "typescript",
    source: `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("world"));`,
  },
  {
    id: "shell",
    title: "Shell",
    description: "Hello, World from bash.",
    language: "bash",
    source: `#!/usr/bin/env bash
# Print a friendly greeting.
name="\${1:-world}"
echo "Hello, $name!"`,
  },
  {
    id: "yaml",
    title: "YAML",
    description: "Hello, World as a YAML document.",
    language: "yaml",
    source: `greeting:
  message: Hello, world!
  language: en
  audience:
    - developers
    - operators`,
  },
  {
    id: "xml",
    title: "XML",
    description: "Hello, World as an XML document.",
    language: "xml",
    source: `<?xml version="1.0" encoding="UTF-8"?>
<greeting lang="en">
  <message>Hello, world!</message>
</greeting>`,
  },
  {
    id: "python",
    title: "Python",
    description: "Hello, World in Python.",
    language: "python",
    source: `def greet(name: str = "world") -> str:
    return f"Hello, {name}!"


if __name__ == "__main__":
    print(greet())`,
  },
];

function codeNode(language: string, source: string): ClickyNode {
  return { kind: "code", language, source };
}

function singleSampleDoc(sample: Sample): ClickyDocument {
  return { version: 1, node: codeNode(sample.language, sample.source) };
}

function combinedDoc(samples: Sample[]): ClickyDocument {
  // A plain `kind:"text"` parent with code children renders each block in
  // sequence — the easiest way to demo many languages in one <Clicky/>.
  return {
    version: 1,
    node: {
      kind: "text",
      children: samples.flatMap((s): ClickyNode[] => [
        { kind: "text", text: s.title, style: { className: "font-semibold text-sm mt-density-3" } },
        codeNode(s.language, s.source),
      ]),
    },
  };
}

export function CodeBlocksDemo() {
  return (
    <div className="space-y-density-4">
      <DemoSection
        id="codeblocks-overview"
        title="Native CodeBlock"
        description="Standalone code rendering with the same Shiki, Chroma, XML, and interactive JSON behavior used by Clicky code nodes."
      >
        <div className="space-y-density-3">
          {samples.slice(0, 4).map((sample) => (
            <div key={sample.id} className="space-y-2">
              <div className="text-sm font-semibold text-foreground">{sample.title}</div>
              <CodeBlock language={sample.language} source={sample.source} />
            </div>
          ))}
        </div>
      </DemoSection>

      <DemoSection
        id="codeblocks-clicky-compat"
        title="Clicky code nodes"
        description={
          'The Clicky AST renderer delegates kind="code" nodes to the same native CodeBlock component.'
        }
      >
        <Clicky data={combinedDoc(samples.slice(4, 7))} />
      </DemoSection>

      <DemoSection
        id="codeblocks-diff"
        title="Language-aware diff"
        description="CodeDiff computes an LCS line diff and syntax-highlights each side. Unified and split (side-by-side) layouts; add/remove tints follow the app theme."
      >
        <div className="space-y-density-3">
          <div className="text-sm font-semibold text-foreground">Unified</div>
          <CodeDiff language="typescript" original={DIFF_BEFORE} modified={DIFF_AFTER} />
          <div className="text-sm font-semibold text-foreground">Split</div>
          <CodeDiff language="typescript" view="split" original={DIFF_BEFORE} modified={DIFF_AFTER} />
        </div>
      </DemoSection>

      {samples.map((sample) => (
        <DemoSection
          key={sample.id}
          id={`codeblocks-${sample.id}`}
          title={sample.title}
          description={sample.description}
        >
          <Clicky data={singleSampleDoc(sample)} />
        </DemoSection>
      ))}
    </div>
  );
}
