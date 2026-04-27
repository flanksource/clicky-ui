import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";
import { AvatarBadge } from "./AvatarBadge";

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

describe("AvatarBadge", () => {
  it("allows the badge label to grow to 40ch before truncating", () => {
    render(
      <AvatarBadge
        alt="Tokollo Mphahlele"
        initials="T"
        statusIcon="ph:check-thin"
        statusTone="emerald"
      />,
    );

    const label = screen.getByText("Tokollo Mphahlele");
    expect(label.parentElement).toHaveClass("max-w-[40ch]", "overflow-visible");
  });

  it("limits comments under the badge to 50ch and three lines", () => {
    render(
      <AvatarBadge
        alt="Tokollo Mphahlele"
        initials="T"
        comment="Approved after validating the deployment notes, linked change request, and release evidence."
      />,
    );

    const comment = screen.getByText(/Approved after validating/);
    expect(comment).toHaveClass("max-w-[50ch]", "[-webkit-line-clamp:3]");
  });
});
