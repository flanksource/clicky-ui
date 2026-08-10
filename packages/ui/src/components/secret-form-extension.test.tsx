import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import {
  createSecretFormExtensions,
  type SecretFormLoaders,
} from "./secret-form-extension";
import type { JsonSchemaObject } from "./json-schema-form-types";

const loaders: SecretFormLoaders = {
  loadResources: async (kind) => [{ name: `${kind}-resource` }],
  loadKeyPreview: async () => [],
  loadServiceAccounts: async () => [{ name: "reader" }],
  loadOnePasswordVaults: async () => [
    { id: "vault-prod", name: "Production" },
  ],
  loadOnePasswordItems: async () => [],
  loadOnePasswordFields: async () => [],
  loadWorkloads: async () => ({
    service: [],
    ingress: [],
    deployment: [],
    statefulset: [],
  }),
};

const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    password: {
      type: "string",
      "x-clicky-component": "k8s-secret-selector",
    },
  },
};

function Form() {
  const [value, setValue] = useState<Record<string, unknown>>({ password: "" });
  const extensions = createSecretFormExtensions({
    loaders,
    secretSources: [
      "secret",
      "configmap",
      "helm",
      "serviceaccount",
      "onepassword",
      "value",
    ],
  });
  return (
    <JsonSchemaForm
      schema={schema}
      value={value}
      onChange={setValue}
      post={extensions.post}
    />
  );
}

describe("createSecretFormExtensions", () => {
  it.each([
    ["Value", "textbox", "Static value", undefined],
    ["ConfigMap", "placeholder", "Select configmap…", "configmap-resource"],
    ["Helm", "placeholder", "Select helm…", "helm-resource"],
    ["Service Account", "placeholder", "Service account…", "reader"],
    ["1Password", "combobox", "1Password vault", "Production"],
  ])("retains an incomplete %s choice after the form commits an empty string", async (source, controlKind, control, loadedOption) => {
    render(<Form />);

    const sourceInput = screen.getByRole("combobox", {
      name: "Secret value source",
    });
    fireEvent.focus(sourceInput);
    const sourceOption = await screen.findByRole("option", { name: source });
    await act(async () => fireEvent.mouseDown(sourceOption));

    const selectedControl =
      controlKind === "placeholder"
        ? screen.getByPlaceholderText(control)
        : screen.getByRole(controlKind, { name: control });
    expect(selectedControl).toBeInTheDocument();
    if (loadedOption) {
      fireEvent.focus(selectedControl);
      expect(
        await screen.findByRole("option", { name: loadedOption }),
      ).toBeInTheDocument();
    }
  });
});
