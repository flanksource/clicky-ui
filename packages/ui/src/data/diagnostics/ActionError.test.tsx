import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActionError } from "./ActionError";

describe("ActionError", () => {
  it("copies caller identity and server diagnostics while collapsed", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    try {
      render(<ActionError error={Object.assign(new Error("lookup failed"), {
        diagnostics: { message: "lookup failed", context: [["Status", "400"]], details: [{ label: "Response", value: "ambiguous source" }] },
      })} context={[["Review", "facet-reference-security-layers"]]} />);
      fireEvent.click(screen.getByRole("button", { name: "Copy error details" }));
      await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
      expect(writeText.mock.calls[0]?.[0]).toContain("Review: facet-reference-security-layers");
      expect(writeText.mock.calls[0]?.[0]).toContain("Status: 400");
      expect(writeText.mock.calls[0]?.[0]).toContain("ambiguous source");
      expect(screen.getByRole("alert").querySelector("details")).not.toHaveAttribute("open");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
