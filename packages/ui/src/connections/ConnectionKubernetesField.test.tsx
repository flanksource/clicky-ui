import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConnectionKubernetesField } from "./ConnectionKubernetesField";
import type { FieldControl } from "../components/json-schema-form-types";
import type { ConnectionJsonFetcher } from "./connectionSchemaFormExtensions";

function field(component: string): FieldControl {
  return {
    key: "kubeconfig",
    kind: "string",
    label: "Kubeconfig",
    required: false,
    value: "/first.yaml",
    onChange: vi.fn(),
    schema: { type: "string", "x-clicky-component": component },
  };
}

describe("connection Kubernetes controls", () => {
  it("preserves the selected context while editing the file", () => {
    const onRootChange = vi.fn();
    render(
      <ConnectionKubernetesField
        field={field("k8s-kubeconfig-selector")}
        base="/api/connections"
        fetcher={vi.fn() as ConnectionJsonFetcher}
        context={{
          rootValue: {
            name: "orders",
            properties: {
              kubeconfig: "/first.yaml",
              kubecontext: "first",
              region: "west",
            },
          },
          onRootChange,
        }}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Kubeconfig file" }), {
      target: { value: "/second.yaml" },
    });
    expect(onRootChange).toHaveBeenCalledWith({
      name: "orders",
      properties: {
        kubeconfig: "/second.yaml",
        kubecontext: "first",
        region: "west",
      },
    });
  });
  it("loads context options from the selected server file", async () => {
    const fetcher = vi.fn(async () => ({ contexts: ["staging-admin"] }));
    render(
      <ConnectionKubernetesField
        field={field("k8s-context-selector")}
        base="/api/connections"
        fetcher={fetcher as ConnectionJsonFetcher}
        context={{
          rootValue: { properties: { kubeconfig: "/cluster file.yaml" } },
        }}
      />,
    );
    await waitFor(() =>
      expect(fetcher).toHaveBeenCalledWith(
        "/api/connections/contexts?kubeconfig=%2Fcluster+file.yaml",
      ),
    );
    fireEvent.focus(screen.getByRole("combobox", { name: "Kubecontext" }));
    expect(
      await screen.findByRole("option", { name: "staging-admin" }),
    ).toBeDefined();
  });
  it("surfaces discovery failures", async () => {
    render(
      <ConnectionKubernetesField
        field={field("k8s-context-selector")}
        base="/api/connections"
        fetcher={
          vi.fn(async () => {
            throw new Error("selected file is missing");
          }) as ConnectionJsonFetcher
        }
        context={undefined}
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Check the kubeconfig file path",
    );
    expect(screen.getByText("selected file is missing")).toBeInTheDocument();
  });
});
