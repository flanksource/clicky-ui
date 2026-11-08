import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DocumentForm, DocumentRichEditor } from "./DocumentEditor";

vi.mock("./MonacoEditor", () => ({ MonacoEditor: () => null }));
vi.mock("../mdx-editor", () => ({
  MdxEditorField: ({
    value,
    onChange,
    images,
  }: {
    value: string;
    onChange: (value: string) => void;
    images?: { imagePreviewHandler?: (source: string) => Promise<string> };
  }) => {
    const [resolved, setResolved] = useState("");
    const source = /!\[[^\]]*\]\(([^)]+)\)/.exec(value)?.[1] ?? "";
    useEffect(() => {
      void images?.imagePreviewHandler?.(source).then(setResolved);
    }, [images?.imagePreviewHandler, source]);
    return (
      <>
        <img alt="Embedded" src={resolved} />
        <textarea aria-label="Rich body" value={value} onChange={(event) => onChange(event.target.value)} />
      </>
    );
  },
}));

const SCHEMA = { type: "object", properties: { name: { type: "string" }, replicas: { type: "number" } } } as const;

describe("DocumentForm", () => {
  it("round-trips a form edit into the yaml source, keeping the rest of the document", () => {
    const onChange = vi.fn();
    render(<DocumentForm path="config.yaml" value={"# deployment\nname: web\nreplicas: 2\n"} onChange={onChange} schema={SCHEMA} />);

    fireEvent.change(screen.getByRole("textbox", { name: /name/ }), { target: { value: "api" } });

    expect(onChange.mock.calls).toEqual([["# deployment\nname: api\nreplicas: 2\n"]]);
  });

  it("wraps a non-object root so it can be edited, and writes the edit back as that root", () => {
    const onChange = vi.fn();
    render(<DocumentForm path="title.json" value={'"web"'} onChange={onChange} schema={{ type: "string" }} />);

    fireEvent.change(screen.getByDisplayValue("web"), { target: { value: "api" } });

    expect(onChange.mock.calls.map(([source]) => JSON.parse(source as string))).toEqual(["api"]);
  });

  it("shows the parse error and calls nothing when the source is not a valid document", () => {
    const onChange = vi.fn();
    render(<DocumentForm path="config.json" value="{" onChange={onChange} schema={SCHEMA} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("DocumentRichEditor", () => {
  it("edits only the body and writes it back after the untouched frontmatter", async () => {
    const onChange = vi.fn();
    const frontmatter = "---\ntitle: Guide\n---\n";
    render(<DocumentRichEditor path="guide.md" value={`${frontmatter}# Guide\n`} onChange={onChange} />);

    const body = await screen.findByRole("textbox", { name: "Rich body" });
    expect(body).toHaveValue("# Guide\n");
    fireEvent.change(body, { target: { value: "# Edited\n" } });

    expect(onChange.mock.calls).toEqual([[`${frontmatter}# Edited\n`]]);
  });

  it("resolves a relative image through resolveImageUrl without changing the markdown", async () => {
    const onChange = vi.fn();
    render(
      <DocumentRichEditor
        path="guide.md"
        value={"![Embedded](img/a.png)\n"}
        onChange={onChange}
        resolveImageUrl={(src) => `/api/file/7/image?path=${encodeURIComponent(src)}`}
      />,
    );

    await waitFor(() => expect(screen.getByRole("img", { name: "Embedded" })).toHaveAttribute("src", "/api/file/7/image?path=img%2Fa.png"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("tells the reader to use Source when the frontmatter is not closed", () => {
    render(<DocumentRichEditor path="guide.md" value={"---\ntitle: Guide\n# Guide\n"} onChange={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Unclosed Markdown frontmatter");
  });
});
