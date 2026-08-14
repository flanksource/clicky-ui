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

  it("rejects values that cannot identify a supported namespaced workload", () => {
    expect(() =>
      withKubernetesWorkloadTarget("deployment/api"),
    ).toThrow("namespaced Kubernetes workload");
    expect(() =>
      withKubernetesWorkloadTarget("default/service/api"),
    ).toThrow("unsupported Kubernetes workload kind");
  });
});
