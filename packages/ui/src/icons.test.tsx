import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  UiCalendar,
  UiCheck,
  UiClass,
  UiSearch,
  UiServerProcess,
  UiShieldCheck,
  getChangeIcon,
} from "./icons";

describe("generated icons", () => {
  it("exports representative icons from all copied groups", () => {
    render(
      <>
        <UiSearch title="search" />
        <UiCheck title="check" />
        <UiCalendar title="calendar" />
        <UiClass title="class" />
        <UiServerProcess title="server process" />
      </>,
    );

    expect(screen.getByRole("img", { name: "search" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "check" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "calendar" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "class" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "server process" }),
    ).toBeInTheDocument();
  });

  it("exports change icon aliases", () => {
    expect(getChangeIcon("CertificateRenewed")).toBe(UiShieldCheck);
    expect(getChangeIcon("missing")).toBeUndefined();
  });
});
