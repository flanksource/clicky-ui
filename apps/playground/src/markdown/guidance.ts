import type { ExtractedGuidance, GuidanceBlock } from "../../plugins/markdown-model";

export type { ExtractedGuidance };

export function guidanceToMarkdown(title: string, guidance: ExtractedGuidance): string {
  const chunks = [`# ${title}`];
  if (guidance.blocks.length === 0) {
    chunks.push("No AST-extractable guidance was found for this page.");
  } else {
    chunks.push(...guidance.blocks.map(blockToMarkdown));
  }
  return `${chunks.join("\n\n")}\n`;
}

function blockToMarkdown(block: GuidanceBlock): string {
  switch (block.kind) {
    case "section":
      return [`## ${block.title}`, block.description].filter(Boolean).join("\n\n");
    case "practice":
    case "annotation":
      return `### ${toneLabel(block.tone)}: ${block.title}\n\n${block.body}`;
    case "variant":
      return `### ${block.title}${block.selected ? " (selected)" : ""}\n\n${block.verdict}`;
    case "callout":
      return `> **${capitalize(block.tone)}${block.title ? ` — ${block.title}` : ""}:** ${block.body}`;
    case "list":
      return `### ${block.title}\n\n${block.items.map((item) => `- ${item}`).join("\n")}`;
    case "table":
      return [
        `| ${block.headers.map(escapeCell).join(" | ")} |`,
        `| ${block.headers.map(() => "---").join(" | ")} |`,
        ...block.rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`),
      ].join("\n");
  }
}

function toneLabel(tone: "do" | "avoid" | "rule"): string {
  return tone === "avoid" ? "Don't" : capitalize(tone);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}
