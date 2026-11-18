import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PlaygroundNotifications } from "./PlaygroundNotifications";

vi.mock("@flanksource/clicky-ui", async (original) => ({
  ...(await original<typeof import("@flanksource/clicky-ui")>()),
  useRouter: () => ({ navigate: vi.fn() }),
}));
afterEach(cleanup);

it("reveals more results without closing and keeps each segment separate", () => {
  const pages = Array.from({ length: 18 }, (_, index) => ({
    key: `page-${index}`,
    label: `Page ${index}`,
    to: `?page=${index}`,
  }));
  const external = [
    { key: "external", label: "External capture", to: "?page=external" },
  ];
  const markdown = [{ key: "markdown", label: "Guide.md", to: "?page=guide" }];
  render(
    <PlaygroundNotifications
      review={{ active: false, count: 0, onToggle: vi.fn() }}
      recent={{
        label: "Recent",
        items: [...pages, ...external, ...markdown],
        groups: [
          { key: "pages", label: "Pages", items: pages },
          { key: "external", label: "External", items: external },
          { key: "markdown", label: "Markdown", items: markdown },
        ],
      }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
  expect(screen.queryByRole("button", { name: "Page 8" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Show more (10)" }));
  expect(screen.getByRole("button", { name: "Page 15" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Show more (2)" }));
  expect(screen.getByRole("button", { name: "Page 17" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /^Show more/ })).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: "Markdown" }));
  expect(screen.getByRole("button", { name: "Guide.md" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Page 0" })).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: "External" }));
  expect(screen.getByRole("button", { name: "External capture" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Guide.md" })).toBeNull();
});
