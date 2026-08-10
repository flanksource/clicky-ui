export type OnePasswordVault = { id: string; name: string };
export type OnePasswordItem = { id: string; name: string };
export type OnePasswordField = {
  id: string;
  label: string;
  reference: string;
  section?: string;
};

export type OnePasswordLoaders = {
  loadVaults: () => Promise<OnePasswordVault[]>;
  loadItems: (vaultID: string) => Promise<OnePasswordItem[]>;
  loadFields: (
    vaultID: string,
    itemID: string,
  ) => Promise<OnePasswordField[]>;
};

export type OnePasswordSelection = {
  vault: string;
  item: string;
  field: string;
};

export function parseOnePasswordReference(
  reference: string,
): OnePasswordSelection | undefined {
  if (reference === "") return undefined;
  if (
    !reference.startsWith("op://") ||
    reference.includes("#") ||
    [0, 10, 13].some((code) => reference.includes(String.fromCharCode(code)))
  ) {
    throw new Error("invalid 1Password reference: expected op://<vault>/<item>/<field>");
  }
  const parts = reference.slice("op://".length).split("/");
  if (parts.length < 3 || parts.some((part) => part === "")) {
    throw new Error("invalid 1Password reference: expected op://<vault>/<item>/<field>");
  }
  try {
    return {
      vault: decodeURIComponent(parts[0]!),
      item: decodeURIComponent(parts[1]!),
      field: parts.slice(2).map(decodeURIComponent).join("/"),
    };
  } catch (error) {
    throw new Error(
      `invalid 1Password reference encoding: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function buildOnePasswordReference(
  selection: OnePasswordSelection,
): string {
  if (!selection.vault || !selection.item || !selection.field) return "";
  const field = selection.field
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `op://${encodeURIComponent(selection.vault)}/${encodeURIComponent(selection.item)}/${field}`;
}
