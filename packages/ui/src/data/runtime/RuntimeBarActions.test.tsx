import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UiGearSix } from "../../icons";
import {
  RuntimeBarActions,
  type RuntimeBarAction,
} from "./RuntimeBarActions";

function fields(onSelect: () => void): RuntimeBarAction[] {
  return [
    {
      id: "permissions",
      label: "Permission posture",
      title: "Permission posture — Plan",
      caption: <span>Plan</span>,
      items: [
        { label: "Unspecified", onSelect },
        { label: "Plan", onSelect },
      ],
    },
    {
      id: "presets",
      label: "Presets",
      title: "Presets — Defaults",
      caption: <span>Presets · 1</span>,
      items: [{ label: "Defaults", onSelect }],
    },
  ];
}

const ADVANCED = {
  label: "Advanced",
  icon: UiGearSix,
  onSelect: () => {},
};

const kebab = () => screen.getByTitle("Runtime options");
const rootItems = () =>
  within(screen.getAllByRole("menu")[0]!)
    .getAllByRole("menuitem")
    .map((item) => item.textContent);

describe("RuntimeBarActions", () => {
  it("renders one segment per field inline, leaving the kebab holding only the always-collapsed entries", () => {
    render(<RuntimeBarActions fields={fields(vi.fn())} menu={[ADVANCED]} inline />);

    expect(screen.getByTitle("Permission posture — Plan")).toBeInTheDocument();
    expect(screen.getByTitle("Presets — Defaults")).toBeInTheDocument();

    fireEvent.click(kebab());

    expect(rootItems()).toEqual(["Advanced"]);
  });

  it("collapses every field into a flyout carrying the same items when there is no room", () => {
    const onSelect = vi.fn();
    render(
      <RuntimeBarActions
        fields={fields(onSelect)}
        menu={[ADVANCED]}
        inline={false}
      />,
    );

    expect(
      screen.queryByTitle("Permission posture — Plan"),
    ).not.toBeInTheDocument();

    fireEvent.click(kebab());
    expect(rootItems()).toEqual([
      "Permission posture",
      "Presets",
      "Advanced",
    ]);

    fireEvent.click(screen.getByRole("menuitem", { name: "Permission posture" }));
    const flyout = within(
      screen.getByRole("menu", { name: "Permission posture" }),
    );
    expect(flyout.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Unspecified",
      "Plan",
    ]);

    fireEvent.click(flyout.getByRole("menuitem", { name: "Plan" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when there are neither fields nor menu entries", () => {
    const { container } = render(<RuntimeBarActions fields={[]} menu={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    {
      mode: "fused onto the bar",
      standalone: false,
      classes: ["-ml-px", "-mt-px", "border-l", "border-t"],
      absent: "rounded-md",
    },
    {
      mode: "standalone",
      standalone: true,
      classes: ["rounded-md", "border", "border-input", "bg-background"],
      absent: "-ml-px",
    },
  ])("carries $mode chrome", ({ standalone, classes, absent }) => {
    const { container } = render(
      <RuntimeBarActions menu={[ADVANCED]} standalone={standalone} />,
    );

    const section = container.querySelector<HTMLElement>(
      "[data-runtime-bar-section=actions]",
    );
    expect(section).toHaveClass(...classes);
    expect(section).not.toHaveClass(absent);
  });
});
