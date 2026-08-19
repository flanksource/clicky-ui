import type {
  SpecRuntimeSandboxBackend,
  SpecRuntimeSandboxCatalog,
} from "./SpecRuntimeEditor/types";

export type SpecRuntimeSandboxCredential = {
  id: string;
  token: string;
  label: string;
  description?: string | undefined;
  category?: string | undefined;
  reference?: Record<string, unknown> | undefined;
  available?: boolean | undefined;
  unavailableReason?: string | undefined;
};

export type SpecRuntimeSandboxCreateDraft = {
  name: string;
  kind: string;
  parameters: Record<string, unknown>;
  credentialIds: string[];
  setDefault: boolean;
};

export type SpecRuntimeSandboxCreateInput = {
  name: string;
  kind: string;
  options: Record<string, unknown>;
  setDefault: boolean;
};

export type SpecRuntimeSandboxCreateConfig = {
  credentials?: SpecRuntimeSandboxCredential[] | undefined;
  onCreate: (
    input: SpecRuntimeSandboxCreateInput,
  ) => Promise<SpecRuntimeSandboxBackend> | SpecRuntimeSandboxBackend;
};

export function emptySandboxCreateDraft(
  catalog: SpecRuntimeSandboxCatalog,
): SpecRuntimeSandboxCreateDraft {
  return {
    name: "",
    kind: catalog.kinds?.find((kind) => kind.kind !== "none")?.kind ?? "",
    parameters: {},
    credentialIds: [],
    setDefault: false,
  };
}

export function toggleSandboxCredential(
  draft: SpecRuntimeSandboxCreateDraft,
  credentialId: string,
  credentials: SpecRuntimeSandboxCredential[],
): SpecRuntimeSandboxCreateDraft {
  const credential = credentials.find((item) => item.id === credentialId);
  if (!credential) {
    throw new Error(
      `unknown sandbox credential ${JSON.stringify(credentialId)}`,
    );
  }
  if (credential.available === false) {
    throw new Error(
      `sandbox credential ${JSON.stringify(credentialId)} is unavailable`,
    );
  }
  if (draft.credentialIds.includes(credentialId)) {
    return {
      ...draft,
      credentialIds: draft.credentialIds.filter((id) => id !== credentialId),
    };
  }
  const sameToken = new Set(
    credentials
      .filter((item) => item.token === credential.token)
      .map((item) => item.id),
  );
  return {
    ...draft,
    credentialIds: [
      ...draft.credentialIds.filter((id) => !sameToken.has(id)),
      credentialId,
    ],
  };
}

export function buildSandboxCreateInput(
  draft: SpecRuntimeSandboxCreateDraft,
  credentials: SpecRuntimeSandboxCredential[],
): SpecRuntimeSandboxCreateInput {
  const name = draft.name.trim();
  const kind = draft.kind.trim();
  if (!name) throw new Error("sandbox name is required");
  if (!kind) throw new Error("sandbox kind is required");
  if (Object.hasOwn(draft.parameters, "tokens")) {
    throw new Error(
      "the credentials step owns options.tokens; remove tokens from the parameter schema",
    );
  }

  const tokens: Record<string, Record<string, unknown>> = {};
  for (const id of draft.credentialIds) {
    const credential = credentials.find((item) => item.id === id);
    if (!credential) {
      throw new Error(`unknown sandbox credential ${JSON.stringify(id)}`);
    }
    if (credential.available === false) {
      throw new Error(
        `sandbox credential ${JSON.stringify(id)} is unavailable`,
      );
    }
    if (Object.hasOwn(tokens, credential.token)) {
      throw new Error(
        `multiple sandbox credentials target token ${JSON.stringify(credential.token)}`,
      );
    }
    tokens[credential.token] = { ...credential.reference };
  }

  const options = { ...draft.parameters };
  if (Object.keys(tokens).length > 0) options.tokens = tokens;
  return { name, kind, options, setDefault: draft.setDefault };
}
