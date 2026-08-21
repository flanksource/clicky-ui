import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CountryFlag } from "./CountryFlag";
import { CountryPicker } from "./CountryPicker";
import {
  COUNTRY_OPTIONS,
  getCountryOption,
  isCountryCode,
} from "./country-options";

describe("country options", () => {
  it("contains the 249 ISO alpha-2 countries in English label order", () => {
    const names = COUNTRY_OPTIONS.map(({ name }) => name);

    expect(COUNTRY_OPTIONS).toHaveLength(249);
    expect(new Set(COUNTRY_OPTIONS.map(({ code }) => code))).toHaveLength(249);
    expect(names).toEqual(
      [...names].sort((left, right) => left.localeCompare(right, "en")),
    );
    expect(getCountryOption("ZA")).toEqual({
      code: "ZA",
      name: "South Africa",
    });
  });

  it("rejects library extras, subdivisions, lowercase, and unknown codes", () => {
    expect(isCountryCode("ZA")).toBe(true);
    expect(isCountryCode("za")).toBe(false);
    expect(isCountryCode("EU")).toBe(false);
    expect(isCountryCode("GB-ENG")).toBe(false);
    expect(isCountryCode("ZZ")).toBe(false);
  });
});

describe("CountryFlag", () => {
  it("renders an accessible flag for a valid country", () => {
    render(<CountryFlag countryCode="ZA" />);

    expect(
      screen.getByRole("img", { name: "South Africa flag" }),
    ).toBeInTheDocument();
  });

  it("fails loudly for a non-country code", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      expect(() => render(<CountryFlag countryCode="EU" />)).toThrow(
        'CountryFlag received invalid ISO 3166-1 alpha-2 code "EU"',
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe("CountryPicker", () => {
  it("searches country names and emits the selected alpha-2 code", () => {
    const onChange = vi.fn();
    render(<CountryPicker value="" onChange={onChange} />);

    const input = screen.getByRole("combobox", { name: "Country" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "iceland" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: /Iceland.*IS/ }));

    expect(onChange).toHaveBeenCalledWith("IS");
  });

  it("searches alpha-2 codes and shows the flag in the selected value", () => {
    render(<CountryPicker value="ZA" onChange={vi.fn()} />);

    const input = screen.getByRole("combobox", { name: "Country" });
    expect(input).toHaveValue("South Africa · ZA");
    expect(
      input.parentElement?.querySelector('svg[aria-hidden="true"]'),
    ).not.toBeNull();

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "UY" } });
    expect(
      screen.getByRole("option", { name: /Uruguay.*UY/ }),
    ).toBeInTheDocument();
  });

  it("clears an optional country and marks an invalid controlled code", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CountryPicker value="ZA" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith("");

    rerender(<CountryPicker value="ZZ" onChange={onChange} />);
    expect(screen.getByRole("combobox", { name: "Country" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("does not expose freeform values as selectable countries", () => {
    const onChange = vi.fn();
    render(<CountryPicker value="" onChange={onChange} />);

    const input = screen.getByRole("combobox", { name: "Country" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Atlantis" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
  });
});
