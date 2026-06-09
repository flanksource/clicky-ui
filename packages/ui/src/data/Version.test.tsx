import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Version } from "./Version";
import type { VersionInfo } from "./version-info";

const base: VersionInfo = {
  commit: "a1b2c3d",
  tag: "v1.2.3",
  date: "2026-06-09T07:30:00.000Z",
  dirty: false,
  mode: "production",
};

describe("Version", () => {
  it("renders tag, commit, and build date by default", () => {
    render(<Version info={base} />);
    expect(
      screen.getByText("v1.2.3 · a1b2c3d · 2026-06-09T07:30:00.000Z"),
    ).toBeInTheDocument();
  });

  it("hides fields toggled off", () => {
    render(<Version info={base} commit={false} date={false} />);
    expect(screen.getByText("v1.2.3")).toBeInTheDocument();
    expect(screen.queryByText(/a1b2c3d/)).not.toBeInTheDocument();
  });

  it("shows a dirty badge when the working tree is dirty", () => {
    render(<Version info={{ ...base, dirty: true }} />);
    expect(screen.getByText("dirty")).toBeInTheDocument();
  });

  it("shows a dev badge in Vite dev mode", () => {
    render(<Version info={{ ...base, mode: "dev" }} />);
    expect(screen.getByText("dev")).toBeInTheDocument();
  });

  it("shows a storybook badge inside Storybook", () => {
    render(<Version info={{ ...base, mode: "storybook" }} />);
    expect(screen.getByText("storybook")).toBeInTheDocument();
  });

  it("omits the status badge in production with a clean tree", () => {
    render(<Version info={base} />);
    expect(screen.queryByText("dirty")).not.toBeInTheDocument();
    expect(screen.queryByText("dev")).not.toBeInTheDocument();
    expect(screen.queryByText("storybook")).not.toBeInTheDocument();
  });

  it("renders the full ISO timestamp for the build date", () => {
    render(<Version info={{ ...base, tag: "", commit: "" }} />);
    expect(screen.getByText("2026-06-09T07:30:00.000Z")).toBeInTheDocument();
  });

  it("normalizes a non-UTC date to a full ISO (UTC) timestamp", () => {
    render(
      <Version info={{ ...base, tag: "", commit: "", date: "2026-06-09T09:30:00+02:00" }} />,
    );
    expect(screen.getByText("2026-06-09T07:30:00.000Z")).toBeInTheDocument();
  });

  it("preserves an unparseable date string verbatim", () => {
    render(<Version info={{ ...base, tag: "", commit: "", date: "not-a-date" }} />);
    expect(screen.getByText("not-a-date")).toBeInTheDocument();
  });
});
