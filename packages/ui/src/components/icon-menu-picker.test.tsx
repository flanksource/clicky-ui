import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

  it("throws when the value is not one of the options", () => {
    // The selected value must always resolve to an option; a missing one is a
    // programming error and should fail loudly rather than render blank.
    const onError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <IconMenuPicker
          value={"green" as "light" | "dark"}
          onChange={() => {}}
          options={options}
          ariaLabel="Theme"
        />,
      ),
    ).toThrow(/value "green" not found/);
    onError.mockRestore();
  });
});

describe("IconMenuPicker menu", () => {
  function openMenu() {
    fireEvent.click(screen.getByRole("button", { name: "Theme" }));
  }

  it("is closed until the trigger is clicked, then exposes a radio menu", () => {
    render(
      <IconMenuPicker value="light" onChange={() => {}} options={options} ariaLabel="Theme" />,
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    openMenu();
    expect(screen.getByRole("menu", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(options.length);
  });

  it("marks the selected option with aria-checked", () => {
    render(
      <IconMenuPicker value="dark" onChange={() => {}} options={options} ariaLabel="Theme" />,
    );
    openMenu();
    expect(screen.getByRole("menuitemradio", { name: /Dark/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("menuitemradio", { name: /Light/ })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("calls onChange with the chosen value and closes the menu", () => {
    const onChange = vi.fn();
    render(
      <IconMenuPicker value="light" onChange={onChange} options={options} ariaLabel="Theme" />,
    );
    openMenu();
    fireEvent.click(screen.getByRole("menuitemradio", { name: /Dark/ }));
    expect(onChange).toHaveBeenCalledWith("dark");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render(
      <IconMenuPicker value="light" onChange={() => {}} options={options} ariaLabel="Theme" />,
    );
    openMenu();
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  // Portal + edge positioning. The flip/shift geometry needs a real browser, so
  // those assertions live in IconMenuPicker.stories.tsx (Storybook test runner).
  // Here we only verify the menu escapes its container via the body portal.
  it("renders the open menu in a body portal so a clipping ancestor cannot hide it", () => {
    render(
      <div data-testid="container" style={{ overflow: "hidden" }}>
        <IconMenuPicker value="light" onChange={() => {}} options={options} ariaLabel="Theme" />
      </div>,
    );
    openMenu();
    const menu = screen.getByRole("menu", { name: "Theme" });
    expect(screen.getByTestId("container").contains(menu)).toBe(false);
    expect(document.body.contains(menu)).toBe(true);
  });
});
