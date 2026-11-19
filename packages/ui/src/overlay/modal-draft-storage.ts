import { isPlainObject } from "../lib/collections";
import type { ModalDraft, ModalFormDefinition } from "./modal-context";

const version = 1;

export type StoredModalDraft = {
  version: typeof version;
  formKey: string;
  draft: unknown;
  status: "pending" | "rejected";
};

export function modalDraftPrefix(scope: string): string {
  return `clicky.modal.${encodeURIComponent(scope)}:`;
}

export function saveModalDraft(
  key: string,
  record: Omit<StoredModalDraft, "version">,
) {
  window.sessionStorage.setItem(key, JSON.stringify({ ...record, version }));
}

export function listModalDraftKeys(prefix: string): string[] {
  const storage = window.sessionStorage;
  return Array.from({ length: storage.length }, (_, index) =>
    storage.key(index),
  ).filter((key): key is string => key !== null && key.startsWith(prefix));
}

export function readModalDraft(
  key: string,
  forms: Readonly<Record<string, ModalFormDefinition>>,
): {
  form: ModalFormDefinition;
  record: StoredModalDraft;
  draft: ModalDraft;
} {
  const record = getModalDraft(key);
  const form = Object.hasOwn(forms, record.formKey)
    ? forms[record.formKey]
    : undefined;
  if (!form?.recovery) throw new Error("The saved form is unavailable");
  return { form, record, draft: form.recovery.restore(record.draft) };
}

export function recordModalRejection(key: string) {
  saveModalDraft(key, { ...getModalDraft(key), status: "rejected" });
}

function getModalDraft(key: string): StoredModalDraft {
  const saved = window.sessionStorage.getItem(key);
  if (saved === null) throw new Error("Saved draft is missing");
  const record: unknown = JSON.parse(saved);
  if (
    !isPlainObject(record) ||
    record.version !== version ||
    typeof record.formKey !== "string" ||
    !isPlainObject(record.draft) ||
    (record.status !== "pending" && record.status !== "rejected")
  )
    throw new Error("Invalid saved draft");

  return {
    version,
    formKey: record.formKey,
    draft: record.draft,
    status: record.status,
  };
}
