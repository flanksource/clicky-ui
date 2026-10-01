import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RuntimeBar, type RuntimeBarValue } from "./RuntimeBar";

const VALUE: RuntimeBarValue = {
  mode: "agent",
  model: "anthropic/claude-sonnet-5",
  effort: "medium",
  budget: { timeout: "30m", cost: 2 },
};

afterEach(() => vi.restoreAllMocks());

describe.each(["segmented", "combo"] as const)(
  "RuntimeBar %s responsive layout",
  (variant) => {
    it("moves supplied settings into the menu on resize and restores them when space returns", () => {
      let width = 1000;
      vi.spyOn(
        HTMLElement.prototype,
        "getBoundingClientRect",
      ).mockImplementation(function () {
        const node = this as HTMLElement;
        const isContainer =
          node.classList.contains("relative") &&
          node.classList.contains("w-full");
        return {
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          bottom: 36,
          right: isContainer ? width : 80,
          height: 36,
          width: isContainer ? width : 80,
          toJSON: () => ({}),
        };
      });
      render(
        <RuntimeBar
          variant={variant}
          value={VALUE}
          onChange={vi.fn()}
          showTimeout
          showCost
          actions={{
            fields: ["Perms", "Source", "Commit"].map((label) => ({
              id: label,
              label,
              title: label,
              caption: label,
              isSet: true,
              items: [],
            })),
          }}
        />,
      );
      const bar = screen.getByRole("group", { name: "Runtime" });
      expect(within(bar).getByTitle("Timeout — 30m")).toBeInTheDocument();
      expect(within(bar).getByTitle("Budget — $2.00")).toBeInTheDocument();
      expect(
        Array.from(bar.querySelectorAll<HTMLButtonElement>("button")).map(
          (button) => button.title,
        ),
      ).toEqual([
        "Runtime mode — Agent",
        "Model — anthropic/claude-sonnet-5",
        "Reasoning effort",
        "Perms",
        "Source",
        "Commit",
        "Budget — $2.00",
        "Timeout — 30m",
        "Runtime options",
      ]);
      width = 180;
      fireEvent(window, new Event("resize"));
      expect(within(bar).queryByTitle("Timeout — 30m")).not.toBeInTheDocument();
      expect(
        within(bar).queryByTitle("Reasoning effort"),
      ).not.toBeInTheDocument();
      fireEvent.click(within(bar).getByTitle("Runtime options"));
      expect(
        within(screen.getByRole("menu", { name: "Runtime options" }))
          .getAllByRole("menuitem")
          .map((item) => item.textContent),
      ).toEqual(["Effort", "Perms", "Source", "Commit", "Budget", "Timeout"]);
      width = 1000;
      fireEvent(window, new Event("resize"));
      expect(within(bar).getByTitle("Timeout — 30m")).toBeInTheDocument();
      expect(within(bar).getByTitle("Budget — $2.00")).toBeInTheDocument();
      expect(within(bar).getByTitle("Reasoning effort")).toBeInTheDocument();
      expect(bar).toHaveClass("h-control-h");
      expect(bar).not.toHaveClass("flex-wrap");
    });

    it("retains the provider family name in the merged model caption for assistive technology", () => {
      render(<RuntimeBar variant={variant} value={VALUE} onChange={vi.fn()} />);
      expect(
        within(
          screen.getByTitle("Model — anthropic/claude-sonnet-5"),
        ).getByText("Claude"),
      ).toHaveClass("sr-only");
    });

    it("offers native settings and host actions through the same menu", () => {
      render(
        <RuntimeBar
          variant={variant}
          value={VALUE}
          onChange={vi.fn()}
          showTimeout
          showCost
          actions={{ menu: [{ label: "Advanced", onSelect: vi.fn() }] }}
        />,
      );
      fireEvent.click(screen.getByTitle("Runtime options"));
      expect(
        within(screen.getByRole("menu", { name: "Runtime options" }))
          .getAllByRole("menuitem")
          .map((item) => item.textContent),
      ).toEqual(["Effort", "Budget", "Timeout", "Advanced"]);
    });

    it("omits the settings menu when neither native settings nor host actions are exposed", () => {
      render(
        <RuntimeBar
          variant={variant}
          value={{ mode: "api" }}
          onChange={vi.fn()}
          showEffort={false}
        />,
      );
      expect(screen.queryByTitle("Runtime options")).not.toBeInTheDocument();
    });
  },
);
