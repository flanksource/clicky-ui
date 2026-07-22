import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskManagerButton } from "./TaskManagerButton";

describe("TaskManagerButton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows active count and follows each run href", async () => {
    vi.stubGlobal("EventSource", undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        id: "run-1",
        name: "Run tests",
        href: "/projects/acme?action=test&run=run-1",
        status: "running",
        total: 1,
        completed: 0,
        failed: 0,
        running: 1,
      }],
    }));
    const onNavigate = vi.fn();
    render(<TaskManagerButton basePath="/api" onNavigate={onNavigate} />);

    await waitFor(() => expect(screen.getByLabelText("Tasks (1 active)")).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText("Tasks (1 active)"));
    fireEvent.click(await screen.findByText("Run tests"));
    expect(onNavigate).toHaveBeenCalledWith("/projects/acme?action=test&run=run-1");
  });
});
