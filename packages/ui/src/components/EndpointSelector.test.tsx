import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { EndpointSelector } from "./EndpointSelector";
import type {
  EndpointSelectorProps,
  EndpointSelectorValue,
} from "./EndpointSelector.model";
import type { WorkloadKind, WorkloadResource } from "./workload-picker-utils";

const WORKLOADS: Record<WorkloadKind, WorkloadResource[]> = {
  service: [
    {
      name: "search",
      ports: [
        { name: "http", number: 9200 },
        { name: "metrics", number: 9600 },
      ],
    },
    {
      name: "web",
      ports: [
        { name: "admin", number: 12345 },
        { name: "https", number: 443 },
        { name: "application", number: 8080 },
        { name: "http", number: 80 },
      ],
    },
  ],
  ingress: [
    { name: "search-ingress", hosts: ["search.example.com"] },
    { name: "hostless-ingress" },
  ],
  deployment: [{ name: "worker", ports: [{ name: "http", number: 8080 }] }],
  statefulset: [],
};

const loadWorkloads = (kinds: WorkloadKind[]) =>
  Promise.resolve(
    Object.fromEntries(kinds.map((kind) => [kind, WORKLOADS[kind]])) as Record<
      WorkloadKind,
      WorkloadResource[]
    >,
  );

const loadResources = vi.fn().mockResolvedValue([]);
const loadKeyPreview = vi.fn().mockResolvedValue([]);

function props(
  overrides: Partial<EndpointSelectorProps> = {},
): EndpointSelectorProps {
  return {
    value: undefined,
    onChange: vi.fn(),
    namespace: "demo",
    modes: ["url", "service", "ingress", "api-proxy"],
    defaultMode: "url",
    loadWorkloads,
    urlSelector: {
      loadResources,
      loadKeyPreview,
      sources: ["secret", "configmap", "value"],
    },
    allowCustomPort: true,
    ...overrides,
  };
}

describe("EndpointSelector", () => {
  it("renders only the access modes enabled by the consumer", async () => {
    render(<EndpointSelector {...props()} />);

    expect(
      screen.getAllByRole("radio").map((radio) => radio.textContent),
    ).toEqual(["URL", "Service", "Ingress", "API proxy"]);
    expect(screen.queryByRole("radio", { name: "Cluster IP" })).toBeNull();
    expect(screen.queryByRole("radio", { name: "Port-forward" })).toBeNull();
    await waitFor(() => expect(loadResources).toHaveBeenCalled());
  });

  it("falls back to the first discovered port when no preferred port is exposed", async () => {
    const onChange = vi.fn();
    render(
      <EndpointSelector
        {...props({
          onChange,
          defaultMode: "service",
          defaults: { scheme: "http", path: "/_cluster/health" },
        })}
      />,
    );

    fireEvent.focus(screen.getAllByRole("combobox")[0]!);
    fireEvent.mouseDown(await screen.findByRole("option", { name: "search" }));

    expect(onChange).toHaveBeenLastCalledWith({
      mode: "service",
      target: { kind: "service", name: "search", namespace: "demo" },
      scheme: "http",
      port: "9200",
      path: "/_cluster/health",
    });
  });

  it("prefers discovered ports in 80, 443, 8080 order", async () => {
    const onChange = vi.fn();
    render(
      <EndpointSelector
        {...props({
          onChange,
          defaultMode: "service",
          defaults: { scheme: "http", path: "/" },
        })}
      />,
    );

    fireEvent.focus(screen.getAllByRole("combobox")[0]!);
    fireEvent.mouseDown(await screen.findByRole("option", { name: "web" }));

    expect(onChange).toHaveBeenLastCalledWith({
      mode: "service",
      target: { kind: "service", name: "web", namespace: "demo" },
      scheme: "http",
      port: "80",
      path: "/",
    });
  });

  it("fills a missing port after a seeded workload is discovered", async () => {
    const onChange = vi.fn();
    render(
      <EndpointSelector
        {...props({
          value: {
            mode: "service",
            target: { kind: "service", name: "web", namespace: "demo" },
            scheme: "http",
          },
          onChange,
          defaultMode: "service",
        })}
      />,
    );

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        mode: "service",
        target: { kind: "service", name: "web", namespace: "demo" },
        scheme: "http",
        port: "80",
      }),
    );
  });

  it("keeps a service target when switching to API proxy", async () => {
    const onChange = vi.fn();
    const value: EndpointSelectorValue = {
      mode: "service",
      target: { kind: "service", name: "search", namespace: "demo" },
      scheme: "http",
      port: "9200",
    };
    render(
      <EndpointSelector
        {...props({ value, onChange, defaultMode: "service" })}
      />,
    );
    await waitFor(() =>
      expect(screen.getAllByRole("combobox")).toHaveLength(2),
    );

    fireEvent.click(screen.getByRole("radio", { name: "API proxy" }));

    expect(onChange).toHaveBeenLastCalledWith({ ...value, mode: "api-proxy" });
  });

  it("keeps the chosen mode when switching clears an incompatible target", async () => {
    function ControlledSelector() {
      const [value, setValue] = useState<EndpointSelectorValue | undefined>({
        mode: "service",
        target: { kind: "service", name: "search", namespace: "demo" },
      });
      return (
        <EndpointSelector
          {...props({
            value,
            onChange: setValue,
          })}
        />
      );
    }

    render(<ControlledSelector />);
    fireEvent.click(screen.getByRole("radio", { name: "Ingress" }));

    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "Ingress" })).toHaveAttribute(
        "aria-checked",
        "true",
      ),
    );
  });

  it("preserves ingress resource identity and its routable host", async () => {
    const onChange = vi.fn();
    render(
      <EndpointSelector
        {...props({ onChange, defaultMode: "ingress", showIngressPort: true })}
      />,
    );

    fireEvent.focus(screen.getAllByRole("combobox")[0]!);
    const listbox = await screen.findByRole("listbox");
    expect(
      within(listbox).queryByRole("option", { name: "hostless-ingress" }),
    ).toBeNull();
    fireEvent.mouseDown(
      within(listbox).getByRole("option", {
        name: /search\.example\.com \(search-ingress\)/,
      }),
    );

    expect(onChange).toHaveBeenLastCalledWith({
      mode: "ingress",
      target: {
        kind: "ingress",
        name: "search-ingress",
        host: "search.example.com",
        namespace: "demo",
      },
    });
  });

  it("resolves a persisted ingress resource name to its discovered host", async () => {
    const value: EndpointSelectorValue = {
      mode: "ingress",
      target: {
        kind: "ingress",
        name: "search-ingress",
        namespace: "demo",
      },
    };
    render(
      <EndpointSelector
        {...props({
          value,
          defaultMode: "ingress",
          showIngressPort: true,
        })}
      />,
    );

    fireEvent.focus(screen.getAllByRole("combobox")[0]!);
    const listbox = await screen.findByRole("listbox");
    await waitFor(() =>
      expect(within(listbox).getAllByRole("option")).toHaveLength(1),
    );
    expect(
      within(listbox).getByRole("option", {
        name: /search\.example\.com \(search-ingress\)/,
      }),
    ).toBeInTheDocument();
  });

  it("offers discovered ports and accepts a custom numeric port", async () => {
    const onChange = vi.fn();
    const value: EndpointSelectorValue = {
      mode: "service",
      target: { kind: "service", name: "search", namespace: "demo" },
      port: "9200",
    };
    render(
      <EndpointSelector
        {...props({ value, onChange, defaultMode: "service" })}
      />,
    );

    await waitFor(() =>
      expect(screen.getAllByRole("combobox")).toHaveLength(2),
    );
    const port = screen.getByRole("combobox", { name: "Port" });
    fireEvent.focus(port);
    expect(
      await screen.findByRole("option", { name: "http (9200)" }),
    ).toBeInTheDocument();
    fireEvent.change(port, { target: { value: "9300" } });
    fireEvent.keyDown(port, { key: "Enter" });

    expect(onChange).toHaveBeenLastCalledWith({ ...value, port: "9300" });
  });

  it("warns for a valid custom port that is not exposed by the workload", async () => {
    function ControlledSelector() {
      const [value, setValue] = useState<EndpointSelectorValue>({
        mode: "service",
        target: { kind: "service", name: "search", namespace: "demo" },
        port: "9200",
      });
      return (
        <EndpointSelector
          {...props({ value, onChange: setValue, defaultMode: "service" })}
        />
      );
    }

    render(<ControlledSelector />);
    const port = await screen.findByRole("combobox", { name: "Port" });
    fireEvent.focus(port);
    fireEvent.change(port, { target: { value: "9443" } });

    fireEvent.click(
      screen.getByRole("option", {
        name: /Use 9443 — not exposed by search/,
      }),
    );

    await waitFor(() => expect(port).toHaveValue("9443"));
    expect(
      screen.getByRole("img", {
        name: 'Port 9443 is not exposed by workload "search"',
      }),
    ).toBeInTheDocument();

    fireEvent.focus(port);
    fireEvent.mouseDown(
      await screen.findByRole("option", { name: "http (9200)" }),
    );

    await waitFor(() => expect(port).toHaveValue("http (9200)"));
    expect(
      screen.queryByRole("img", {
        name: 'Port 9443 is not exposed by workload "search"',
      }),
    ).toBeNull();
  });

  it("assigns compact field bases and exposes the complete path", async () => {
    const onChange = vi.fn();
    const value: EndpointSelectorValue = {
      mode: "service",
      target: { kind: "service", name: "search", namespace: "demo" },
      scheme: "http",
      port: "9200",
      path: "/_cluster/health",
    };
    const { container } = render(
      <EndpointSelector
        {...props({
          value,
          onChange,
          defaultMode: "service",
          schemes: ["http", "https"],
          allowCustomScheme: false,
          showScheme: true,
          showPath: true,
        })}
      />,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("combobox", { name: "Port" }),
      ).toBeInTheDocument(),
    );
    expect(
      container.querySelector('[data-slot="endpoint-fields"]'),
    ).toHaveClass(
      "flex",
      "w-full",
      "max-w-full",
      "min-w-0",
      "flex-nowrap",
      "items-end",
    );
    expect(
      container.querySelector('[data-slot="endpoint-fields"]'),
    ).not.toHaveClass("w-fit");
    expect(
      container.querySelector('[data-slot="endpoint-workload-field"]'),
    ).toHaveClass(
      "max-w-full",
      "min-w-0",
      "basis-56",
      "shrink",
      "grow",
    );
    expect(
      container.querySelector('[data-slot="endpoint-scheme-field"]'),
    ).toHaveClass(
      "max-w-full",
      "min-w-0",
      "basis-32",
      "shrink",
      "grow-0",
    );
    expect(
      container.querySelector('[data-slot="endpoint-port-field"]'),
    ).toHaveClass(
      "max-w-full",
      "min-w-0",
      "basis-36",
      "shrink",
      "grow-0",
    );
    expect(
      container.querySelector('[data-slot="endpoint-path-field"]'),
    ).toHaveClass(
      "max-w-full",
      "min-w-0",
      "basis-56",
      "shrink",
      "grow",
    );
    expect(
      container.querySelector('[data-slot="endpoint-port-field"]'),
    ).not.toHaveClass("w-28", "shrink-0");
    expect(screen.queryByRole("combobox", { name: "Scheme" })).toBeNull();
    expect(
      screen.getByRole("radiogroup", { name: "Scheme" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Path" })).toHaveAttribute(
      "title",
      value.path,
    );

    fireEvent.click(screen.getByRole("radio", { name: "https" }));
    expect(onChange).toHaveBeenLastCalledWith({ ...value, scheme: "https" });
  });

  it("resynchronizes the visible mode when the controlled value changes", async () => {
    const initial: EndpointSelectorValue = {
      mode: "url",
      source: { kind: "value", value: "https://search.example.com" },
    };
    const { rerender } = render(
      <EndpointSelector {...props({ value: initial })} />,
    );

    rerender(
      <EndpointSelector
        {...props({
          value: {
            mode: "service",
            target: { kind: "service", name: "search", namespace: "demo" },
          },
        })}
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "Service" })).toHaveAttribute(
        "aria-checked",
        "true",
      ),
    );
  });
});
