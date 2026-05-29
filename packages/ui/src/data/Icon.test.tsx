import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./Icon";
import { UiSearch } from "@flanksource/icons/ui";

describe("Icon", () => {
  it("uses a stable 1em box for plain imported icons by default", () => {
    const { container } = render(<Icon icon={UiSearch} />);

    const icon = container.querySelector("svg");
    expect(icon).toHaveAttribute("width", "1em");
    expect(icon).toHaveAttribute("height", "1em");
    expect(icon?.className.baseVal).toContain("inline-block");
    expect(icon?.className.baseVal).toContain("align-[-0.125em]");
  });

  it("keeps explicit dimensions when they are provided", () => {
    const { container } = render(
      <Icon icon={UiSearch} width={12} height={14} />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toHaveAttribute("width", "12");
    expect(icon).toHaveAttribute("height", "14");
  });
});
