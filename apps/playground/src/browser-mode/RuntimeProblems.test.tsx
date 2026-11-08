import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { CompatibilityIssue } from "./project";
import { RuntimeProblems } from "./RuntimeProblems";

afterEach(cleanup);

const ISSUE: CompatibilityIssue = { blocking: true, class: "link", reason: "package entities is not allowed by dependency policy strict", fix: "", file: "oipa/product-lifecycle.tsx", line: 1 };

it("lets the user clear the page runtime cache and retry from a problem's actions", () => {
  const onClearCache = vi.fn();
  render(<RuntimeProblems issues={[ISSUE]} slug="oipa/product-lifecycle" policy="any" sources={{}} onFix={vi.fn()} onLink={vi.fn()} onInspect={vi.fn()} onClearCache={onClearCache} />);
  fireEvent.click(screen.getByRole("button", { name: "Problem actions" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Clear page runtime cache and try again" }));
  expect(onClearCache).toHaveBeenCalledTimes(1);
});
