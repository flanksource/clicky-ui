import { act, fireEvent, render, screen } from "@testing-library/react";
import { isValidElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import type { FieldControl, JsonSchemaObject } from "../components/json-schema-form-types";
import {
  connectionSchemaFormExtensions,
  connectionSecretLoaders,
  connectionSecretSources,
  type ConnectionJsonFetcher,
} from "./connectionSchemaFormExtensions";
import { mergeConnectionFormExtensions } from "./connectionsPageModel";

const API_BASE = "/uir/api/v1";
const BASE = `${API_BASE}/connections`;

const credentialSchema = (hints: Record<string, unknown> = {}): JsonSchemaObject => ({
  type: "object",
  ...hints,
  properties: {
    namespace: { type: "string", "x-clicky-component": "k8s-namespace-selector" },
    url: { type: "string", "x-clicky-component": "k8s-url-selector" },
    password: { type: "string", "x-clicky-component": "k8s-secret-selector" },
  },
});

function neverFetch(): never {
  throw new Error("this test must not request anything");
}

function field(overrides: Partial<FieldControl> & Pick<FieldControl, "schema">): FieldControl {
  return {
    key: "namespace",
    kind: "string",
    label: "Namespace",
    required: false,
    value: "",
    onChange: () => {},
    ...overrides,
  };
}

const nodes = { label: "label", value: "value" };

async function openSourceOptions(name: string): Promise<string[]> {
  const input = screen.getAllByRole("combobox", { name })[0]!;
  fireEvent.focus(input);
  const options = await screen.findAllByRole("option");
  const labels = options.map((option) => option.textContent ?? "");
  await act(async () => fireEvent.keyDown(input, { key: "Escape" }));
  return labels;
}

describe("connectionSecretSources", () => {
  it("defaults to every source for secrets and every source but serviceaccount for urls when the schema carries no hints", () => {
    expect(connectionSecretSources(credentialSchema())).toEqual({
      secretSources: ["secret", "configmap", "helm", "serviceaccount", "onepassword", "value"],
      urlSources: ["secret", "configmap", "helm", "onepassword", "value"],
    });
  });

  it("reads the root x-clicky-secret-sources and x-clicky-url-sources hints, omitting value when the policy omits it", () => {
    expect(
      connectionSecretSources(
        credentialSchema({
          "x-clicky-secret-sources": ["secret", "configmap", "helm"],
          "x-clicky-url-sources": ["secret"],
        }),
      ),
    ).toEqual({
      secretSources: ["secret", "configmap", "helm"],
      urlSources: ["secret"],
    });
  });

  it("takes one hint from the schema and defaults the other", () => {
    expect(
      connectionSecretSources(credentialSchema({ "x-clicky-url-sources": ["secret", "value"] })),
    ).toEqual({
      secretSources: ["secret", "configmap", "helm", "serviceaccount", "onepassword", "value"],
      urlSources: ["secret", "value"],
    });
  });

  it.each([
    ["a non-array", { "x-clicky-secret-sources": "secret" }, /x-clicky-secret-sources/],
    ["an empty list", { "x-clicky-url-sources": [] }, /x-clicky-url-sources/],
    ["an unknown source", { "x-clicky-secret-sources": ["secret", "vault"] }, /"vault"/],
  ])("fails loudly on %s", (_label, hints, message) => {
    expect(() => connectionSecretSources(credentialSchema(hints))).toThrow(message);
  });
});

describe("connectionSecretLoaders", () => {
  it("derives every loader URL from apiBase", async () => {
    const fetcher = vi.fn(async () => []);
    const loaders = connectionSecretLoaders({ apiBase: `${API_BASE}/`, fetcher: fetcher as ConnectionJsonFetcher });

    await loaders.loadResources("secret", "team a");
    await loaders.loadResources("configmap", "");
    await loaders.loadKeyPreview("helm", "rel/1", "prod");
    await loaders.loadServiceAccounts("prod");
    await loaders.loadOnePasswordVaults();
    await loaders.loadOnePasswordItems("vault 1");
    await loaders.loadOnePasswordFields("vault 1", "item/2");
    await loaders.loadWorkloads("prod", ["service", "ingress"]);

    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      `${BASE}/secrets?kind=secret&namespace=team%20a`,
      `${BASE}/secrets?kind=configmap`,
      `${BASE}/secrets/preview?kind=helm&name=rel%2F1&namespace=prod`,
      `${BASE}/secrets?kind=serviceaccount&namespace=prod`,
      `${BASE}/secrets/onepassword/vaults`,
      `${BASE}/secrets/onepassword/items?vault=vault%201`,
      `${BASE}/secrets/onepassword/fields?vault=vault%201&item=item%2F2`,
      `${BASE}/workloads?namespace=prod&kinds=service,ingress`,
    ]);
  });
});

describe("connectionSchemaFormExtensions", () => {
  const options = (schema: JsonSchemaObject) => ({
    apiBase: API_BASE,
    schema,
    fetcher: neverFetch as ConnectionJsonFetcher,
  });

  it("applies the namespace picker only to the namespace-selector hint", () => {
    const { post } = connectionSchemaFormExtensions(options(credentialSchema()));
    const wrap = (target: FieldControl) =>
      post.reduce((acc, extension) => extension(target, acc), nodes);

    const hinted = wrap(
      field({ schema: { type: "string", "x-clicky-component": "k8s-namespace-selector" } }),
    );
    expect(hinted.label).toBe("label");
    expect(isValidElement(hinted.value)).toBe(true);

    expect(wrap(field({ schema: { type: "string" } }))).toEqual(nodes);
    expect(
      wrap(field({ schema: { type: "string", "x-clicky-component": "k8s-other" } })),
    ).toEqual(nodes);
  });

  it("leaves a read-only namespace field as the plain display", () => {
    const { post } = connectionSchemaFormExtensions(options(credentialSchema()));
    const readOnly = field({
      readOnly: true,
      schema: { type: "string", "x-clicky-component": "k8s-namespace-selector" },
    });

    expect(post.reduce((acc, extension) => extension(readOnly, acc), nodes)).toEqual(nodes);
  });

  it("returns no pre extensions", () => {
    expect(connectionSchemaFormExtensions(options(credentialSchema())).pre).toEqual([]);
  });

  it("offers a credential field only the schema's secret sources", async () => {
    const schema = credentialSchema({
      "x-clicky-secret-sources": ["secret", "configmap", "helm"],
      "x-clicky-url-sources": ["secret"],
    });
    const extensions = connectionSchemaFormExtensions({
      ...options(schema),
      fetcher: (async () => []) as ConnectionJsonFetcher,
    });
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { password: schema.properties!.password! } }}
        value={{ password: "" }}
        onChange={() => {}}
        post={extensions.post}
      />,
    );

    expect(await openSourceOptions("Secret value source")).toEqual(["Secret", "ConfigMap", "Helm"]);
  });

  it("leaves hoisted address fields beside the URL rather than repeating them in the properties group", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        url: { type: "string", title: "Database URL", "x-clicky-order": 2 },
        properties: {
          type: "object",
          title: "Properties",
          "x-clicky-order": 7,
          properties: {
            kubeconfig: { type: "string", title: "Kubeconfig file" },
            kubecontext: { type: "string", title: "Kubecontext" },
            host: { type: "string", title: "Host", "x-clicky-order": 2.1, "x-clicky-hoist": true },
            sslmode: { type: "string", title: "SSL mode" },
          },
        },
      },
    };
    const extensions = connectionSchemaFormExtensions({ apiBase: API_BASE, schema, fetcher: neverFetch });
    render(
      <JsonSchemaForm schema={schema} value={{}} onChange={() => {}} post={extensions.post} showPreferencesMenu={false} />,
    );

    expect(screen.getAllByText("Host")).toHaveLength(1);
    expect(screen.getByRole("region", { name: "Properties" })).toHaveTextContent("SSL mode");
    expect(screen.getByRole("region", { name: "Properties" })).not.toHaveTextContent("Host");
  });

  it("offers a credential field every source when the schema carries no hints", async () => {
    const schema = credentialSchema();
    const extensions = connectionSchemaFormExtensions({
      ...options(schema),
      fetcher: (async () => []) as ConnectionJsonFetcher,
    });
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { password: schema.properties!.password! } }}
        value={{ password: "" }}
        onChange={() => {}}
        post={extensions.post}
      />,
    );

    expect(await openSourceOptions("Secret value source")).toEqual([
      "Secret",
      "ConfigMap",
      "Helm",
      "Service Account",
      "1Password",
      "Value",
    ]);
  });
});

describe("mergeConnectionFormExtensions", () => {
  it("concatenates pre and post in argument order so defaults come first", () => {
    const pre = [vi.fn(), vi.fn()];
    const post = [vi.fn(), vi.fn(), vi.fn()];

    const merged = mergeConnectionFormExtensions(
      { pre: [pre[0]!], post: [post[0]!] },
      undefined,
      { pre: [pre[1]!], post: [post[1]!, post[2]!] },
    );

    expect(merged).toEqual({ pre, post });
  });
});
