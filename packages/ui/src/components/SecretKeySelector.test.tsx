import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
const SERVICE_ACCOUNTS: SecretResource[] = [{ name: "reader" }, { name: "writer" }];

const loadResources = (kind: SecretKind) => Promise.resolve(RESOURCES[kind]);
const loadKeyPreview = () => Promise.resolve(PREVIEWS);
const loadServiceAccounts = () => Promise.resolve(SERVICE_ACCOUNTS);

// The source picker is a Combobox with the accessible name "Secret value source".
const sourceInput = () => screen.getByRole("combobox", { name: "Secret value source" });
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
  it("wraps responsively while keeping the resource and key fields together", async () => {
    const { container } = render(
      <SecretKeySelector value={{ kind: "secret", name: "db", key: "host" }} {...baseProps()} />,
    );

    const fields = container.querySelector('[data-slot="secret-reference-fields"]')!;
    await waitFor(() =>
      expect(fields.querySelectorAll('[role="combobox"]')).toHaveLength(2),
    );
    expect(container.firstElementChild).toHaveClass("flex-wrap");
    expect(fields).toHaveClass("grid");
  });

  it("renders the source picker as a combobox, not a radio group", () => {
    render(<SecretKeySelector value={{ kind: "value", value: "" }} {...baseProps()} />);
    expect(sourceInput()).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("lists the secret's keys with their masked preview as the label", async () => {
    const { container } = render(
      <SecretKeySelector value={{ kind: "secret", name: "db", key: "" }} {...baseProps()} />,
    );
    const fields = container.querySelector('[data-slot="secret-reference-fields"]')!;
    const keyInput = within(fields).getAllByRole("combobox")[1];
    fireEvent.focus(keyInput);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /host — sql-••••\.com/ })).toBeInTheDocument(),
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
    expect(onChange).toHaveBeenCalledWith({ kind: "configmap", name: "", key: "" });
  });

  it("emits the chosen key for the selected resource", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "" }}
        {...baseProps({ onChange })}
      />,
    );
    const fields = container.querySelector('[data-slot="secret-reference-fields"]')!;
    fireEvent.focus(within(fields).getAllByRole("combobox")[1]);
    const option = await screen.findByRole("option", { name: /^password/ });
    fireEvent.mouseDown(option);
    expect(onChange).toHaveBeenCalledWith({ kind: "secret", name: "db", key: "password" });
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
    const field = container.querySelector('[data-slot="secret-serviceaccount-field"]')!;
    expect(field).toBeInTheDocument();
    // A single field (no key column) fed by loadServiceAccounts.
    const input = within(field).getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.mouseDown(await screen.findByRole("option", { name: "writer" }));
    expect(onChange).toHaveBeenCalledWith({ kind: "serviceaccount", name: "writer" });
  });
});

describe("SecretKeySelector 1Password", () => {
  it("renders a single op:// reference input and emits an onepassword value", () => {
    const onChange = vi.fn();
    render(
      <SecretKeySelector
        value={{ kind: "onepassword", ref: "" }}
        sources={["secret", "onepassword"]}
        {...baseProps({ onChange })}
      />,
    );
    const input = screen.getByPlaceholderText("op://vault/item/field") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "op://prod/db/password" } });
    expect(onChange).toHaveBeenCalledWith({ kind: "onepassword", ref: "op://prod/db/password" });
  });
});

describe("SecretKeySelector literal value", () => {
  it("offers the Value source by default", () => {
    render(<SecretKeySelector value={{ kind: "value", value: "" }} {...baseProps()} />);
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
    await waitFor(() => expect(screen.getByRole("option", { name: /Secret/ })).toBeInTheDocument());
    expect(screen.queryByRole("option", { name: /Value/ })).not.toBeInTheDocument();
  });

  it("renders a text input in literal mode and emits typed text", () => {
    const onChange = vi.fn();
    render(
      <SecretKeySelector
        value={{ kind: "value", value: "prod-host" }}
        {...baseProps({ onChange })}
      />,
    );
    const input = screen.getByPlaceholderText("Static value…") as HTMLInputElement;
    expect(input.value).toBe("prod-host");
    fireEvent.change(input, { target: { value: "new-host" } });
    expect(onChange).toHaveBeenCalledWith({ kind: "value", value: "new-host" });
  });
});

describe("SecretKeySelector strict mode", () => {
  function referenceComboboxes() {
    const fields = document.querySelector('[data-slot="secret-reference-fields"]')!;
    return within(fields as HTMLElement).getAllByRole("combobox");
  }

  it("flags a name that names no loaded resource", async () => {
    render(
      <SecretKeySelector value={{ kind: "secret", name: "ghost", key: "" }} strict {...baseProps()} />,
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
