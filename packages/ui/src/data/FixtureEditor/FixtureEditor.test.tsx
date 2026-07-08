import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FixtureEditor } from "./FixtureEditor";
import { FixtureFenceCodeBlockEditor } from "./FixtureFenceCodeBlockEditor";
import { fixtureCodeBlockMatches } from "./fixture-code-block-model";
import type { FixtureFenceSchemas } from "./types";
import type { MdxEditorFieldProps } from "../../components/MdxEditorField";
import type { MdxEditorCodeBlockEditorContext } from "../../components/mdx-editor-options";

const mdxEditorCalls = vi.hoisted(() => ({
  props: [] as MdxEditorFieldProps[],
}));
const specRuntimeCalls = vi.hoisted(() => ({
  props: [] as Array<{
    value: Record<string, unknown>;
    onChange: (value: Record<string, unknown>) => void;
    sections?: readonly string[];
    showHeader?: boolean;
    beforeSections?: ReactNode;
    defaultCollapsedSections?: readonly string[];
  }>,
}));

vi.mock("../../components/MdxEditorField", () => ({
  MdxEditorField: (props: MdxEditorFieldProps) => {
    mdxEditorCalls.props.push(props);
    return (
      <textarea
        aria-label={props["aria-label"] ?? "Markdown"}
        disabled={props.readOnly || props.disabled}
        value={props.value}
        onChange={(event) => props.onChange?.(event.currentTarget.value)}
      />
    );
  },
}));

vi.mock("../ai/SpecRuntimeEditor", () => ({
  SpecRuntimeEditor: (props: {
    value: Record<string, unknown>;
    onChange: (value: Record<string, unknown>) => void;
    sections?: readonly string[];
    showHeader?: boolean;
    beforeSections?: ReactNode;
    defaultCollapsedSections?: readonly string[];
  }) => {
    specRuntimeCalls.props.push(props);
    return (
      <div data-testid="spec-runtime-editor">
        {props.beforeSections}
        <span>{String(props.value.model ?? "")}</span>
        <button
          type="button"
          onClick={() =>
            props.onChange({
              model: "gpt-5",
              temperature: 0.2,
              budget: { maxTokens: 8000 },
              noCache: true,
              prompt: { user: "Review the diff" },
              setup: {
                envVars: [{ name: "CAPTAIN_MODE", value: "verify" }],
              },
            })
          }
        >
          Set runtime
        </button>
      </div>
    );
  },
}));

const schemas: FixtureFenceSchemas = {
  test: {
    type: "object",
    properties: {
      name: { type: "string", title: "Name" },
      retries: { type: "integer", title: "Retries", multipleOf: 1 },
    },
  },
  lint: {
    type: "object",
    properties: {
      engine: { type: "string", title: "Engine" },
    },
  },
  ai: {
    type: "object",
    properties: {
      model: { type: "string", title: "Model" },
    },
  },
  exec: {
    type: "object",
    properties: {
      content: { type: "string", title: "Content", format: "textarea" },
      exitCode: { type: "integer", title: "Exit code", multipleOf: 1 },
      cel: { type: "string", title: "CEL", format: "textarea" },
    },
  },
};

describe("FixtureEditor", () => {
  beforeEach(() => {
    mdxEditorCalls.props.length = 0;
    specRuntimeCalls.props.length = 0;
  });

  it("renders the whole fixture as one markdown editor", () => {
    const changes: string[] = [];
    const value = [
      "# Verify",
      "",
      "- [ ] first",
      "",
      "```yaml test",
      "name: smoke",
      "```",
    ].join("\n");

    render(
      <FixtureEditor
        value={value}
        schemas={schemas}
        onChange={(next) => changes.push(next)}
      />,
    );

    const editor = screen.getByRole("textbox", { name: "Fixture markdown" });
    expect(editor).toHaveValue(value);
    expect(screen.queryByText("Fixture markdown")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Rich text and source mode over the full fixture"),
    ).not.toBeInTheDocument();
    expect(editor.closest("section")).toBeNull();
    expect(screen.queryByRole("textbox", { name: /markdown block/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /checklist markdown block/i })).not.toBeInTheDocument();

    fireEvent.change(editor, { target: { value: "next fixture" } });
    expect(changes.at(-1)).toBe("next fixture");
  });

  it("configures MDX rich/source editing and fixture code block descriptors", () => {
    render(<FixtureEditor value="" schemas={schemas} onChange={() => {}} />);

    const props = mdxEditorCalls.props.at(-1);
    expect(props).toMatchObject({
      headings: true,
      lists: true,
      markdownShortcuts: true,
      diffMode: { viewMode: "rich-text", viewModes: ["rich-text", "source"] },
    });

    const codeBlocks = props?.codeBlocks;
    expect(codeBlocks).toMatchObject({ defaultLanguage: "yaml" });
    expect(typeof codeBlocks).toBe("object");
    const descriptor =
      typeof codeBlocks === "object" ? codeBlocks.editorDescriptors?.[0] : undefined;

    expect(descriptor?.match("yaml", "test")).toBe(true);
    expect(descriptor?.match("yaml", "lint")).toBe(true);
    expect(descriptor?.match("test", "")).toBe(true);
    expect(descriptor?.match("lint", "")).toBe(true);
    expect(descriptor?.match("ai", "")).toBe(true);
    expect(descriptor?.match("prompt", "")).toBe(true);
    expect(descriptor?.match("exec", "")).toBe(true);
    expect(descriptor?.match("bash", "")).toBe(true);
  });

  it("matches schema-backed custom fixture fence infos", () => {
    expect(fixtureCodeBlockMatches("yaml", "test", schemas)).toBe(true);
    expect(fixtureCodeBlockMatches("yaml", "lint", schemas)).toBe(true);
    expect(fixtureCodeBlockMatches("test", "", schemas)).toBe(true);
    expect(fixtureCodeBlockMatches("lint", "", schemas)).toBe(true);
    expect(fixtureCodeBlockMatches("ai", "", schemas)).toBe(true);
    expect(fixtureCodeBlockMatches("prompt", "", schemas)).toBe(true);
    expect(fixtureCodeBlockMatches("yaml", "custom", { "yaml custom": { type: "object" } })).toBe(true);
    expect(fixtureCodeBlockMatches("test", "", { "yaml test": { type: "object" } })).toBe(true);
    expect(fixtureCodeBlockMatches("bash", "", schemas)).toBe(true);
  });

  it("edits a yaml fixture code block through JsonSchemaForm", () => {
    const context = createCodeBlockContext();

    render(
      <FixtureFenceCodeBlockEditor
        code={"name: smoke\nretries: 1\n"}
        language="yaml"
        meta="test"
        nodeKey="n1"
        focusEmitter={focusEmitter}
        context={context}
        schemas={schemas}
        readOnly={false}
        size="md"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand test" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "api" },
    });

    expect(context.setCode).toHaveBeenLastCalledWith(
      "name: api\nretries: 1\n",
    );
  });

  it("renders ai blocks as source cards even when an ai schema is provided", () => {
    const context = createCodeBlockContext();

    render(
      <FixtureFenceCodeBlockEditor
        code={"Focus on the failing assertion.\n"}
        language="ai"
        meta=""
        nodeKey="n1"
        focusEmitter={focusEmitter}
        context={context}
        schemas={schemas}
        readOnly={false}
        size="md"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand ai" }));
    expect(screen.queryByLabelText("Model")).not.toBeInTheDocument();
    expect(screen.queryByText("YAML error")).not.toBeInTheDocument();

    const source = screen.getByRole("textbox", { name: "ai source" });
    expect(source).toHaveValue("Focus on the failing assertion.\n");
    fireEvent.change(source, {
      target: { value: "Prefer deterministic checks.\n" },
    });

    expect(context.setCode).toHaveBeenLastCalledWith("Prefer deterministic checks.\n");
  });

  it("renders prompt blocks as source cards", () => {
    render(
      <FixtureFenceCodeBlockEditor
        code={"Review the fixture as one markdown document.\n"}
        language="prompt"
        meta=""
        nodeKey="n1"
        focusEmitter={focusEmitter}
        context={createCodeBlockContext()}
        schemas={schemas}
        readOnly={false}
        size="md"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand prompt" }));
    expect(screen.getByRole("textbox", { name: "prompt source" })).toHaveValue(
      "Review the fixture as one markdown document.\n",
    );
  });

  it("renders malformed yaml with an error badge and source panel", () => {
    render(
      <FixtureFenceCodeBlockEditor
        code={"name: [\n"}
        language="yaml"
        meta="test"
        nodeKey="n1"
        focusEmitter={focusEmitter}
        context={createCodeBlockContext()}
        schemas={schemas}
        readOnly={false}
        size="md"
      />,
    );

    expect(screen.getByText("YAML error")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand test" }));
    expect(screen.getAllByText("YAML error").length).toBeGreaterThan(0);
    expect(screen.getByRole("textbox", { name: "yaml test source" })).toHaveValue(
      "name: [\n",
    );
  });

  it("renders exec blocks as collapsed expandable cards", () => {
    render(
      <FixtureFenceCodeBlockEditor
        code={"pnpm test\n"}
        language="exec"
        meta=""
        nodeKey="n1"
        focusEmitter={focusEmitter}
        context={createCodeBlockContext()}
        schemas={{}}
        readOnly={false}
        size="md"
      />,
    );

    const expand = screen.getByRole("button", { name: "Expand exec" });
    expect(expand).toHaveAttribute("aria-expanded", "false");
    expect(expand.closest("section")).toHaveClass("w-full", "min-w-0", "max-w-[48rem]");
    expect(screen.queryByRole("textbox", { name: "exec source" })).not.toBeInTheDocument();

    fireEvent.click(expand);

    expect(expand).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("textbox", { name: "exec source" })).toHaveValue(
      "pnpm test\n",
    );
  });

  it("renders schema-backed bash blocks with content and expectation controls", () => {
    const context = createCodeBlockContext();

    render(
      <FixtureFenceCodeBlockEditor
        code={"pnpm test\n"}
        language="bash"
        meta=""
        nodeKey="n1"
        focusEmitter={focusEmitter}
        context={context}
        schemas={schemas}
        readOnly={false}
        size="sm"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand bash" }));
    expect(screen.getByLabelText("Exit code")).toBeInTheDocument();
    expect(screen.getByLabelText("CEL")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Content"), {
      target: { value: "pnpm test -- --runInBand\n" },
    });

    expect(context.setCode).toHaveBeenLastCalledWith("pnpm test -- --runInBand\n");

    fireEvent.change(screen.getByLabelText("Exit code"), {
      target: { value: "1" },
    });
    expect(context.setCode).toHaveBeenLastCalledWith(expect.stringContaining("content:"));
    expect(context.setCode).toHaveBeenLastCalledWith(expect.stringContaining("exitCode: 1"));
    expect(screen.getByRole("textbox", { name: "bash source" })).toHaveValue(
      "pnpm test\n",
    );
  });

  it("edits ai frontmatter without owning verify scoring", async () => {
    const changes: string[] = [];
    const value = [
      "---",
      "ai:",
      "  model: claude-code-sonnet",
      "  maxConcurrent: 4",
      "env:",
      "  EXISTING: keep",
      "verify:",
      "  threshold: 80",
      "---",
      "# Verify",
    ].join("\n");

    render(
      <FixtureEditor
        value={value}
        schemas={schemas}
        onChange={(next) => changes.push(next)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Frontmatter" }));

    expect(
      await screen.findByRole("dialog", { name: "Fixture frontmatter" }),
    ).toBeInTheDocument();
    expect(specRuntimeCalls.props.at(-1)?.sections).toEqual([
      "model",
      "prompt",
    ]);
    expect(specRuntimeCalls.props.at(-1)?.showHeader).toBe(false);
    expect(screen.getByTestId("spec-runtime-editor")).toHaveTextContent(
      "claude-code-sonnet",
    );
    expect(screen.queryByText("Verify scoring")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Threshold")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Set runtime" }));
    fireEvent.click(screen.getByRole("button", { name: "Save frontmatter" }));

    const next = changes.at(-1) ?? "";
    expect(next).toContain("ai:\n");
    expect(next).toContain("  model: gpt-5\n");
    expect(next).toContain("  maxTokens: 8000\n");
    expect(next).toContain("  maxConcurrent: 4\n");
    expect(next).toContain("  prompt:\n");
    expect(next).toContain("    user: Review the diff\n");
    expect(next).toContain("env:\n");
    expect(next).toContain("  CAPTAIN_MODE: verify\n");
    expect(next).toContain("verify:\n");
    expect(next).toContain("  threshold: 80\n");
    expect(next.endsWith("# Verify")).toBe(true);
  });

  it("constrains verification fixture frontmatter to prompt, environment, and optional model override", async () => {
    const changes: string[] = [];
    const value = ["---", "ai:", "  model: claude-code-sonnet", "---", "# Verify"].join("\n");

    render(
      <FixtureEditor
        value={value}
        schemas={schemas}
        frontmatterEditor={{ mode: "verification" }}
        onChange={(next) => changes.push(next)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Frontmatter" }));

    expect(
      await screen.findByRole("dialog", { name: "Fixture frontmatter" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "Verification model" }),
    ).toBeInTheDocument();
    expect(specRuntimeCalls.props.at(-1)?.sections).toEqual([
      "model",
      "prompt",
      "environment",
    ]);
    expect(specRuntimeCalls.props.at(-1)?.defaultCollapsedSections).toEqual([
      "environment",
    ]);

    fireEvent.click(screen.getByRole("radio", { name: "Use same model" }));
    expect(specRuntimeCalls.props.at(-1)?.sections).toEqual([
      "prompt",
      "environment",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Set runtime" }));
    fireEvent.click(screen.getByRole("button", { name: "Save frontmatter" }));

    const next = changes.at(-1) ?? "";
    expect(next).not.toContain("model: gpt-5");
    expect(next).not.toContain("maxTokens:");
    expect(next).toContain("  prompt:\n");
    expect(next).toContain("    user: Review the diff\n");
    expect(next).toContain("env:\n");
    expect(next).toContain("  CAPTAIN_MODE: verify\n");
    expect(next).not.toContain("verify:\n");
  });

  it("marks editable controls read-only when requested", () => {
    render(
      <FixtureEditor
        value={"Some prose"}
        schemas={{}}
        readOnly
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Fixture markdown" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /add fence/i })).not.toBeInTheDocument();
  });
});

const focusEmitter = {
  publish: () => {},
  subscribe: () => {},
};

function createCodeBlockContext(): MdxEditorCodeBlockEditorContext {
  return {
    setCode: vi.fn(),
    setLanguage: vi.fn(),
    setMeta: vi.fn(),
  };
}
