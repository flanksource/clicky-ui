import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ArtifactSearch } from "./ArtifactSearch";
import { fetchNavigation } from "./api";
import type { NavigationResponse } from "./types";

vi.mock("./api", () => ({ fetchNavigation: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("ignores superseded responses and navigates through the supplied callback", async () => {
  const pending: Array<(response: NavigationResponse) => void> = [];
  vi.mocked(fetchNavigation).mockImplementation(
    () => new Promise((resolve) => pending.push(resolve)),
  );
  const onNavigate = vi.fn();
  render(<ArtifactSearch onNavigate={onNavigate} />);
  act(() => window.dispatchEvent(new Event("playground-search")));
  const input = screen.getByRole("combobox", { name: "Search artifacts" });
  fireEvent.change(input, { target: { value: "old" } });
  await waitFor(() => expect(pending).toHaveLength(1));
  fireEvent.change(input, { target: { value: "welcome" } });
  await waitFor(() => expect(pending).toHaveLength(2));
  expect(vi.mocked(fetchNavigation).mock.calls[0]?.[1]?.aborted).toBe(true);
  expect(vi.mocked(fetchNavigation).mock.calls[1]?.[0]).toMatchObject({
    age: "all",
    filters: [],
    q: "welcome",
  });
  const response = (slug: string): NavigationResponse => ({
    children: [
      {
        key: slug,
        kind: "page",
        label: slug,
        slug,
        source: "pages",
        hasChildren: false,
        activity: {
          updated: 0,
          commented: 0,
          resolved: 0,
          openCount: 0,
          resolvedCount: 0,
        },
      },
    ],
  });
  await act(async () => {
    pending[1]!(response("welcome"));
    pending[0]!(response("old"));
  });
  expect(screen.queryByRole("option", { name: /old/ })).toBeNull();
  fireEvent.click(screen.getByRole("option", { name: /welcome/ }));
  expect(onNavigate).toHaveBeenCalledWith("welcome");
});
