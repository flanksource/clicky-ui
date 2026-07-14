import type { ClickyRow } from "../data/Clicky";
import type { ChatContextItem } from "../data/ai/context";
import type { ClickySurface } from "./types";
import { clickyNodeText, getClickyRowId } from "./rowNavigation";

const LABEL_KEYS = [
  "name",
  "title",
  "ref",
  "rule",
  "type",
  "reference",
] as const;

export function entityContextItemID(surfaceKey: string, recordID: string) {
  return `entity:${surfaceKey}:${recordID}`;
}

export function clickyRowRecord(row: ClickyRow): Record<string, string> {
  return Object.fromEntries(
    Object.entries(row.cells)
      .map(([key, value]) => [key, clickyNodeText(value).trim()] as const)
      .filter(([, value]) => value !== ""),
  );
}

export function contextItemFromEntityRow(
  surface: ClickySurface,
  row: ClickyRow,
  record: unknown,
): ChatContextItem | undefined {
  const recordID = getClickyRowId(row);
  if (!recordID) return undefined;

  const rowRecord = clickyRowRecord(row);
  const entries = Object.entries(rowRecord);
  const byLowerKey = new Map(
    entries.map(([key, value]) => [key.toLowerCase(), { key, value }]),
  );
  const labelEntry = LABEL_KEYS.map((key) => byLowerKey.get(key)).find(
    (entry) => entry?.value,
  );
  const label = labelEntry?.value ?? recordID;
  const excluded = new Set([
    "_id",
    "id",
    "guid",
    labelEntry?.key.toLowerCase() ?? "",
  ]);
  const fields = Object.fromEntries(
    entries
      .filter(
        ([key, value]) => value !== "" && !excluded.has(key.toLowerCase()),
      )
      .slice(0, 3),
  );

  return {
    id: entityContextItemID(surface.key, recordID),
    type: surface.key,
    label,
    ...(Object.keys(fields).length ? { fields } : {}),
    payload: {
      surfaceKey: surface.key,
      surfaceTitle: surface.title,
      entity: surface.entity,
      id: recordID,
      record,
    },
  };
}
