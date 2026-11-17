import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import type { JsonSchemaObject } from "../components/json-schema-form-types";
import {
  connectionSchemaFormExtensions,
  type ConnectionJsonFetcher,
} from "./connectionSchemaFormExtensions";

const API_BASE = "/api/v1";

const connectionSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    name: { type: "string", title: "Name", "x-clicky-order": 0 },
    namespace: { type: "string", title: "Namespace", "x-clicky-component": "k8s-namespace-selector", "x-clicky-order": 1 },
    properties: {
      type: "object",
      title: "Authentication",
      "x-clicky-order": 4,
      properties: {
        index: { type: "string", title: "Default index" },
        kubeconfig: { type: "string", title: "Kubeconfig file", "x-clicky-component": "k8s-kubeconfig-selector", "x-clicky-order": -2 },
        kubecontext: { type: "string", title: "Kubecontext", "x-clicky-component": "k8s-context-selector", "x-clicky-order": -1 },
      },
    },
  },
};

const follows = (before: Element, after: Element) =>
  (before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

function renderConnectionForm({
  extensionSchema,
  kubernetes,
}: {
  extensionSchema: JsonSchemaObject;
  kubernetes?: "form" | "external";
}) {
  const requested: string[] = [];
  const fetcher = (async (url: string) => {
    requested.push(url);
    return url.includes("/contexts") ? { currentContext: "a", contexts: ["a", "b"] } : [];
  }) as ConnectionJsonFetcher;
  const extensions = connectionSchemaFormExtensions({
    apiBase: API_BASE,
    schema: extensionSchema,
    fetcher,
    ...(kubernetes ? { kubernetes } : {}),
  });
  const root = { name: "c", namespace: "default", properties: { index: "logs" } };
  render(
    <JsonSchemaForm
      schema={connectionSchema}
      value={root}
      onChange={() => {}}
      rootValue={root}
      onRootChange={() => {}}
      pre={extensions.pre}
      post={extensions.post}
      showPreferencesMenu={false}
    />,
  );
  return requested;
}

describe("connection kubernetes selection placement", () => {
  it("puts the kubeconfig file and a kubecontext dropdown above the name, once, and loads the contexts", async () => {
    const requested = renderConnectionForm({ extensionSchema: connectionSchema });

    const context = await screen.findByRole("combobox", { name: "Kubecontext" });
    const kubeconfig = screen.getByRole("textbox", { name: "Kubeconfig file" });
    const name = screen.getByRole("textbox", { name: "Name" });
    const index = screen.getByRole("textbox", { name: "Default index" });
    expect({
      kubeconfigBeforeName: follows(kubeconfig, name),
      contextBeforeName: follows(context, name),
      nameBeforeProperties: follows(name, index),
      contexts: screen.getAllByRole("combobox", { name: "Kubecontext" }).length,
      kubeconfigs: screen.getAllByRole("textbox", { name: "Kubeconfig file" }).length,
      heading: screen.queryByText("Kubernetes resolution"),
    }).toEqual({
      kubeconfigBeforeName: true,
      contextBeforeName: true,
      nameBeforeProperties: true,
      contexts: 1,
      kubeconfigs: 1,
      heading: null,
    });
    await waitFor(() => expect(requested.some((url) => url.includes("/connections/contexts"))).toBe(true));
  });

  it("still renders the kubecontext as a dropdown in the properties group when the extensions were built without the served schema", async () => {
    renderConnectionForm({ extensionSchema: {} });

    expect(await screen.findByRole("combobox", { name: "Kubecontext" })).toBeInTheDocument();
    expect(screen.getByText("Kubernetes resolution")).toBeInTheDocument();
  });

  it("leaves the selection out of the form when the host places it externally", () => {
    renderConnectionForm({ extensionSchema: connectionSchema, kubernetes: "external" });

    expect({
      context: screen.queryByRole("combobox", { name: "Kubecontext" }),
      kubeconfig: screen.queryByRole("textbox", { name: "Kubeconfig file" }),
    }).toEqual({ context: null, kubeconfig: null });
  });
});
