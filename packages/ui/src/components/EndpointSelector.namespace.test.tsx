import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { EndpointSelector } from "./EndpointSelector";
import type { EndpointSelectorValue } from "./EndpointSelector.model";
import type { WorkloadKind, WorkloadResource } from "./workload-picker-utils";

describe("EndpointSelector namespace selection", () => {
  it("clears the old target and emits a service from the selected namespace", async () => {
    const loadWorkloads = vi.fn(
      (kinds: WorkloadKind[], namespace?: string) =>
        Promise.resolve(
          Object.fromEntries(
            kinds.map((kind) => [
              kind,
              kind === "service"
                ? [
                    {
                      name: namespace === "search" ? "redis" : "opensearch",
                      ports: [
                        {
                          name: namespace === "search" ? "redis" : "http",
                          number: namespace === "search" ? 6379 : 9200,
                        },
                      ],
                    },
                  ]
                : [],
            ]),
          ) as Record<WorkloadKind, WorkloadResource[]>,
        ),
    );
    const changes: Array<EndpointSelectorValue | undefined> = [];
    const namespaceChanges: Array<string | undefined> = [];

    function ControlledSelector() {
      const [value, setValue] = useState<EndpointSelectorValue | undefined>({
        mode: "service",
        target: { kind: "service", name: "opensearch", namespace: "platform" },
        port: "9200",
      });
      return (
        <EndpointSelector
          value={value}
          onChange={(next) => {
            changes.push(next);
            setValue(next);
          }}
          namespace="platform"
          modes={["service", "url"]}
          defaultMode="service"
          loadWorkloads={loadWorkloads}
          allowNamespaceSelection
          loadNamespaces={() => Promise.resolve(["platform", "search"])}
          onNamespaceChange={(namespace) => namespaceChanges.push(namespace)}
          urlSelector={{
            sources: ["value"],
            loadResources: () => Promise.resolve([]),
            loadKeyPreview: () => Promise.resolve([]),
          }}
        />
      );
    }

    render(<ControlledSelector />);
    await waitFor(() =>
      expect(loadWorkloads).toHaveBeenCalledWith(["service"], "platform"),
    );

    fireEvent.focus(screen.getByRole("combobox", { name: "Namespace" }));
    fireEvent.mouseDown(await screen.findByRole("option", { name: "search" }));
    await waitFor(() => expect(changes).toContain(undefined));
    expect(namespaceChanges).toEqual(["search"]);
    await waitFor(() =>
      expect(loadWorkloads).toHaveBeenCalledWith(["service"], "search"),
    );

    fireEvent.focus(screen.getByRole("combobox", { name: "Workload" }));
    fireEvent.mouseDown(await screen.findByRole("option", { name: "redis" }));
    expect(changes.at(-1)).toEqual({
      mode: "service",
      target: { kind: "service", name: "redis", namespace: "search" },
      port: "6379",
    });

    fireEvent.click(screen.getByRole("radio", { name: "URL" }));
    expect(namespaceChanges).toEqual(["search", undefined]);
  });

  it("uses the configured port when the selected service exposes no ports", async () => {
    const onChange = vi.fn();
    render(
      <EndpointSelector
        value={undefined}
        onChange={onChange}
        namespace="oipa"
        modes={["service", "url"]}
        defaultMode="service"
        loadWorkloads={(kinds) =>
          Promise.resolve(
            Object.fromEntries(
              kinds.map((kind) => [
                kind,
                kind === "service" ? [{ name: "redis" }] : [],
              ]),
            ) as Record<WorkloadKind, WorkloadResource[]>,
          )
        }
        defaults={{ scheme: "redis", port: "6379" }}
      />,
    );

    fireEvent.focus(screen.getByRole("combobox", { name: "Workload" }));
    fireEvent.mouseDown(await screen.findByRole("option", { name: "redis" }));
    expect(onChange).toHaveBeenLastCalledWith({
      mode: "service",
      target: { kind: "service", name: "redis", namespace: "oipa" },
      scheme: "redis",
      port: "6379",
    });
  });
});
