import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AnnotationSurface } from "./AnnotationSurface";
import type { AnnotationCapture } from "./annotation-types";
afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});
it("opens an empty file composer and restores the rail after closing", async () => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1200);
  render(
    <AnnotationSurface
      documentKey="file-test"
      comments={[]}
      captures={{}}
      view="source"
      onCreate={vi.fn()}
    >
      <p>File</p>
    </AnnotationSurface>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Comment on file" }));
  await waitFor(() =>
    expect(screen.getByTestId("comment-compose-input")).toBeVisible(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Close", exact: true }));
  fireEvent.click(
    screen.getByRole("button", { name: "Open comments", exact: true }),
  );
  expect(screen.getByTestId("comment-compose-input")).toBeVisible();
});
it("captures a selected element without triggering its action or exposing agent controls", async () => {
  const action = vi.fn(),
    prepare = vi.fn(async (capture: AnnotationCapture) => capture);
  render(
    <AnnotationSurface
      documentKey="selection-test"
      comments={[]}
      captures={{}}
      view="form"
      onCreate={vi.fn()}
      onPrepareCapture={prepare}
    >
      <button onClick={action}>Example field</button>
    </AnnotationSurface>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Comment on element" }));
  fireEvent.click(screen.getByRole("button", { name: "Example field" }));
  await waitFor(() =>
    expect(prepare).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "dom",
        view: "form",
        html: expect.stringContaining("Example field"),
      }),
    ),
  );
  expect(action).not.toHaveBeenCalled();
  expect(screen.queryByText(/Send to agent|Run agent|Prompt…/)).toBeNull();
});
it("preserves capture metadata across remounts", async () => {
  const selection = {
    kind: "code-range",
    version: 1,
    view: "source",
    patch: {
      version: 1,
      startLine: 2,
      endLine: 2,
      before: ["a"],
      lines: ["b"],
      after: ["c"],
    },
  } as const;
  render(
    <AnnotationSurface
      documentKey="restore-test"
      comments={[]}
      captures={{}}
      view="source"
      onCreate={vi.fn()}
      selection={{
        ...selection,
        patch: {
          ...selection.patch,
          before: ["a"],
          lines: ["b"],
          after: ["c"],
        },
      }}
    >
      <p>Source</p>
    </AnnotationSurface>,
  );
  await waitFor(() =>
    expect(
      JSON.parse(sessionStorage.getItem("restore-test:capture")!),
    ).toMatchObject({ kind: "code-range", patch: { startLine: 2 } }),
  );
});
