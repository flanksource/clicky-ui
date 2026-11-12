import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DocumentEditor } from "./DocumentEditor";
vi.mock("./MonacoEditor", () => ({
  MonacoEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      aria-label="Source editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));
vi.mock("../mdx-editor", () => ({
  MdxEditorField: ({
    value,
    images,
  }: {
    value: string;
    images?: { imagePreviewHandler?: (source: string) => Promise<string> };
  }) => {
    const [resolved, setResolved] = useState("");
    const source = /!\[[^\]]*\]\(([^)]+)\)/.exec(value)?.[1] ?? "";
    useEffect(() => {
      void images?.imagePreviewHandler?.(source).then(setResolved);
    }, [images?.imagePreviewHandler, source]);
    return <img alt="Embedded" src={resolved} />;
  },
}));
describe("DocumentEditor", () => {
  it("resolves a relative image through resolveImageUrl in Rich text without changing the markdown", async () => {
    const onChange = vi.fn();
    const resolveImageUrl = vi.fn((src: string) => `/api/file/7/image?path=${encodeURIComponent(src)}`);
    render(
      <DocumentEditor
        path="guide.md"
        value={"# Guide\n\n![Embedded](img/a.png)\n"}
        onChange={onChange}
        resolveImageUrl={resolveImageUrl}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Rich text" }));
    await waitFor(() =>
      expect(screen.getByRole("img", { name: "Embedded" })).toHaveAttribute("src", "/api/file/7/image?path=img%2Fa.png"),
    );
    expect({ resolved: resolveImageUrl.mock.calls, saved: onChange.mock.calls }).toEqual({ resolved: [["img/a.png"]], saved: [] });
  });

  it("gives Rich text no image preview handler without resolveImageUrl", async () => {
    render(<DocumentEditor path="guide.md" value={"![Embedded](img/a.png)\n"} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Rich text" }));
    await waitFor(() => expect(screen.getByRole("img", { name: "Embedded" })).toBeInTheDocument());
    expect(screen.getByRole("img", { name: "Embedded" })).toHaveAttribute("src", "");
  });

  it("forwards object presentation options without collapsing the document root", () => {
    const onChange = vi.fn();
    render(<DocumentEditor path="config.json" value={'{"settings":{"name":"initial"}}'} onChange={onChange}
      formOptions={{ objectDisplay: "flat", persistPreferences: false }}
      schema={{ type: "object", title: "Document", properties: { settings: { type: "object", title: "Settings", properties: { name: { type: "string", title: "Name" } } } } }} />);
    fireEvent.click(screen.getByRole("button", { name: "Form" }));
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("initial");
    expect(screen.queryByRole("button", { name: "Document" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
  it("opens aliased YAML in a form without saving", () => {
    const onChange = vi.fn();
    render(
      <DocumentEditor
        path="config.yaml"
        value={"name: &name Example\nreused: *name\n"}
        onChange={onChange}
        schema={{
          type: "object",
          properties: { name: { type: "string" }, reused: { type: "string" } },
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Form" }));
    expect(screen.getByRole("textbox", { name: /reused/ })).toHaveValue(
      "Example",
    );
    expect(onChange).not.toHaveBeenCalled();
  });
  it("opens a schema form without applying defaults or saving", () => {
    const onChange = vi.fn();
    render(
      <DocumentEditor
        path="config.json"
        value={'{"name":"initial"}'}
        onChange={onChange}
        schema={{
          type: "object",
          properties: {
            name: { type: "string" },
            enabled: { type: "boolean", default: true },
          },
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Form" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: /name/ })).toHaveValue(
      "initial",
    );
  });
  it("retains invalid source when form parsing fails", () => {
    const onChange = vi.fn();
    render(
      <DocumentEditor
        path="config.json"
        value="{"
        onChange={onChange}
        schema={{ type: "object" }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Form" }));
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Source" }));
    expect(screen.getByRole("textbox", { name: "Source editor" })).toHaveValue(
      "{",
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});
