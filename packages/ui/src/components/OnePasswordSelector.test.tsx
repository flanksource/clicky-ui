import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OnePasswordSelector } from "./OnePasswordSelector";

const loadVaults = vi.fn(async () => [
  { id: "vault-prod", name: "Production" },
]);
const loadItems = vi.fn(async () => [
  { id: "item-database", name: "Database" },
]);
const loadFields = vi.fn(async () => [
  {
    id: "password",
    label: "Password",
    reference: "op://Production/Database/password",
  },
]);

async function choose(name: string, option: string) {
  fireEvent.focus(screen.getByRole("combobox", { name }));
  const choice = await screen.findByRole("option", { name: option });
  await act(async () => fireEvent.mouseDown(choice));
}

describe("OnePasswordSelector", () => {
  it("loads vaults, items, and fields before emitting the canonical reference", async () => {
    const onChange = vi.fn();
    render(
      <OnePasswordSelector
        value=""
        onChange={onChange}
        loadVaults={loadVaults}
        loadItems={loadItems}
        loadFields={loadFields}
        allowCustomValue
      />,
    );

    await choose("1Password vault", "Production");
    await waitFor(() => expect(loadItems).toHaveBeenCalledWith("vault-prod"));
    await choose("1Password item", "Database");
    await waitFor(() =>
      expect(loadFields).toHaveBeenCalledWith("vault-prod", "item-database"),
    );
    await choose("1Password field", "Password");

    expect(onChange).toHaveBeenLastCalledWith(
      "op://Production/Database/password",
    );
  });

  it("surfaces catalog failures without replacing the selector", async () => {
    render(
      <OnePasswordSelector
        value=""
        onChange={() => {}}
        loadVaults={async () => {
          throw new Error("1Password is not authenticated");
        }}
        loadItems={loadItems}
        loadFields={loadFields}
        allowCustomValue
      />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "1Password is not authenticated",
    );
    expect(
      screen.getByRole("combobox", { name: "1Password vault" }),
    ).toBeInTheDocument();
  });
});
