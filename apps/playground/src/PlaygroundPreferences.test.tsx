import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DensityProvider, ThemeProvider } from "@flanksource/clicky-ui";
import { PlaygroundPreferences } from "./PlaygroundPreferences";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

it("keeps preferences under the avatar and saves page reloads across menu openings", async () => {
  render(
    <ThemeProvider>
      <DensityProvider>
        <PlaygroundPreferences sourceDirty={false} />
      </DensityProvider>
    </ThemeProvider>,
  );
  expect(screen.queryByRole("combobox", { name: "Page reloads" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Preferences" }));
  const reloads = await screen.findByRole("combobox", { name: "Page reloads" });
  expect(screen.getByText("Theme", { exact: true })).toBeTruthy();
  expect(screen.getByText("Density", { exact: true })).toBeTruthy();
  fireEvent.change(reloads, { target: { value: "automatic" } });
  expect(localStorage.getItem("playground.page-reloads")).toBe("automatic");
  fireEvent.keyDown(document, { key: "Escape" });
  await waitFor(() =>
    expect(screen.queryByRole("combobox", { name: "Page reloads" })).toBeNull(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Preferences" }));
  expect(
    (
      (await screen.findByRole("combobox", {
        name: "Page reloads",
      })) as HTMLSelectElement
    ).value,
  ).toBe("automatic");
});

it("listens for source updates while the preferences menu is closed", async () => {
  const close = vi.fn();
  class Stream {
    onmessage: ((event: { data: string }) => void) | null = null;
    onopen = null;
    onerror = null;
    close = close;
  }
  const stream = new Stream();
  vi.stubGlobal(
    "EventSource",
    vi.fn(function () {
      return stream;
    }),
  );
  vi.stubGlobal("__PLAYGROUND_REVISION__", "original");
  const view = render(
    <ThemeProvider>
      <DensityProvider>
        <PlaygroundPreferences sourceDirty />
      </DensityProvider>
    </ThemeProvider>,
  );
  await waitFor(() => expect(stream.onmessage).toBeTypeOf("function"));
  fireEvent(window, new Event("focus"));
  stream.onmessage!({ data: JSON.stringify("updated") });
  fireEvent.click(screen.getByRole("button", { name: "Preferences" }));
  expect(
    await screen.findByRole("button", { name: "Updates available · Reload" }),
  ).toHaveProperty("disabled", true);
  view.unmount();
  expect(close).toHaveBeenCalledOnce();
});
