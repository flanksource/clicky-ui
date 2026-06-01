import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IconMenuPicker, type IconMenuOption } from "./icon-menu-picker";

const Sun = () => <span>sun-glyph</span>;
const Moon = () => <span>moon-glyph</span>;

const options: IconMenuOption<"light" | "dark">[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
];

describe("IconMenuPicker", () => {
  it("renders the ariaLabel and selected option's label on the trigger when showLabel is set", () => {
    render(
      <IconMenuPicker
        value="light"
        onChange={() => {}}
        options={options}
        ariaLabel="Theme"
        showLabel
      />,
    );

    expect(screen.getByRole("button", { name: "Theme" })).toHaveTextContent("Theme: Light");
  });

  it("does not render a label on the trigger by default", () => {
    render(
      <IconMenuPicker value="light" onChange={() => {}} options={options} ariaLabel="Theme" />,
    );

    expect(screen.getByRole("button", { name: "Theme" })).not.toHaveTextContent("Light");
  });
});
