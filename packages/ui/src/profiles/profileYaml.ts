import { parse } from "yaml";
import type { ProfileWizardDraft } from "./profileWizardModel";

export function parseProfileYamlDocument(value: string): ProfileWizardDraft {
  const parsed = parse(value);
  if (!isRecord(parsed)) throw new Error("Profile YAML must contain an object");
  return parsed as ProfileWizardDraft;
}

export function profileYamlFilename(name?: string): string {
  const safeName = name?.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${safeName || "profile"}.yaml`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
