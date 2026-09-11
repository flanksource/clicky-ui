import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProfileFieldSidebarList } from "./profileFieldList";
import { useProfileFieldState } from "./profileFieldState";
import type { ProfileColumn } from "../wizard/profileWizardModel";

const discovered: ProfileColumn[] = [
  { name: "created_at", type: "datetime" },
  { name: "body", type: "string" },
];

function SidebarProbe({
  configured,
  onConfiguredChange = () => undefined,
}: {
  configured: ProfileColumn[];
  onConfiguredChange?: (columns: ProfileColumn[]) => void;
}) {
  const state = useProfileFieldState({
    discovered,
    configured,
    activeName: "created_at",
    onConfiguredChange,
    onActiveNameChange: () => undefined,
  });
  return <ProfileFieldSidebarList state={state} />;
}

describe("ProfileFieldSidebarList", () => {
  it("keeps its compact search and filters together on one row", () => {
    render(
      <SidebarProbe
        configured={[
          { name: "created_at", type: "datetime" },
          { name: "body", type: "string" },
        ]}
      />,
    );

    const search = screen.getByRole("searchbox", { name: "Search fields" });
    const filters = search.closest("[data-profile-field-filters]");

    expect(filters).toHaveAttribute("data-profile-field-filters", "compact");
    expect(filters).toContainElement(
      screen.getByRole("combobox", { name: "Filter by field type" }),
    );
    expect(filters).toContainElement(
      screen.getByRole("combobox", { name: "Filter by selection" }),
    );
    expect(search).toHaveClass("h-7");
  });

  it("leaves the field name on the row and moves type and actions into its menu", () => {
    render(
      <SidebarProbe
        configured={[
          { name: "created_at", type: "datetime" },
          { name: "body", type: "string" },
        ]}
      />,
    );

    const name = screen.getByRole("button", { name: "created_at" });
    expect(name.querySelector("svg")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Hide created_at" }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "More actions for created_at" }),
    );

    const menu = screen.getByRole("menu", {
      name: "More actions for created_at",
    });
    expect(within(menu).getByText("datetime type")).toBeInTheDocument();
    expect(
      within(menu).getByRole("menuitem", { name: "Hide column" }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole("menuitem", { name: "Disable filtering" }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole("menuitem", { name: "Remove column" }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
  });

  it("writes visibility changes selected from the row menu", () => {
    const onConfiguredChange = vi.fn();
    render(
      <SidebarProbe
        configured={[{ name: "created_at", type: "datetime" }]}
        onConfiguredChange={onConfiguredChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "More actions for created_at" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Hide column" }));

    expect(onConfiguredChange).toHaveBeenLastCalledWith([
      { name: "created_at", type: "datetime", hidden: true },
    ]);
  });
});
