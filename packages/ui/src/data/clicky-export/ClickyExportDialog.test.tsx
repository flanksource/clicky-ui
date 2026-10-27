import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClickyExportDialog } from "./ClickyExportDialog";

const formats = [
  { format: "csv", label: "CSV", description: "Comma-separated values" },
  { format: "pdf", label: "PDF", description: "Portable document" },
];

const scopes = [
  { scope: "page", label: "Current page" },
  {
    scope: "all",
    label: "All rows",
    note: (format: string) =>
      format === "pdf" ? "Limited to 1,000 rows" : "Streams rows as they are read",
  },
];

function renderDialog(
  onDownload: (request: { format: string; scope: string | undefined }) => Promise<void>,
) {
  render(
    <ClickyExportDialog
      open
      onClose={vi.fn()}
      formats={formats}
      scopes={scopes}
      onDownload={onDownload}
    />,
  );
  return screen.getByRole("dialog");
}

describe("ClickyExportDialog", () => {
	 it("shows pending progress and allows the caller to close while an export continues", async () => {
		const onClose = vi.fn();
		render(<ClickyExportDialog open onClose={onClose} formats={formats} scopes={scopes}
			pendingContent={<div>Rendering report</div>} allowCloseWhilePending
			onDownload={() => new Promise<void>(() => {})} />);
		fireEvent.click(screen.getByRole("button", { name: "Download" }));
		expect(await screen.findByText("Rendering report")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Continue in background" }));
		expect(onClose).toHaveBeenCalledOnce();
	});
  it("downloads the chosen format and range", async () => {
    const onDownload = vi.fn().mockResolvedValue(undefined);
    const dialog = renderDialog(onDownload);

    fireEvent.click(within(dialog).getByRole("radio", { name: "All rows" }));
    fireEvent.click(within(dialog).getByRole("radio", { name: "PDF" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Download" }));

    await waitFor(() =>
      expect(onDownload).toHaveBeenCalledWith({ format: "pdf", scope: "all" }),
    );
  });

  it("shows the cap that applies to the chosen range, not every range at once", () => {
    const dialog = renderDialog(vi.fn());

    // The current page has no ceiling to report; the all-rows walk does, and it
    // differs per format — which is exactly what a flat menu could not say.
    expect(
      within(dialog).queryByText("Limited to 1,000 rows"),
    ).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("radio", { name: "All rows" }));
    expect(within(dialog).getByText("Limited to 1,000 rows")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Streams rows as they are read"),
    ).toBeInTheDocument();
  });

  it("keeps the dialog open on a failed export and states why", async () => {
    const onDownload = vi
      .fn()
      .mockRejectedValue(new Error("snapshot expired"));
    const dialog = renderDialog(onDownload);

    fireEvent.click(within(dialog).getByRole("button", { name: "Download" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "snapshot expired",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
