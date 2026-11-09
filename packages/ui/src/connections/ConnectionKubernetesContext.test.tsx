import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectionKubernetesContext } from "./ConnectionKubernetesContext";
import type { ConnectionJsonFetcher } from "./connectionSchemaFormExtensions";

const CURRENT = "kind-dev";
const SELECTED = "gke-prod-eu";

const fetcher = (async (url: string) => {
  if (!url.startsWith("/api/v1/connections/contexts")) throw new Error(`unexpected GET ${url}`);
  return { currentContext: CURRENT, contexts: [CURRENT, SELECTED] };
}) as ConnectionJsonFetcher;

describe("ConnectionKubernetesContext", () => {
  it("names the kubeconfig's current context when the connection selects none", async () => {
    render(<ConnectionKubernetesContext rootValue={{}} onRootChange={() => {}} apiBase="/api/v1" fetcher={fetcher} />);

    expect(await screen.findByRole("button", { name: new RegExp(CURRENT) })).toBeInTheDocument();
  });

  it("names the connection's own kubecontext over the current one", () => {
    render(
      <ConnectionKubernetesContext
        rootValue={{ properties: { kubecontext: SELECTED } }}
        onRootChange={() => {}}
        apiBase="/api/v1"
        fetcher={fetcher}
      />,
    );

    expect(screen.getByRole("button", { name: new RegExp(SELECTED) })).toBeInTheDocument();
  });
});
