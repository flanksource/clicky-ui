import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccessMark } from "./AccessMark";
import { mergeAccess, type DataAccess } from "./data-access";

describe("AccessMark", () => {
  it.each<[DataAccess, string, string[]]>([
    ["read", "Read", ["read"]],
    ["write", "Written", ["write"]],
    ["readwrite", "Read and written", ["read", "write"]],
  ])("names %s access %j and draws one icon per kind of access", (access, name, icons) => {
    render(<AccessMark access={access} />);
    const mark = screen.getByRole("img", { name });
    expect({
      title: mark.getAttribute("title"),
      access: mark.getAttribute("data-access"),
      icons: [...mark.querySelectorAll("[data-access-icon]")].map((icon) => icon.getAttribute("data-access-icon")),
    }).toEqual({ title: name, access, icons });
  });

  it("keeps the host's class", () => {
    render(<AccessMark access="read" className="ml-auto" />);
    expect(screen.getByRole("img", { name: "Read" }).className).toContain("ml-auto");
  });
});

describe("mergeAccess", () => {
  it.each<[DataAccess | undefined, DataAccess, DataAccess]>([
    [undefined, "read", "read"],
    [undefined, "write", "write"],
    ["read", "read", "read"],
    ["write", "write", "write"],
    ["read", "write", "readwrite"],
    ["write", "read", "readwrite"],
    ["readwrite", "read", "readwrite"],
    ["write", "readwrite", "readwrite"],
  ])("merges %s with %s into %s", (held, next, merged) => {
    expect(mergeAccess(held, next)).toBe(merged);
  });
});
