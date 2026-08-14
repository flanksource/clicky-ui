import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { KubernetesWorkloadTargetPicker } from "./kubernetesWorkloadTargetPicker";

const workloadCatalog = {
  service: [],
  ingress: [],
  pod: [{ name: "api-abc12" }],
  deployment: [{ name: "api" }],
  statefulset: [],
  daemonset: [],
};

afterEach(() => vi.unstubAllGlobals());

describe("KubernetesWorkloadTargetPicker", () => {
  it("loads the saved connection catalog and emits a target query", async () => {
    const onChange = vi.fn();
    const fetcher = vi.fn((input: string | URL | Request) => {
      const url = String(input);
      const payload = url.endsWith("/namespaces")
        ? ["payments"]
        : workloadCatalog;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payload),
      });
    });
    vi.stubGlobal("fetch", fetcher);

    render(
      <KubernetesWorkloadTargetPicker
        baseUrl="/api/v1/connection/cluster-a/browser"
        target={{
          kind: "kubernetes-workload",
          label: "Workload",
          kinds: ["pod", "deployment", "statefulset", "daemonset"],
        }}
        query="kind=Deployment namespace=payments name=api"
        onChange={onChange}
      />,
    );

    await waitFor(() =>
      expect(fetcher).toHaveBeenCalledWith(
        "/api/v1/connection/cluster-a/browser/namespaces",
        undefined,
      ),
    );
    await waitFor(() =>
      expect(fetcher).toHaveBeenCalledWith(
        "/api/v1/connection/cluster-a/browser/workloads?namespace=payments&kinds=pod%2Cdeployment%2Cstatefulset%2Cdaemonset",
        undefined,
      ),
    );

    fireEvent.focus(screen.getByRole("combobox", { name: "Workload" }));
    fireEvent.mouseDown(await screen.findByRole("option", { name: "api-abc12" }));
    expect(onChange).toHaveBeenCalledWith(
      "kind=Pod namespace=payments name=api-abc12",
    );
  });
});
