import type { ProfileColumn } from "../wizard/profileWizardModel";
import { profileSchema } from "../profileApi";

export function defaultSpanColumns(): ProfileColumn[] {
  const columns = profileSchema().properties?.spans?.["x-clicky-default-columns"];
  if (!Array.isArray(columns) || !columns.length) throw new Error("Profile schema is missing canonical span defaults");
  return structuredClone(columns) as ProfileColumn[];
}

export function obsoleteSpanColumns(configured: ProfileColumn[], available: ProfileColumn[]): string[] {
  return configured.filter((column) => !available.some((field) => field.name === (column.source || column.name) || (column.source !== undefined && field.source === column.source && field.jsonpath === column.jsonpath))).map((column) => column.name);
}
