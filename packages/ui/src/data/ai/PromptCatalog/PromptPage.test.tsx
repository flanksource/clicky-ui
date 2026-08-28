import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  PromptSpecDetail,
  PromptSpecSavePayload,
} from "../PromptPicker/types";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import { PromptPage } from "./PromptPage";
import type {
  PromptCatalogEntry,
  PromptCatalogLayer,
  PromptPageAdapter,
} from "./types";

vi.mock("../SpecRuntimeEditor", () => ({
  SpecRuntimeEditor: ({
    value,
    onChange,
    sections,
    effectiveBackend,
    effectiveModel,
    readOnly,
    promptVariant,
    defaultCollapsedSections,
  }: {
    value: AISpecRuntimeValue;
    onChange: (value: AISpecRuntimeValue) => void;
    sections?: readonly string[] | undefined;
    effectiveBackend?: string | undefined;
    effectiveModel?: string | undefined;
    readOnly?: boolean | undefined;
    promptVariant?: string | undefined;
    defaultCollapsedSections?: readonly string[] | undefined;
  }) => (
    <div
      data-testid="spec-runtime-editor"
      data-sections={sections?.join(",")}
      data-effective-backend={effectiveBackend}
      data-effective-model={effectiveModel}
      data-read-only={String(Boolean(readOnly))}
      data-prompt-variant={promptVariant}
      data-collapsed-sections={defaultCollapsedSections?.join(",")}
    >
      {sections?.includes("prompt") ? (
        <>
          <textarea
            aria-label={
              promptVariant === "document"
                ? "Prompt document body"
                : "User override"
            }
            value={value.prompt?.user ?? ""}
            readOnly={readOnly}
            onChange={(event) =>
              onChange({
                ...value,
                prompt: { ...value.prompt, user: event.currentTarget.value },
              })
            }
          />
          <textarea
            aria-label="System"
            value={value.prompt?.system ?? ""}
            readOnly
          />
          <textarea
            aria-label="Append system"
            value={value.prompt?.appendSystem ?? ""}
            readOnly
          />
        </>
      ) : null}
    </div>
  ),
}));
vi.mock("../../CodeBlock", () => ({
  CodeBlock: ({ source }: { source?: string | undefined }) => (
    <pre data-testid="code-block">{source}</pre>
  ),
}));
vi.mock("../../CodeDiff", () => ({
  CodeDiff: ({
    original,
    modified,
  }: {
    original?: string | undefined;
    modified?: string | undefined;
  }) => (
    <div data-testid="code-diff">{`${original ?? ""} → ${modified ?? ""}`}</div>
  ),
}));

const home: PromptCatalogLayer = {
  origin: "user-home",
  path: "/home/dev/.gavel.yaml",
  scope: "scope=global",
  editable: true,
  source: "inline",
  fields: ["model"],
};
const gitRoot: PromptCatalogLayer = {
  origin: "git-root",
  path: "/work/.gavel.yaml",
  editable: false,
  source: "none",
};
const project: PromptCatalogLayer = {
  origin: "target-directory",
  path: "/work/app/.gavel.yaml",
  scope: "project=app",
  editable: true,
  source: "none",
};

const DEFAULT_RAW = "---\nmodel: claude-sonnet\n---\nWrite {{diff}}.\n";
const HOME_RAW = "---\nmodel: claude-haiku\n---\nWrite {{diff}}.\n";

const entry: PromptCatalogEntry = {
  id: "commit.message",
  title: "Commit message",
  description: "Writes the commit subject and body",
  owner: "gavel",
  usedBy: ["gavel commit"],
  source: "inline",
  variables: ["diff"],
  version: "abc12345",
  defaultRaw: DEFAULT_RAW,
  effective: {
    model: "claude-haiku",
    backend: "claude-agent",
    modelSource: "operation",
  },
  provenance: { model: "user-home", body: "prompt default" },
  layers: [home, gitRoot, project],
};

function detailFor(layer: PromptCatalogLayer): PromptSpecDetail {
  if (layer.origin === "user-home") {
    return {
      id: entry.id,
      scope: "global",
      source: "inline",
      raw: HOME_RAW,
      spec: { model: "claude-haiku" },
      body: "Write {{diff}}.",
      version: "v-home",
    };
  }
  return {
    id: entry.id,
    scope: layer.scope,
    source: "default",
    raw: DEFAULT_RAW,
    spec: { model: "claude-sonnet" },
    body: "Write {{diff}}.",
    version: "v-default",
  };
}

type TestAdapter = PromptPageAdapter & {
  loadDetail: ReturnType<typeof vi.fn>;
  saveDetail: ReturnType<typeof vi.fn>;
  render: ReturnType<typeof vi.fn>;
};

function makeAdapter(): TestAdapter {
  return {
    loadDetail: vi.fn(
      async (_entry: PromptCatalogEntry, layer: PromptCatalogLayer) =>
        detailFor(layer),
    ),
    saveDetail: vi.fn(
      async (
        _entry: PromptCatalogEntry,
        layer: PromptCatalogLayer,
        payload: PromptSpecSavePayload,
      ) => {
        if (payload.source === "default") return detailFor(project);
        const raw =
          "raw" in payload
            ? payload.raw
            : `---\nmodel: ${String(payload.spec.model)}\n---\n${payload.body}\n`;
        return {
          id: entry.id,
          scope: layer.scope,
          source: payload.source,
          path: payload.path,
          raw,
          spec: { model: "saved" },
          body: "saved",
          version: "v-saved",
        } satisfies PromptSpecDetail;
      },
    ),
    render: vi.fn(
      async (
        _entry: PromptCatalogEntry,
        input: { raw?: string | undefined; variables: Record<string, unknown> },
      ) => ({
        user: `rendered:${input.raw ?? "saved"}:${JSON.stringify(input.variables)}`,
      }),
    ),
  };
}

async function renderPage(
  adapter: TestAdapter,
  props: Partial<Parameters<typeof PromptPage>[0]> = {},
) {
  const view = render(
    <PromptPage entry={entry} adapter={adapter} {...props} />,
  );
  await waitFor(() => expect(adapter.loadDetail).toHaveBeenCalled());
  await screen.findByRole("button", { name: "Save" });
  return view;
}

describe("PromptPage", () => {
  it("loads the effective layer and shows where the prompt runs from", async () => {
    const adapter = makeAdapter();
    await renderPage(adapter);

    expect(adapter.loadDetail).toHaveBeenCalledWith(entry, home);
    expect(
      screen.getByRole("button", { name: /Home \(~\/\.gavel\.yaml\)/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("effective")).toBeInTheDocument();
    expect(screen.getByTestId("spec-runtime-editor")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove override from this layer" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("uses the shared spec editor prompt fields", async () => {
    const adapter = makeAdapter();
    await renderPage(adapter);

    expect(screen.getByTestId("spec-runtime-editor")).toHaveAttribute(
      "data-sections",
      "prompt,model,permissions,environment,cli",
    );
    expect(screen.getByTestId("spec-runtime-editor")).toHaveAttribute(
      "data-effective-backend",
      "claude-agent",
    );
    expect(screen.getByTestId("spec-runtime-editor")).toHaveAttribute(
      "data-prompt-variant",
      "document",
    );
    expect(screen.getByTestId("spec-runtime-editor")).toHaveAttribute(
      "data-collapsed-sections",
      "model,permissions,environment",
    );
    expect(screen.getByLabelText("Prompt document body")).toHaveValue(
      "Write {{diff}}.",
    );
    expect(screen.getByLabelText("System")).toBeInTheDocument();
    expect(screen.getByLabelText("Append system")).toBeInTheDocument();
    expect(screen.queryByLabelText("Prompt body")).not.toBeInTheDocument();
  });

  it("saves a raw edit with the loaded document as the merge base", async () => {
    const adapter = makeAdapter();
    const onSaved = vi.fn();
    await renderPage(adapter, { onSaved });

    fireEvent.click(screen.getByText("Raw"));
    fireEvent.change(screen.getByLabelText("Prompt source"), {
      target: {
        value: "---\nmodel: claude-opus\n---\nWrite {{diff}} tersely.\n",
      },
    });
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(adapter.saveDetail).toHaveBeenCalledWith(entry, home, {
      source: "inline",
      path: undefined,
      raw: "---\nmodel: claude-opus\n---\nWrite {{diff}} tersely.\n",
      baseRaw: HOME_RAW,
    });
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("saves a structured edit as spec + body to a file path", async () => {
    const adapter = makeAdapter();
    await renderPage(adapter);

    fireEvent.change(screen.getByLabelText("Prompt document body"), {
      target: { value: "Write {{diff}} well." },
    });
    fireEvent.click(screen.getByText("File"));
    fireEvent.change(screen.getByLabelText("Prompt file path"), {
      target: { value: ".gavel/prompts/commit.prompt" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(adapter.saveDetail).toHaveBeenCalled());
    expect(adapter.saveDetail).toHaveBeenCalledWith(entry, home, {
      source: "file",
      path: ".gavel/prompts/commit.prompt",
      spec: { model: "claude-haiku" },
      body: "Write {{diff}} well.",
      baseRaw: HOME_RAW,
    });
  });

  it("shows a conflict banner with a reload when the layer moved on", async () => {
    const adapter = makeAdapter();
    adapter.saveDetail.mockRejectedValueOnce(
      new Error(
        "prompt commit.message changed since it was loaded (version a, now b); reload before saving",
      ),
    );
    await renderPage(adapter);

    fireEvent.click(screen.getByText("Raw"));
    fireEvent.change(screen.getByLabelText("Prompt source"), {
      target: { value: "changed" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const banner = await screen.findByRole("alert");
    expect(banner).toHaveTextContent("changed since it was loaded");
    fireEvent.click(
      screen.getAllByRole("button", { name: /Reload/ })[0] as HTMLElement,
    );
    expect(
      screen.getByRole("dialog", { name: "Discard unsaved prompt changes?" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    await waitFor(() => expect(adapter.loadDetail).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("removes the layer's override after an inline confirmation", async () => {
    const adapter = makeAdapter();
    await renderPage(adapter);

    fireEvent.click(
      screen.getByRole("button", { name: "Remove override from this layer" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(adapter.saveDetail).toHaveBeenCalledWith(entry, home, {
        source: "default",
        baseRaw: HOME_RAW,
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", {
          name: "Remove override from this layer",
        }),
      ).not.toBeInTheDocument(),
    );
  });

  it("renders a preview through the adapter, using the draft when dirty", async () => {
    const adapter = makeAdapter();
    await renderPage(adapter);

    fireEvent.click(screen.getByText("Preview"));
    fireEvent.change(screen.getByLabelText("Preview variables"), {
      target: { value: '{"diff": "one line"}' },
    });
    fireEvent.click(screen.getByRole("button", { name: /Render/ }));

    await waitFor(() =>
      expect(screen.getByTestId("code-block")).toHaveTextContent(
        'rendered:saved:{"diff":"one line"}',
      ),
    );
    expect(adapter.render).toHaveBeenCalledWith(entry, {
      raw: undefined,
      variables: { diff: "one line" },
    });
  });

  it("diffs the current document against the built-in default", async () => {
    const adapter = makeAdapter();
    await renderPage(adapter);

    fireEvent.click(screen.getByText("Diff vs default"));

    expect(screen.getByTestId("code-diff").textContent).toBe(
      `${DEFAULT_RAW} → ${HOME_RAW}`,
    );
  });

  it("shows a read-only banner for a layer the host cannot edit", async () => {
    const adapter = makeAdapter();
    await renderPage(adapter);

    fireEvent.click(screen.getByRole("button", { name: /Repository root/ }));

    await waitFor(() =>
      expect(adapter.loadDetail).toHaveBeenCalledWith(entry, gitRoot),
    );
    expect(await screen.findByRole("note")).toHaveTextContent(
      "/work/.gavel.yaml",
    );
    expect(screen.getByRole("radio", { name: "Structured" })).toBeChecked();
    expect(screen.getByTestId("spec-runtime-editor")).toHaveAttribute(
      "data-read-only",
      "true",
    );
    expect(screen.getByLabelText("Prompt document body")).toHaveAttribute(
      "readonly",
    );
    expect(
      screen.queryByRole("button", { name: "Save" }),
    ).not.toBeInTheDocument();
  });

  it("confirms before switching layers while the page has pending changes", async () => {
    const adapter = makeAdapter();
    await renderPage(adapter);

    fireEvent.change(screen.getByLabelText("Prompt document body"), {
      target: { value: "edited" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Project directory/ }));

    expect(
      screen.getByRole("dialog", { name: "Discard unsaved prompt changes?" }),
    ).toBeInTheDocument();
    expect(adapter.loadDetail).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    await waitFor(() => expect(adapter.loadDetail).toHaveBeenCalledTimes(2));
    expect(adapter.loadDetail).toHaveBeenLastCalledWith(entry, project);
  });

  it("treats destination-only changes as pending and saveable", async () => {
    const adapter = makeAdapter();
    await renderPage(adapter);

    fireEvent.click(screen.getByRole("radio", { name: "File" }));

    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: /Project directory/ }));
    expect(
      screen.getByRole("dialog", { name: "Discard unsaved prompt changes?" }),
    ).toBeInTheDocument();
    expect(adapter.loadDetail).toHaveBeenCalledTimes(1);
  });

  it("confirms before Back and Reload discard pending changes", async () => {
    const adapter = makeAdapter();
    const onBack = vi.fn();
    await renderPage(adapter, { onBack });

    fireEvent.change(screen.getByLabelText("Prompt document body"), {
      target: { value: "edited" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Back to prompts" }));

    expect(onBack).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(screen.getByLabelText("Prompt document body")).toHaveValue("edited");

    fireEvent.click(screen.getByRole("button", { name: "Reload" }));
    expect(adapter.loadDetail).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));

    await waitFor(() => expect(adapter.loadDetail).toHaveBeenCalledTimes(2));
    expect(screen.getByLabelText("Prompt document body")).toHaveValue(
      "Write {{diff}}.",
    );
  });
});
