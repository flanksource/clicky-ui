import { describe, it, expect } from "vitest";
import {
  connectionKubernetesSelection,
  kubernetesURL,
} from "./connectionKubernetesSelection";

describe("connection Kubernetes selection", () => {
  it("reads the persisted connection properties", () => {
    const selection = {
      kubeconfig: "/configs/target cluster.yaml",
      kubecontext: "target/admin",
    };
    expect(connectionKubernetesSelection({ properties: selection })).toEqual(
      selection,
    );
    expect(
      Object.fromEntries(
        new URL(
          kubernetesURL("/api/secrets?namespace=shop", selection),
          "http://localhost",
        ).searchParams,
      ),
    ).toEqual({ namespace: "shop", ...selection });
  });
  it("preserves ambient lookup URLs", () => {
    expect(kubernetesURL("/api/namespaces", {})).toBe("/api/namespaces");
  });
});
