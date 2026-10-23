// Pure text builder shared by the browser (which imports the skill with `?raw`)
// and the Vite plugins (which read the skill file), so both hand an agent the
// same instructions.
export function buildPlaygroundInstructions({
  url,
  install,
  skill,
}: {
  url: string;
  install: boolean;
  skill: string;
}): string {
  const context = [
    `Playground page: ${url}`,
    `Feedback API schema: ${new URL("/__playground/comments/schema", url).href}`,
  ].join("\n");

  return install
    ? [
        "Install the clicky-ui-playground skill for this workspace.",
        "Save the exact Markdown inside <skill> below as .agents/skills/clicky-ui-playground/SKILL.md at the workspace root, or in this agent's supported skills directory. If the skill already exists, inspect it before updating it and preserve unrelated customizations.",
        "This request is only to install the skill; do not start changing pages or feedback. Report the installed path.",
        context,
        "<skill>",
        skill.trim(),
        "</skill>",
      ].join("\n\n")
    : [
        "Use these instructions when working on the requested playground task. Follow the user's task scope; this handoff alone does not request any page or feedback changes.",
        context,
        skill.trim(),
      ].join("\n\n");
}
