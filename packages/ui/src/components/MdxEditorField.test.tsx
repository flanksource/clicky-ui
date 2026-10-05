import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MdxEditorField } from "./MdxEditorField";

describe("MdxEditorField parsing errors", () => {
  const invalid = "  <proposed_plan>\n# Plan\n</proposed_plan>\n";
  const corrected = "# Plan\n\n1. Fix the editor.";

  it("shows the import error and preserves the source for correction", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MdxEditorField value={invalid} onChange={onChange} />
    );

    expect(await screen.findByRole("alert", {}, { timeout: 10_000 })).toHaveTextContent(
      /parsing|markdown/i
    );
    expect(
      screen.getByRole("textbox", { name: "Markdown source" })
    ).toHaveValue(invalid);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox", { name: "Markdown source" }), {
      target: { value: corrected },
    });
    expect(onChange).toHaveBeenCalledWith(corrected);

    rerender(<MdxEditorField value={corrected} />);
    expect(screen.getByRole("textbox", { name: "Markdown source" })).toHaveValue(corrected);
    fireEvent.click(screen.getByRole("button", { name: "Retry rich text" }));
    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    );
    expect(
      await screen.findByRole("heading", { name: "Plan" })
    ).toBeInTheDocument();
    expect(screen.getByText("Fix the editor.")).toBeInTheDocument();
  });

  it("clears a previous import error when the caller loads another document", async () => {
    const { rerender } = render(<MdxEditorField value={invalid} />);
    await screen.findByRole("alert");

    rerender(<MdxEditorField value={corrected} />);

    expect(await screen.findByRole("heading", { name: "Plan" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("reports invalid Markdown received after a valid document was loaded", async () => {
    const { rerender } = render(<MdxEditorField value={corrected} />);
    await screen.findByRole("heading", { name: "Plan" });

    rerender(<MdxEditorField value={invalid} readOnly />);

    await screen.findByRole("alert");
    const source = screen.getByRole("textbox", { name: "Markdown source" });
    expect(source).toHaveValue(invalid);
    expect(source).toBeDisabled();
  });
});
