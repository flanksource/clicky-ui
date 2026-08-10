import { useEffect, useMemo, useState } from "react";
import { Combobox, type ComboboxOption } from "./Combobox";
import {
  buildOnePasswordReference,
  parseOnePasswordReference,
  type OnePasswordField,
  type OnePasswordItem,
  type OnePasswordLoaders,
  type OnePasswordSelection,
  type OnePasswordVault,
} from "./OnePasswordSelector.model";

export type OnePasswordSelectorProps = OnePasswordLoaders & {
  value: string;
  onChange: (reference: string) => void;
  allowCustomValue?: boolean;
};

const EMPTY_SELECTION: OnePasswordSelection = { vault: "", item: "", field: "" };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function catalogID(
  entries: Array<OnePasswordVault | OnePasswordItem>,
  selection: string,
): string | undefined {
  return entries.find(
    (entry) => entry.id === selection || entry.name === selection,
  )?.id;
}

function catalogName(
  entries: Array<OnePasswordVault | OnePasswordItem>,
  selection: string,
): string {
  return (
    entries.find((entry) => entry.id === selection || entry.name === selection)
      ?.name ?? selection
  );
}

function options(
  entries: Array<OnePasswordVault | OnePasswordItem>,
): ComboboxOption[] {
  return entries.map((entry) => ({ value: entry.id, label: entry.name }));
}

export function OnePasswordSelector({
  value,
  onChange,
  loadVaults,
  loadItems,
  loadFields,
  allowCustomValue = true,
}: OnePasswordSelectorProps) {
  const [selection, setSelection] = useState<OnePasswordSelection>(
    () => parseOnePasswordReference(value) ?? EMPTY_SELECTION,
  );
  const [vaults, setVaults] = useState<OnePasswordVault[]>([]);
  const [items, setItems] = useState<OnePasswordItem[]>([]);
  const [fields, setFields] = useState<OnePasswordField[]>([]);
  const [loading, setLoading] = useState({
    vaults: true,
    items: false,
    fields: false,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setSelection(parseOnePasswordReference(value) ?? EMPTY_SELECTION);
  }, [value]);

  useEffect(() => {
    let active = true;
    setLoading((current) => ({ ...current, vaults: true }));
    loadVaults()
      .then((result) => {
        if (active) setVaults(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(errorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading((current) => ({ ...current, vaults: false }));
      });
    return () => {
      active = false;
    };
  }, [loadVaults]);

  const vaultID = useMemo(
    () => catalogID(vaults, selection.vault),
    [selection.vault, vaults],
  );

  useEffect(() => {
    if (!vaultID) {
      setItems([]);
      return;
    }
    let active = true;
    setLoading((current) => ({ ...current, items: true }));
    loadItems(vaultID)
      .then((result) => {
        if (active) setItems(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(errorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading((current) => ({ ...current, items: false }));
      });
    return () => {
      active = false;
    };
  }, [loadItems, vaultID]);

  const itemID = useMemo(
    () => catalogID(items, selection.item),
    [items, selection.item],
  );

  useEffect(() => {
    if (!vaultID || !itemID) {
      setFields([]);
      return;
    }
    let active = true;
    setLoading((current) => ({ ...current, fields: true }));
    loadFields(vaultID, itemID)
      .then((result) => {
        if (active) setFields(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(errorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading((current) => ({ ...current, fields: false }));
      });
    return () => {
      active = false;
    };
  }, [itemID, loadFields, vaultID]);

  const fieldOptions = useMemo<ComboboxOption[]>(
    () =>
      fields.map((field) => ({
        value: field.id,
        label: field.label,
        ...(field.section ? { group: field.section } : {}),
      })),
    [fields],
  );

  const changeVault = (vault: string) => {
    setError("");
    setSelection({ vault, item: "", field: "" });
    onChange("");
  };

  const changeItem = (item: string) => {
    setError("");
    setSelection((current) => ({ ...current, item, field: "" }));
    onChange("");
  };

  const changeField = (fieldID: string) => {
    setError("");
    setSelection((current) => ({ ...current, field: fieldID }));
    const field = fields.find((entry) => entry.id === fieldID);
    onChange(
      field?.reference ??
        buildOnePasswordReference({
          vault: catalogName(vaults, selection.vault),
          item: catalogName(items, selection.item),
          field: fieldID,
        }),
    );
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-2 md:grid-cols-3">
        <Combobox
          ariaLabel="1Password vault"
          placeholder="Vault"
          value={selection.vault}
          onChange={changeVault}
          options={options(vaults)}
          loading={loading.vaults}
          allowCustomValue={allowCustomValue}
        />
        <Combobox
          ariaLabel="1Password item"
          placeholder="Item"
          value={selection.item}
          onChange={changeItem}
          options={options(items)}
          loading={loading.items}
          allowCustomValue={allowCustomValue}
        />
        <Combobox
          ariaLabel="1Password field"
          placeholder="Field"
          value={selection.field}
          onChange={changeField}
          options={fieldOptions}
          loading={loading.fields}
          allowCustomValue={allowCustomValue}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
