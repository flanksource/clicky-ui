import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-density");
  });

  it("derives a two-letter fallback from a full name", () => {
    render(<Avatar alt="Chen, Nora" size="md" />);
    expect(screen.getByRole("img", { name: "Chen, Nora" })).toHaveTextContent("CN");
  });

  it("uses the provided initials and neutral group styling", () => {
    render(
      <Avatar
        alt="[CORP]\\Architecture Runway Team"
        initials="AR"
        kind="group"
        size="md"
        variant="duotone"
      />,
    );

    const avatar = screen.getByRole("img", { name: /Architecture Runway Team/ });
    expect(avatar).toHaveTextContent("AR");
    expect(avatar).toHaveAttribute("data-avatar-kind", "group");
    expect(avatar).toHaveAttribute("data-avatar-variant", "duotone");
    expect(avatar).toHaveStyle({ borderStyle: "dashed" });
  });

  it("renders path-like identities from their final segment", () => {
    render(<Avatar alt="flanksource/clicky-ui" rounded="md" size="md" variant="mono" />);
    expect(screen.getByRole("img", { name: "flanksource/clicky-ui" })).toHaveTextContent("CU");
  });

  it("renders a single initial at size=xs", () => {
    render(<Avatar alt="Chen, Nora" size="xs" />);
    expect(screen.getByRole("img", { name: "Chen, Nora" })).toHaveTextContent(/^C$/);
  });

  it("caps explicit initials to one character at size=xs", () => {
    render(<Avatar alt="Chen, Nora" initials="CN" size="xs" />);
    expect(screen.getByRole("img", { name: "Chen, Nora" })).toHaveTextContent(/^C$/);
  });

  it("renders a single initial at size=sm", () => {
    render(<Avatar alt="Chen, Nora" initials="CN" size="sm" />);
    expect(screen.getByRole("img", { name: "Chen, Nora" })).toHaveTextContent(/^C$/);
  });

  it("uses a lighter font weight at size=sm", () => {
    render(<Avatar alt="Chen, Nora" size="sm" />);
    expect(screen.getByRole("img", { name: "Chen, Nora" })).toHaveStyle({ fontWeight: "500" });
  });

  it("keeps the default weight at size=md and above", () => {
    render(<Avatar alt="Chen, Nora" size="md" />);
    expect(screen.getByRole("img", { name: "Chen, Nora" })).toHaveStyle({ fontWeight: "600" });
  });

  it("resolves size through density: compact shrinks xs to 14px", () => {
    document.documentElement.setAttribute("data-density", "compact");
    render(<Avatar alt="Chen, Nora" size="xs" />);
    expect(screen.getByRole("img", { name: "Chen, Nora" })).toHaveStyle({ width: "14px" });
  });

  it("resolves size through density: spacious grows lg to 48px", () => {
    document.documentElement.setAttribute("data-density", "spacious");
    render(<Avatar alt="Chen, Nora" size="lg" />);
    expect(screen.getByRole("img", { name: "Chen, Nora" })).toHaveStyle({ width: "48px" });
  });

  it("wraps the avatar in an external link when href is provided", () => {
    render(<Avatar alt="GitHub reviewers" href="https://github.com" initials="GH" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://github.com");
  });
});
