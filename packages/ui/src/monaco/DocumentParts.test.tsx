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
    mdxSyntax,
  }: {
    value: string;
    onChange: (value: string) => void;
    images?: { imagePreviewHandler?: (source: string) => Promise<string> };
    mdxSyntax?: boolean;
  }) => {
    const [resolved, setResolved] = useState("");
    const source = /!\[[^\]]*\]\(([^)]+)\)/.exec(value)?.[1] ?? "";
    useEffect(() => {
      void images?.imagePreviewHandler?.(source).then(setResolved);
    }, [images?.imagePreviewHandler, source]);
    return (
      <>
        <img alt="Embedded" src={resolved} />
        <textarea
          aria-label="Rich body"
          data-mdx-syntax={String(mdxSyntax === true)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
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

  it("reports a value its schema cannot show in place of the form, and retries once the source changes", () => {
    // A compact string list throws on a non-string item, so a list of numbers cannot be shown.
    const schema = { type: "object", properties: { tags: { type: "array", items: { type: "string" }, "x-array-display": "list" } } } as const;
    const { rerender } = render(<DocumentForm path="checks.md" value={"---\ntags: [1]\n---\n"} onChange={vi.fn()} schema={schema} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Use Source to fix it");

    rerender(<DocumentForm path="checks.md" value={"---\ntags: [one]\n---\n"} onChange={vi.fn()} schema={schema} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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

  it.each([
    ["slide.mdx", "true"],
    ["SLIDE.MDX", "true"],
    ["guide.md", "false"],
  ])("parses %s with mdxSyntax=%s", async (path, expected) => {
    render(<DocumentRichEditor path={path} value={"# Slide\n"} onChange={vi.fn()} />);

    expect(await screen.findByRole("textbox", { name: "Rich body" })).toHaveAttribute("data-mdx-syntax", expected);
  });

  it("edits frontmatter in a Properties form above the body, keeping the body", async () => {
    const onChange = vi.fn();
    const schema = { type: "object", properties: { title: { type: "string" } } } as const;
    render(<DocumentRichEditor path="guide.md" value={"---\ntitle: Guide\n---\n# Guide\n"} onChange={onChange} frontmatterSchema={schema} />);

    expect(screen.getByText("Properties").closest("details")).toHaveAttribute("open");
    fireEvent.change(screen.getByRole("textbox", { name: /title/i }), { target: { value: "Handbook" } });

    expect(onChange.mock.calls).toEqual([["---\ntitle: Handbook\n---\n# Guide\n"]]);
    expect(await screen.findByRole("textbox", { name: "Rich body" })).toHaveValue("# Guide\n");
  });

  it("opens a frontmatter block from the Properties form on a page without one", () => {
    const onChange = vi.fn();
    const schema = { type: "object", properties: { title: { type: "string" } } } as const;
    render(<DocumentRichEditor path="guide.md" value={"# Guide\n"} onChange={onChange} frontmatterSchema={schema} />);

    fireEvent.change(screen.getByRole("textbox", { name: /title/i }), { target: { value: "Guide" } });

    expect(onChange.mock.calls).toEqual([["---\ntitle: Guide\n---\n# Guide\n"]]);
  });

  it("shows no Properties form without a frontmatter schema", async () => {
    render(<DocumentRichEditor path="guide.md" value={"# Guide\n"} onChange={vi.fn()} />);

    await screen.findByRole("textbox", { name: "Rich body" });
    expect(screen.queryByText("Properties")).not.toBeInTheDocument();
  });

  it("tells the reader to use Source when the frontmatter is not closed", () => {
    render(<DocumentRichEditor path="guide.md" value={"---\ntitle: Guide\n# Guide\n"} onChange={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Unclosed Markdown frontmatter");
  });
});
