import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  SecretKeySelector,
  type KeyPreview,
  type SecretKind,
  type SecretResource,
} from "./SecretKeySelector";

const RESOURCES: Record<SecretKind, SecretResource[]> = {
  secret: [{ name: "db", keys: ["host", "password"] }],
  configmap: [{ name: "app", keys: ["url"] }],
};
const PREVIEWS: KeyPreview[] = [
  { key: "host", value: "sql-••••.com" },
  { key: "password", value: "••••" },
];

const loadResources = (kind: SecretKind) => Promise.resolve(RESOURCES[kind]);
const loadKeyPreview = () => Promise.resolve(PREVIEWS);

describe("SecretKeySelector", () => {
  it("lists the secret's keys with their masked preview as the label", async () => {
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "" }}
        onChange={vi.fn()}
        loadResources={loadResources}
        loadKeyPreview={loadKeyPreview}
      />,
    );
    // The key combobox is the second one; open it and assert the masked label.
    const inputs = screen.getAllByRole("combobox");
    fireEvent.focus(inputs[1]);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /host — sql-••••\.com/ })).toBeInTheDocument(),
    );
  });

  it("switches kind via the toggle and resets the selection", async () => {
    const onChange = vi.fn();
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "host" }}
        onChange={onChange}
        loadResources={loadResources}
        loadKeyPreview={loadKeyPreview}
      />,
    );
    // Let the initial async loads settle before interacting, so the toggle's
    // state update isn't racing the effect resolution.
    await waitFor(() => expect(screen.getByRole("button", { name: /Secret/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /ConfigMap/ }));
    expect(onChange).toHaveBeenCalledWith({ kind: "configmap", name: "", key: "" });
  });

  it("emits the chosen key for the selected resource", async () => {
    const onChange = vi.fn();
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "" }}
        onChange={onChange}
        loadResources={loadResources}
        loadKeyPreview={loadKeyPreview}
      />,
    );
    const inputs = screen.getAllByRole("combobox");
    fireEvent.focus(inputs[1]);
    const option = await screen.findByRole("option", { name: /^password/ });
    fireEvent.mouseDown(option);
    expect(onChange).toHaveBeenCalledWith({ kind: "secret", name: "db", key: "password" });
  });
});

describe("SecretKeySelector literal value", () => {
  it("does not offer the Value toggle unless allowLiteral is set", () => {
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "" }}
        onChange={vi.fn()}
        loadResources={loadResources}
        loadKeyPreview={loadKeyPreview}
      />,
    );
    expect(screen.queryByRole("button", { name: /Value/ })).not.toBeInTheDocument();
  });

  it("switches to literal mode and emits a value-kind value", async () => {
    const onChange = vi.fn();
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "host" }}
        allowLiteral
        onChange={onChange}
        loadResources={loadResources}
        loadKeyPreview={loadKeyPreview}
      />,
    );
    await waitFor(() => expect(screen.getByRole("button", { name: /^Value/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /^Value/ }));
    expect(onChange).toHaveBeenCalledWith({ kind: "value", value: "" });
  });

  it("renders a text input in literal mode and emits typed text", () => {
    const onChange = vi.fn();
    render(
      <SecretKeySelector
        value={{ kind: "value", value: "prod-host" }}
        allowLiteral
        onChange={onChange}
        loadResources={loadResources}
        loadKeyPreview={loadKeyPreview}
      />,
    );
    // No comboboxes in literal mode — just the static-value text input.
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    const input = screen.getByPlaceholderText("Static value…") as HTMLInputElement;
    expect(input.value).toBe("prod-host");
    fireEvent.change(input, { target: { value: "new-host" } });
    expect(onChange).toHaveBeenCalledWith({ kind: "value", value: "new-host" });
  });
});

describe("SecretKeySelector strict mode", () => {
  it("flags a name that names no loaded resource", async () => {
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "ghost", key: "" }}
        strict
        onChange={vi.fn()}
        loadResources={loadResources}
        loadKeyPreview={loadKeyPreview}
      />,
    );
    // The first combobox is the name; it must go invalid once resources load.
    await waitFor(() =>
      expect(screen.getAllByRole("combobox")[0]).toHaveAttribute("aria-invalid", "true"),
    );
  });

  it("flags a key absent from the resolved resource's keys", async () => {
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "ghost-key" }}
        strict
        onChange={vi.fn()}
        loadResources={loadResources}
        loadKeyPreview={loadKeyPreview}
      />,
    );
    // Name resolves (db exists) so only the key combobox (second) is invalid.
    await waitFor(() =>
      expect(screen.getAllByRole("combobox")[1]).toHaveAttribute("aria-invalid", "true"),
    );
    expect(screen.getAllByRole("combobox")[0]).not.toHaveAttribute("aria-invalid");
  });

  it("accepts a name+key that both exist", async () => {
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "db", key: "password" }}
        strict
        onChange={vi.fn()}
        loadResources={loadResources}
        loadKeyPreview={loadKeyPreview}
      />,
    );
    await waitFor(() => expect(screen.getAllByRole("combobox")).toHaveLength(2));
    expect(screen.getAllByRole("combobox")[0]).not.toHaveAttribute("aria-invalid");
    expect(screen.getAllByRole("combobox")[1]).not.toHaveAttribute("aria-invalid");
  });

  it("never flags when strict is off", async () => {
    render(
      <SecretKeySelector
        value={{ kind: "secret", name: "ghost", key: "ghost-key" }}
        onChange={vi.fn()}
        loadResources={loadResources}
        loadKeyPreview={loadKeyPreview}
      />,
    );
    await waitFor(() => expect(screen.getAllByRole("combobox")).toHaveLength(2));
    expect(screen.getAllByRole("combobox")[0]).not.toHaveAttribute("aria-invalid");
    expect(screen.getAllByRole("combobox")[1]).not.toHaveAttribute("aria-invalid");
  });
});
