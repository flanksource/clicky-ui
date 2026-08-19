import { describe, expect, it } from "vitest";
import {
  kubernetesWorkloadTargetValue,
  withKubernetesWorkloadTarget,
} from "./kubernetesWorkloadTarget";

describe("kubernetes workload target", () => {
  it("encodes an exact query target as a namespaced picker value", () => {
    expect(
      kubernetesWorkloadTargetValue(
        "kind=DaemonSet namespace=observability name=node-agent",
      ),
    ).toBe("observability/daemonset/node-agent");
  });

  it("maps a picked workload onto the target query grammar", () => {
    expect(
      withKubernetesWorkloadTarget(
        "payments/deployment/api",
      ),
    ).toBe("kind=Deployment namespace=payments name=api");
  });

  it("clears the target query when the picker is cleared", () => {
    expect(withKubernetesWorkloadTarget("")).toBe("");
  });

  it("saves a namespace chosen without a workload as a namespace-scoped query", () => {
    expect(withKubernetesWorkloadTarget("payments/")).toBe(
      "namespace=payments",
    );
  });

  it("shows the namespace of a namespace-scoped query in the picker", () => {
    expect(kubernetesWorkloadTargetValue("namespace=payments")).toBe(
      "payments/",
    );
  });

  it("round-trips a namespace-only target through the query grammar", () => {
    const value = "observability/";
    expect(
      kubernetesWorkloadTargetValue(withKubernetesWorkloadTarget(value)),
    ).toBe(value);
  });

  it("has no picker value for a query naming no namespace", () => {
    expect(kubernetesWorkloadTargetValue("")).toBe("");
    expect(kubernetesWorkloadTargetValue("kind=Pod")).toBe("");
  });

  it("rejects values that cannot identify a supported namespaced workload", () => {
    expect(() =>
      withKubernetesWorkloadTarget("deployment/api"),
    ).toThrow("namespaced Kubernetes workload");
    expect(() =>
      withKubernetesWorkloadTarget("default/service/api"),
    ).toThrow("unsupported Kubernetes workload kind");
  });
});
