import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CompileDiagnostic, JvmCompilation } from "../protocol/types";
import { CompileDiagnosticsList } from "./CompileDiagnosticsList";

const ERROR: CompileDiagnostic = { kind: "ERROR", line: 17, column: 9, message: "incompatible types: java.lang.String cannot be converted to double" };
const WARNING: CompileDiagnostic = { kind: "WARNING", line: 1, column: 1, message: "[deprecation] Order.load(String) in Order has been deprecated" };

function renderList(compilation: JvmCompilation | null, props: Partial<Parameters<typeof CompileDiagnosticsList>[0]> = {}) {
  return render(<CompileDiagnosticsList compilation={compilation} {...props} />);
}

describe("CompileDiagnosticsList", () => {
  it("renders nothing before a compile has run", () => {
    const { container } = renderList(null);
    expect(container).toBeEmptyDOMElement();
  });

  it("says a clean compile is not applied yet", () => {
    renderList({ success: true, diagnostics: [] });
    expect(screen.getByText("Compiles cleanly. Not applied yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Compiler diagnostics" })).toBeNull();
  });

  it("counts warnings on a successful compile and lists them with their position", () => {
    renderList({ success: true, diagnostics: [WARNING] });
    expect(screen.getByText("Compiles with 1 warning. Not applied yet.")).toBeInTheDocument();
    const [row] = within(screen.getByRole("list", { name: "Compiler diagnostics" })).getAllByRole("listitem");
    expect(row).toHaveTextContent("1:1");
    expect(row).toHaveTextContent("WARNING");
    expect(row).toHaveTextContent(WARNING.message);
  });

  it("reports failed compiles by error count, ignoring warnings in the count", () => {
    renderList({ success: false, diagnostics: [ERROR, WARNING, { ...ERROR, line: 20 }] });
    expect(screen.getByText("Compilation failed with 2 errors.")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("pluralises a single error", () => {
    renderList({ success: false, diagnostics: [ERROR] });
    expect(screen.getByText("Compilation failed with 1 error.")).toBeInTheDocument();
  });

  it("does not hide a failed compile that carried no diagnostics", () => {
    renderList({ success: false, diagnostics: [] });
    expect(screen.getByText("Compilation failed and the compiler reported no diagnostics.")).toBeInTheDocument();
  });

  it("shows a dash for a diagnostic with no source position", () => {
    renderList({ success: false, diagnostics: [{ kind: "ERROR", line: -1, column: -1, message: "no source position" }] });
    expect(screen.getByRole("listitem")).toHaveTextContent("—");
  });

  it("replaces the banner text once the patch was applied, keeping the warnings listed", () => {
    renderList({ success: true, diagnostics: [WARNING], applied: true }, { appliedMessage: "Patch applied. The original bytecode is restored in 15 minutes." });
    expect(screen.getByText("Patch applied. The original bytecode is restored in 15 minutes.")).toBeInTheDocument();
    expect(screen.queryByText(/Not applied yet/)).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("jumps to a diagnostic's line when the host handles it", () => {
    const onSelectDiagnostic = vi.fn();
    renderList({ success: false, diagnostics: [ERROR] }, { onSelectDiagnostic });
    fireEvent.click(screen.getByRole("button", { name: /17:9/ }));
    expect(onSelectDiagnostic).toHaveBeenCalledWith(ERROR);
  });

  it("renders rows as plain text without a jump handler", () => {
    renderList({ success: false, diagnostics: [ERROR] });
    expect(screen.queryByRole("button")).toBeNull();
  });
});
