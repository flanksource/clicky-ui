import { describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  SecretKeySelector,
  type KeyPreview,
  type SecretKind,
  type SecretResource,
} from "./SecretKeySelector";
import { parseSecretRef, serializeSecretRef } from "./SecretKeySelector.model";

const RESOURCES: Record<SecretKind, SecretResource[]> = {
  secret: [{ name: "db", keys: ["host", "password"] }],
  configmap: [{ name: "app", keys: ["url"] }],
  helm: [{ name: "mysql", keys: ["auth.password"] }],
};
const PREVIEWS: KeyPreview[] = [
  { key: "host", value: "sql-••••.com" },
  { key: "password", value: "••••" },
];
const SERVICE_ACCOUNTS: SecretResource[] = [
  { name: "reader" },
  { name: "writer" },
];

const loadResources = (kind: SecretKind) => Promise.resolve(RESOURCES[kind]);
const loadKeyPreview = () => Promise.resolve(PREVIEWS);
const loadServiceAccounts = () => Promise.resolve(SERVICE_ACCOUNTS);

// The wide source picker is a Combobox with the accessible name "Secret value source".
const sourceInput = () =>
  screen.getByRole("combobox", { name: "Secret value source" });
const compactSourceButton = () =>
  screen.getByRole("button", { name: "Secret value source" });
function chooseSource(name: RegExp) {
  fireEvent.focus(sourceInput());
  fireEvent.mouseDown(screen.getByRole("option", { name }));
}

function baseProps(overrides = {}) {
  return {
    onChange: vi.fn(),
    loadResources,
    loadKeyPreview,
    ...overrides,
  };
}

describe("SecretKeySelector references", () => {
  it("stacks long reference fields in narrow containers while preserving hover text", async () => {
    const { container } = render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "host" }}
        {...baseProps()}
      />,
    );

    const selector = container.querySelector(
      '[data-slot="secret-key-selector"]',
    )!;
    const row = container.querySelector('[data-slot="secret-fields"]')!;
    const fields = container.querySelector(
      '[data-slot="secret-reference-fields"]',
    )!;
    await waitFor(() =>
      expect(fields.querySelectorAll('[role="combobox"]')).toHaveLength(2),
    );
    expect(selector).toHaveClass("@container/secret", "w-full", "min-w-0");
    expect(selector).not.toHaveClass("w-fit");
    expect(row).toHaveClass(
      "flex",
      "w-full",
      "max-w-full",
      "min-w-0",
      "flex-nowrap",
    );
    expect(row).not.toHaveClass("w-fit", "flex-wrap");
    expect(
      container.querySelector('[data-slot="secret-source-combobox"]'),
    ).toHaveClass(
      "max-w-full",
      "min-w-0",
      "basis-40",
      "shrink",
      "grow-0",
    );
    expect(fields).toHaveClass(
      "flex",
      "max-w-full",
      "min-w-0",
      "shrink",
      "grow",
      "flex-col",
      "@min-[22rem]/secret:flex-row",
    );
    expect(fields).not.toHaveClass("grid", "w-fit", "flex-1", "flex-nowrap");
    expect(
      container.querySelector('[data-slot="secret-resource-field"]'),
    ).toHaveClass(
      "max-w-full",
      "min-w-0",
      "basis-auto",
      "@min-[22rem]/secret:basis-40",
      "shrink",
      "grow-0",
      "w-full",
    );
    expect(
      container.querySelector('[data-slot="secret-key-field"]'),
    ).toHaveClass(
      "max-w-full",
      "min-w-0",
      "basis-auto",
      "@min-[22rem]/secret:basis-72",
      "shrink",
      "grow",
      "w-full",
    );
    await waitFor(() =>
      expect(within(fields).getAllByRole("combobox")[1]).toHaveAttribute(
        "title",
        "host — sql-••••.com",
      ),
    );
  });

  it("offers a labelled combobox and a container-compact icon menu for the source", () => {
    const { container } = render(
      <SecretKeySelector
        value={{ kind: "value", value: "" }}
        {...baseProps()}
      />,
    );
    expect(sourceInput()).toBeInTheDocument();
    expect(compactSourceButton()).toHaveAttribute(
      "title",
      "Secret value source: Value",
    );
    expect(
      container.querySelector('[data-slot="secret-source-combobox"]'),
    ).toHaveClass("@max-md:hidden");
    expect(
      container.querySelector('[data-slot="secret-source-menu"]'),
    ).toHaveClass("hidden", "@max-md:!block");
  });

  it("switches kind through the compact source menu and resets the selection", async () => {
    const onChange = vi.fn();
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "host" }}
        {...baseProps({ onChange })}
      />,
    );

    await waitFor(() => expect(sourceInput()).toBeInTheDocument());
    fireEvent.click(compactSourceButton());
    fireEvent.click(screen.getByRole("menuitemradio", { name: /ConfigMap/ }));
    expect(onChange).toHaveBeenCalledWith({
      kind: "configmap",
      name: "",
      key: "",
    });
  });

  it("lists the secret's keys with their masked preview as the label", async () => {
    const { container } = render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "" }}
        {...baseProps()}
      />,
    );
    const fields = container.querySelector(
      '[data-slot="secret-reference-fields"]',
    )!;
    const keyInput = within(fields).getAllByRole("combobox")[1];
    fireEvent.focus(keyInput);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /host — sql-••••\.com/ }),
      ).toBeInTheDocument(),
    );
  });

  it("switches kind via the source combobox and resets the selection", async () => {
    const onChange = vi.fn();
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "host" }}
        {...baseProps({ onChange })}
      />,
    );
    await waitFor(() => expect(sourceInput()).toBeInTheDocument());
    chooseSource(/ConfigMap/);
    expect(onChange).toHaveBeenCalledWith({
      kind: "configmap",
      name: "",
      key: "",
    });
  });

  it("emits the chosen key for the selected resource", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "" }}
        {...baseProps({ onChange })}
      />,
    );
    const fields = container.querySelector(
      '[data-slot="secret-reference-fields"]',
    )!;
    fireEvent.focus(within(fields).getAllByRole("combobox")[1]);
    const option = await screen.findByRole("option", { name: /^password/ });
    fireEvent.mouseDown(option);
    expect(onChange).toHaveBeenCalledWith({
      kind: "secret",
      name: "db",
      key: "password",
    });
  });

  it("hints jsonpath for the helm key field", async () => {
    render(
      <SecretKeySelector
        value={{ kind: "helm", name: "mysql", key: "" }}
        sources={["secret", "helm", "value"]}
        {...baseProps()}
      />,
    );
    await waitFor(() =>
      expect(screen.getByPlaceholderText("jsonpath…")).toBeInTheDocument(),
    );
  });
});

describe("SecretKeySelector service account", () => {
  it("renders a name-only field and emits a serviceaccount value", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <SecretKeySelector
        value={{ kind: "serviceaccount", name: "" }}
        sources={["secret", "serviceaccount"]}
        loadServiceAccounts={loadServiceAccounts}
        {...baseProps({ onChange })}
      />,
    );
    const field = container.querySelector(
      '[data-slot="secret-serviceaccount-field"]',
    )!;
    expect(field).toHaveClass(
      "max-w-full",
      "min-w-0",
      "basis-64",
      "shrink",
      "grow",
    );
    expect(field).not.toHaveClass("flex-1");
    // A single field (no key column) fed by loadServiceAccounts.
    const input = within(field).getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.mouseDown(await screen.findByRole("option", { name: "writer" }));
    expect(onChange).toHaveBeenCalledWith({
      kind: "serviceaccount",
      name: "writer",
    });
  });
});

describe("SecretKeySelector 1Password", () => {
  it("loads vault, item, and field metadata before emitting an onepassword value", async () => {
    const onChange = vi.fn();
    render(
      <SecretKeySelector
        value={{ kind: "onepassword", ref: "" }}
        sources={["secret", "onepassword"]}
        onePassword={{
          loadVaults: async () => [{ id: "vault-prod", name: "Production" }],
          loadItems: async () => [{ id: "item-db", name: "Database" }],
          loadFields: async () => [
            {
              id: "password",
              label: "Password",
              reference: "op://Production/Database/password",
            },
          ],
        }}
        {...baseProps({ onChange })}
      />,
    );

    fireEvent.focus(screen.getByRole("combobox", { name: "1Password vault" }));
    fireEvent.mouseDown(
      await screen.findByRole("option", { name: "Production" }),
    );
    fireEvent.focus(screen.getByRole("combobox", { name: "1Password item" }));
    fireEvent.mouseDown(
      await screen.findByRole("option", { name: "Database" }),
    );
    fireEvent.focus(screen.getByRole("combobox", { name: "1Password field" }));
    fireEvent.mouseDown(await screen.findByRole("option", { name: "Password" }));
    expect(onChange).toHaveBeenLastCalledWith({
      kind: "onepassword",
      ref: "op://Production/Database/password",
    });
  });
});

describe("SecretKeySelector literal value", () => {
  it("offers the Value source by default", () => {
    render(
      <SecretKeySelector
        value={{ kind: "value", value: "" }}
        {...baseProps()}
      />,
    );
    fireEvent.focus(sourceInput());
    expect(screen.getByRole("option", { name: /Value/ })).toBeInTheDocument();
  });

  it("drops the Value source when allowLiteral is false", async () => {
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "" }}
        allowLiteral={false}
        {...baseProps()}
      />,
    );
    fireEvent.focus(sourceInput());
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /Secret/ }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("option", { name: /Value/ }),
    ).not.toBeInTheDocument();
  });

  it("renders a text input in literal mode and emits typed text", () => {
    const onChange = vi.fn();
    const { container } = render(
      <SecretKeySelector
        value={{ kind: "value", value: "prod-host" }}
        {...baseProps({ onChange })}
      />,
    );
    expect(
      container.querySelector('[data-slot="secret-value-fields"]'),
    ).toHaveClass(
      "max-w-full",
      "min-w-0",
      "basis-64",
      "shrink",
      "grow",
    );
    expect(
      container.querySelector('[data-slot="secret-value-fields"]'),
    ).not.toHaveClass("flex-1");
    const input = screen.getByPlaceholderText(
      "Static value…",
    ) as HTMLInputElement;
    expect(input.value).toBe("prod-host");
    fireEvent.change(input, { target: { value: "new-host" } });
    expect(onChange).toHaveBeenCalledWith({ kind: "value", value: "new-host" });
  });
});

describe("SecretKeySelector strict mode", () => {
  function referenceComboboxes() {
    const fields = document.querySelector(
      '[data-slot="secret-reference-fields"]',
    )!;
    return within(fields as HTMLElement).getAllByRole("combobox");
  }

  it("flags a name that names no loaded resource", async () => {
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "ghost", key: "" }}
        strict
        {...baseProps()}
      />,
    );
    await waitFor(() =>
      expect(referenceComboboxes()[0]).toHaveAttribute("aria-invalid", "true"),
    );
  });

  it("flags a key absent from the resolved resource's keys", async () => {
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "ghost-key" }}
        strict
        {...baseProps()}
      />,
    );
    await waitFor(() =>
      expect(referenceComboboxes()[1]).toHaveAttribute("aria-invalid", "true"),
    );
    expect(referenceComboboxes()[0]).not.toHaveAttribute("aria-invalid");
  });

  it("accepts a name+key that both exist", async () => {
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "password" }}
        strict
        {...baseProps()}
      />,
    );
    await waitFor(() => expect(referenceComboboxes()).toHaveLength(2));
    expect(referenceComboboxes()[0]).not.toHaveAttribute("aria-invalid");
    expect(referenceComboboxes()[1]).not.toHaveAttribute("aria-invalid");
  });
});

describe("secret reference serialization", () => {
  it("round-trips every source through parse and serialize", () => {
    const cases: string[] = [
      "secret://db/password",
      "configmap://app/url",
      "helm://mysql/auth.password",
      "serviceaccount://reader",
      "op://prod/db/password",
    ];
    for (const raw of cases) {
      expect(serializeSecretRef(parseSecretRef(raw))).toBe(raw);
    }
  });

  it("treats an unrecognised string as a literal value", () => {
    expect(parseSecretRef("postgres://host/db")).toEqual({
      kind: "value",
      value: "postgres://host/db",
    });
  });

  it("serializes undefined and empty selections to an empty string", () => {
    expect(serializeSecretRef(undefined)).toBe("");
    expect(serializeSecretRef({ kind: "serviceaccount", name: "" })).toBe("");
  });
});
