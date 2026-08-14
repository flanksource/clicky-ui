import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WorkloadPicker } from "./WorkloadPicker";
import {
  kindForValue,
  loadedWorkloads,
  parseWorkloadKey,
  workloadKey,
  type WorkloadKind,
  type WorkloadResource,
} from "./workload-picker-utils";

const FIXTURE: Record<WorkloadKind, WorkloadResource[]> = {
  service: [{ name: "demo-svc" }],
  ingress: [{ name: "demo-ing", hosts: ["demo.example.com"] }],
  pod: [{ name: "demo-api-abc12" }],
  deployment: [{ name: "demo-web" }],
  statefulset: [{ name: "demo-cycle" }],
  daemonset: [{ name: "node-agent" }],
};

const loadAll = () => Promise.resolve(FIXTURE);

describe("WorkloadPicker", () => {
  it("preserves each loaded workload's namespace in a cross-namespace catalog", async () => {
    const onChange = vi.fn();
    render(
      <WorkloadPicker
        value=""
        onChange={onChange}
        kinds={["deployment"]}
        loadWorkloads={async () => ({
          deployment: [{ name: "api", namespace: "payments" }],
        })}
      />,
    );

    fireEvent.focus(screen.getByRole("combobox", { name: "Workload" }));
    fireEvent.mouseDown(await screen.findByRole("option", { name: "api" }));
    expect(onChange).toHaveBeenCalledWith("payments/deployment/api");
  });

  it("groups options by kind with one header each", async () => {
    render(<WorkloadPicker value="" onChange={vi.fn()} loadWorkloads={loadAll} />);
    fireEvent.focus(screen.getByRole("combobox"));
    await waitFor(() => expect(screen.getByText("demo-svc")).toBeInTheDocument());
    // Headers are the presentation rows in the open listbox (the lead icon also
    // carries a kind label, so scope to role=presentation to avoid matching it).
    const listbox = screen.getByRole("listbox");
    const headers = [...listbox.querySelectorAll('[role="presentation"]')]
      .map((h) => h.textContent)
      .filter((t) => t);
    expect(headers).toEqual([
      "Service",
      "Ingress",
      "Pod",
      "Deployment",
      "StatefulSet",
      "DaemonSet",
    ]);
  });

  it("annotates an ingress option with its first host", async () => {
    render(<WorkloadPicker value="" onChange={vi.fn()} loadWorkloads={loadAll} />);
    fireEvent.focus(screen.getByRole("combobox"));
    // The host leads the label, the ingress name follows in parentheses.
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /demo\.example\.com \(demo-ing\)/ })).toBeInTheDocument(),
    );
  });

  it("emits an ingress/host key when an ingress is chosen", async () => {
    const onChange = vi.fn();
    render(<WorkloadPicker value="" onChange={onChange} loadWorkloads={loadAll} />);
    fireEvent.focus(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: /demo\.example\.com \(demo-ing\)/ });
    fireEvent.mouseDown(option);
    expect(onChange).toHaveBeenCalledWith("ingress/demo.example.com");
  });

  it("only requests and shows the kinds it is given", async () => {
    const load = vi.fn(loadAll);
    render(
      <WorkloadPicker value="" onChange={vi.fn()} loadWorkloads={load} kinds={["service"]} />,
    );
    fireEvent.focus(screen.getByRole("combobox"));
    await waitFor(() => expect(load).toHaveBeenCalledWith(["service"]));
    expect(screen.queryByText("Ingress")).toBeNull();
  });

  it("emits a kind/name key for the chosen workload", async () => {
    const onChange = vi.fn();
    render(<WorkloadPicker value="" onChange={onChange} loadWorkloads={loadAll} />);
    fireEvent.focus(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: "demo-svc" });
    fireEvent.mouseDown(option);
    expect(onChange).toHaveBeenCalledWith("service/demo-svc");
  });

  it("does not commit a workload name absent from the loaded options", async () => {
    const onChange = vi.fn();
    render(
      <WorkloadPicker
        value=""
        onChange={onChange}
        loadWorkloads={loadAll}
        allowCustomValue={false}
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    await waitFor(() => expect(screen.getByText("demo-svc")).toBeInTheDocument());
    fireEvent.change(input, { target: { value: "ghost-svc" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("prefixes the namespace when supplied", async () => {
    const onChange = vi.fn();
    render(<WorkloadPicker value="" namespace="demo" onChange={onChange} loadWorkloads={loadAll} />);
    fireEvent.focus(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: "demo-svc" });
    fireEvent.mouseDown(option);
    expect(onChange).toHaveBeenCalledWith("demo/service/demo-svc");
  });

  it("reloads workloads from a namespace selected by the user", async () => {
    const onChange = vi.fn();
    const loadWorkloads = vi.fn(
      (_kinds: WorkloadKind[], namespace?: string) =>
        Promise.resolve({
          service: [{ name: namespace === "search" ? "redis" : "demo-svc" }],
          ingress: [],
          pod: [],
          deployment: [],
          statefulset: [],
          daemonset: [],
        }),
    );
    render(
      <WorkloadPicker
        value=""
        namespace="demo"
        onChange={onChange}
        loadWorkloads={loadWorkloads}
        kinds={["service"]}
        allowNamespaceSelection
        loadNamespaces={() => Promise.resolve(["demo", "search"])}
      />,
    );

    await waitFor(() =>
      expect(loadWorkloads).toHaveBeenCalledWith(["service"], "demo"),
    );
    fireEvent.focus(screen.getByRole("combobox", { name: "Namespace" }));
    fireEvent.mouseDown(await screen.findByRole("option", { name: "search" }));

    await waitFor(() =>
      expect(loadWorkloads).toHaveBeenCalledWith(["service"], "search"),
    );
    expect(onChange).toHaveBeenCalledWith("");

    fireEvent.focus(screen.getByRole("combobox", { name: "Workload" }));
    fireEvent.mouseDown(await screen.findByRole("option", { name: "redis" }));
    expect(onChange).toHaveBeenLastCalledWith("search/service/redis");
  });

  it("uses the namespace encoded in the controlled value", async () => {
    const loadWorkloads = vi.fn(loadAll);
    render(
      <WorkloadPicker
        value="search/service/demo-svc"
        namespace="demo"
        onChange={vi.fn()}
        loadWorkloads={loadWorkloads}
        kinds={["service"]}
        allowNamespaceSelection
        loadNamespaces={() => Promise.resolve(["demo", "search"])}
      />,
    );

    await waitFor(() =>
      expect(loadWorkloads).toHaveBeenCalledWith(["service"], "search"),
    );
    expect(screen.getByRole("combobox", { name: "Namespace" })).toHaveValue(
      "search",
    );
  });

  it("rejects namespace selection without a namespace loader", () => {
    expect(() =>
      render(
        <WorkloadPicker
          value=""
          onChange={vi.fn()}
          loadWorkloads={loadAll}
          allowNamespaceSelection
        />,
      ),
    ).toThrow(
      "WorkloadPicker namespace selection requires loadNamespaces",
    );
  });

  it("disambiguates same-named workloads of different kinds", async () => {
    // A Service and a Deployment both named "demo" yield distinct keyed values.
    const load = () =>
      Promise.resolve({
        service: [{ name: "demo" }],
        ingress: [],
        pod: [],
        deployment: [{ name: "demo" }],
        statefulset: [],
        daemonset: [],
      });
    render(<WorkloadPicker value="" onChange={vi.fn()} loadWorkloads={load} />);
    fireEvent.focus(screen.getByRole("combobox"));
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));
    const values = screen.getAllByRole("option").map((o) => o.textContent);
    // Both render the human name "demo" but carry distinct service/ and
    // deployment/ keyed values (asserted via the unit tests below).
    expect(values).toEqual(["demo", "demo"]);
  });

  it("pins a preselected value not present in the loaded options", async () => {
    render(
      <WorkloadPicker value="service/legacy-svc" onChange={vi.fn()} loadWorkloads={loadAll} />,
    );
    fireEvent.focus(screen.getByRole("combobox"));
    // The pinned option is labelled with the name-part, not the raw key.
    await waitFor(() => expect(screen.getByRole("option", { name: "legacy-svc" })).toBeInTheDocument());
  });

  it("shows the selected workload's kind as the lead icon", async () => {
    render(
      <WorkloadPicker value="ingress/demo.example.com" onChange={vi.fn()} loadWorkloads={loadAll} />,
    );
    await waitFor(() => expect(screen.getByRole("img", { name: "Ingress" })).toBeInTheDocument());
  });

  it("updates the lead icon when the selection changes kind", async () => {
    const { rerender } = render(
      <WorkloadPicker value="statefulset/demo-cycle" onChange={vi.fn()} loadWorkloads={loadAll} />,
    );
    await waitFor(() => expect(screen.getByRole("img", { name: "StatefulSet" })).toBeInTheDocument());
    rerender(<WorkloadPicker value="deployment/demo-web" onChange={vi.fn()} loadWorkloads={loadAll} />);
    await waitFor(() => expect(screen.getByRole("img", { name: "Deployment" })).toBeInTheDocument());
  });

  it("falls back to the first offered kind's icon when nothing is selected", async () => {
    render(
      <WorkloadPicker value="" onChange={vi.fn()} loadWorkloads={loadAll} kinds={["deployment", "service"]} />,
    );
    // No selection → the first offered kind (deployment) drives the lead icon.
    await waitFor(() =>
      expect(screen.getByRole("img", { name: "Deployment" })).toBeInTheDocument(),
    );
  });
});

describe("WorkloadPicker strict mode", () => {
  it("flags a value that matches no loaded workload once loaded", async () => {
    render(
      <WorkloadPicker value="service/ghost-svc" strict onChange={vi.fn()} loadWorkloads={loadAll} />,
    );
    await waitFor(() =>
      expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true"),
    );
  });

  it("accepts a value that matches a loaded workload by its full key", async () => {
    const load = vi.fn(loadAll);
    render(
      <WorkloadPicker
        value="demo/service/demo-svc"
        strict
        namespace="demo"
        onChange={vi.fn()}
        loadWorkloads={load}
      />,
    );
    // Wait for the loader to resolve (it's called once on mount), then assert
    // the matched value never went invalid.
    await waitFor(() => expect(load).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid"));
  });

  it("accepts a value that matches only by its bare name-part", async () => {
    // Consumers that persist just the resolved Service name feed the bare name
    // back in; strict must still treat it as valid.
    render(<WorkloadPicker value="demo-svc" strict onChange={vi.fn()} loadWorkloads={loadAll} />);
    await waitFor(() => expect(screen.getByRole("combobox")).toBeInTheDocument());
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid");
  });

  it("does not flag while loading is still in flight", () => {
    // A never-resolving loader keeps the picker in its loading state; strict
    // must not flag the value before the workload list has settled.
    render(
      <WorkloadPicker
        value="service/ghost-svc"
        strict
        onChange={vi.fn()}
        loadWorkloads={() => new Promise(() => {})}
      />,
    );
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid");
  });

  it("never flags when strict is off, even for an unknown value", async () => {
    render(
      <WorkloadPicker value="service/ghost-svc" onChange={vi.fn()} loadWorkloads={loadAll} />,
    );
    await waitFor(() => expect(screen.getByRole("combobox")).toBeInTheDocument());
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid");
  });
});

describe("loadedWorkloads", () => {
  it("collects both full keys and bare names across kinds", () => {
    const { keys, names } = loadedWorkloads("demo", FIXTURE, [
      "service",
      "ingress",
      "deployment",
      "statefulset",
    ]);
    expect(keys).toContain("demo/service/demo-svc");
    // an ingress contributes its host as the name-part of both sets
    expect(keys).toContain("demo/ingress/demo.example.com");
    expect(names).toContain("demo-svc");
    expect(names).toContain("demo.example.com");
    expect(names).toContain("demo-cycle");
  });

  it("only includes the requested kinds", () => {
    const { names } = loadedWorkloads(undefined, FIXTURE, ["service"]);
    expect([...names]).toEqual(["demo-svc"]);
  });
});

describe("workloadKey / parseWorkloadKey", () => {
  it("keys a plain workload by kind/name, ingress by kind/host", () => {
    expect(workloadKey(undefined, "service", { name: "demo-svc" })).toBe("service/demo-svc");
    expect(workloadKey(undefined, "ingress", { name: "demo-ing", hosts: ["h.example.com"] })).toBe(
      "ingress/h.example.com",
    );
  });

  it("prefixes the namespace when given", () => {
    expect(workloadKey("demo", "deployment", { name: "web" })).toBe("demo/deployment/web");
  });

  it("round-trips a namespaced key", () => {
    expect(parseWorkloadKey("demo/service/demo-svc")).toEqual({
      namespace: "demo",
      kind: "service",
      name: "demo-svc",
    });
  });

  it("round-trips a namespace-less key", () => {
    expect(parseWorkloadKey("ingress/h.example.com")).toEqual({
      kind: "ingress",
      name: "h.example.com",
    });
  });

  it("round-trips pod and daemonset keys", () => {
    expect(parseWorkloadKey("default/pod/api-abc12")).toEqual({
      namespace: "default",
      kind: "pod",
      name: "api-abc12",
    });
    expect(parseWorkloadKey("observability/daemonset/node-agent")).toEqual({
      namespace: "observability",
      kind: "daemonset",
      name: "node-agent",
    });
  });

  it("treats a value with no recognised kind segment as a bare name", () => {
    expect(parseWorkloadKey("legacy-svc")).toEqual({ name: "legacy-svc" });
    // 'foo' is not a known kind, so the whole value is the name.
    expect(parseWorkloadKey("foo/bar")).toEqual({ name: "foo/bar" });
  });
});

describe("kindForValue", () => {
  it("reads the kind from a keyed value", () => {
    expect(kindForValue(["service", "ingress"], "ingress/h.example.com")).toBe("ingress");
    expect(kindForValue(["service", "deployment"], "demo/deployment/web")).toBe("deployment");
  });

  it("falls back to the first offered kind for empty / unkeyed values", () => {
    expect(kindForValue(["deployment", "service"], "")).toBe("deployment");
    expect(kindForValue(["service"], "legacy-svc")).toBe("service");
  });
});
