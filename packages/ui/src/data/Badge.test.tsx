import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("defaults plain children-only badges to the legacy soft variant", () => {
    render(<Badge>draft</Badge>);

    const badge = screen.getByText("draft").parentElement;
    expect(badge?.className).toMatch(/bg-muted/);
  });

  it("keeps the legacy tone/count/children path working", () => {
    render(
      <Badge tone="danger" variant="solid" count={12} icon="codicon:error">
        errors
      </Badge>,
    );

    const badge = screen.getByText("errors").parentElement;
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(badge?.className).toMatch(/bg-red-500/);
    expect(document.querySelector("iconify-icon")).toBeInTheDocument();
  });

  it("defaults rich props to the metric layout", () => {
    const { container } = render(<Badge label="Latency" value="45ms" icon="lucide:activity" />);

    const badge = container.firstElementChild as HTMLElement | null;
    expect(screen.getByText("45ms")).toBeInTheDocument();
    expect(badge?.className).toMatch(/bg-muted\/60/);
  });

  it("renders semantic status badges", () => {
    const { container } = render(
      <Badge variant="status" status="success" label="Healthy" value="ready" icon="lucide:check" />,
    );

    const badge = container.firstElementChild as HTMLElement | null;
    expect(screen.getByText("ready")).toBeInTheDocument();
    expect(badge?.className).toMatch(/bg-emerald-500\/12/);
  });

  it("applies separate label and value classes for split badges", () => {
    render(
      <Badge
        variant="label"
        label="env"
        value="production"
        labelClassName="uppercase tracking-[0.03em]"
        valueClassName="font-mono"
      />,
    );

    expect(screen.getByText("env").parentElement?.className).toMatch(/uppercase/);
    expect(screen.getByText("production").parentElement?.className).toMatch(/font-mono/);
  });

  it("renders links with a safe default rel for new tabs", () => {
    render(
      <Badge
        variant="outlined"
        label="Docs"
        href="https://flanksource.com"
        target="_blank"
        borderColor="#326ce5"
        textColor="#326ce5"
      />,
    );

    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("wraps long values cleanly inside a constrained badge", () => {
    const { container } = render(
      <Badge
        variant="label"
        label="image"
        value="ghcr.io/flanksource/platform/incident-commander:v1.4.200-build.12"
        size="xxs"
        shape="square"
        wrap
        maxWidth={20}
      />,
    );

    const badge = container.firstElementChild as HTMLElement | null;
    const value = screen.getByText(
      "ghcr.io/flanksource/platform/incident-commander:v1.4.200-build.12",
    );
    expect(badge?.style.maxWidth).toBe("20ch");
    expect(badge?.className).toMatch(/min-h-4/);
    expect(badge?.className).toMatch(/rounded-sm/);
    expect(badge?.className).not.toMatch(/flex-wrap/);
    expect(value.className).toMatch(/whitespace-normal/);
    expect(value).toHaveAttribute(
      "title",
      "ghcr.io/flanksource/platform/incident-commander:v1.4.200-build.12",
    );
  });

  it("supports prefix and suffix truncation", () => {
    render(
      <>
        <Badge
          variant="label"
          label="suffix"
          value="abcdefghijklmnop"
          maxWidth="8ch"
          truncate="suffix"
        />
        <Badge
          variant="label"
          label="prefix"
          value="abcdefghijklmnop"
          maxWidth="8ch"
          truncate="prefix"
        />
      </>,
    );

    const truncated = screen.getAllByTitle("abcdefghijklmnop");
    expect(truncated[0]?.textContent).toBe("abcdefg…");
    expect(truncated[1]?.textContent).toBe("…jklmnop");
  });

  it("supports semantic truncation styles", () => {
    render(
      <>
        <Badge
          variant="label"
          label="arn"
          value="arn:aws:eks:eu-west-1:123456789012:cluster/production-mission-control"
          maxWidth={20}
          truncate="arn"
        />
        <Badge
          variant="label"
          label="image"
          value="ghcr.io/flanksource/platform/mission-control-api:v2.4.1-build.17"
          maxWidth={20}
          truncate="image"
        />
        <Badge
          variant="label"
          label="path"
          value="/configs/production/platform/mission-control.yaml"
          maxWidth={20}
          truncate="path"
        />
        <Badge
          variant="label"
          label="url"
          value="https://console.flanksource.com/configs/production/mission-control.yaml?env=prod"
          maxWidth={20}
          truncate="url"
        />
        <Badge
          variant="label"
          label="auto"
          value="ghcr.io/flanksource/platform/mission-control-worker:v2.4.1-build.17"
          maxWidth={20}
          truncate="auto"
        />
      </>,
    );

    expect(
      screen.getByTitle("arn:aws:eks:eu-west-1:123456789012:cluster/production-mission-control")
        .textContent,
    ).toContain("mission-control");
    expect(
      screen.getByTitle("ghcr.io/flanksource/platform/mission-control-api:v2.4.1-build.17")
        .textContent,
    ).toContain("mission-control-api");
    expect(
      screen.getByTitle("/configs/production/platform/mission-control.yaml").textContent,
    ).toContain("/configs/");
    expect(
      screen.getByTitle("/configs/production/platform/mission-control.yaml").textContent,
    ).toContain("mission-control.yaml");
    expect(
      screen.getByTitle(
        "https://console.flanksource.com/configs/production/mission-control.yaml?env=prod",
      ).textContent,
    ).not.toContain("https://");
    expect(
      screen.getByTitle(
        "https://console.flanksource.com/configs/production/mission-control.yaml?env=prod",
      ).textContent,
    ).toContain("console.flanksource.com");
    expect(
      screen.getByTitle("ghcr.io/flanksource/platform/mission-control-worker:v2.4.1-build.17")
        .textContent,
    ).toContain("mission-control-worker");
  });

  it("copies the full value by default for non-link badges", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <Badge
        variant="label"
        label="path"
        value="/configs/production/platform/mission-control.yaml"
        maxWidth={20}
        truncate="path"
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(writeText).toHaveBeenCalledWith("/configs/production/platform/mission-control.yaml");
  });

  it("does not auto-copy linked badges by default", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <Badge
        variant="outlined"
        label="Docs"
        href="https://console.flanksource.com/configs/production/mission-control.yaml?env=prod"
        maxWidth={20}
        truncate="url"
      />,
    );

    expect(screen.getByRole("link")).toBeInTheDocument();
    expect(writeText).not.toHaveBeenCalled();
  });
});
