import playgroundSkill from "../../../.agents/skills/clicky-ui-playground/SKILL.md?raw";
import { buildPlaygroundInstructions } from "./agent-instructions-text";

export function playgroundInstructions({
  url,
  install,
}: {
  url: string;
  install: boolean;
}): string {
  return buildPlaygroundInstructions({ url, install, skill: playgroundSkill });
}
