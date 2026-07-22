import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import {
  PromptPickerField,
  promptPreviewText,
  promptRuntimeValueToPayload,
  specToPromptRuntimeValue,
  type InvalidPromptSpecDetail,
  type PromptSpecDetail,
  type PromptSpecSavePayload,
  type ValidPromptSpecDetail,
} from ".";

vi.mock("../SpecRuntimeEditor", () => ({
  SpecRuntimeEditor: ({
    value,
    onChange,
  }: {
    value: AISpecRuntimeValue;
    onChange: (value: AISpecRuntimeValue) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          ...value,
          model: "new-model",
          prompt: { ...value.prompt, user: "Changed body" },
        })
      }
    >
      Change runtime
    </button>
  ),
}));

const detail: PromptSpecDetail = {
  id: "verify",
  scope: "global",
  source: "default",
  spec: { model: "claude-sonnet" },
  body: "Review {{diff}}.",
  raw: "Review {{diff}}.",
};

describe("prompt runtime helpers", () => {
  it("folds the body into prompt.user and saves it back as the document body", () => {
    const value = specToPromptRuntimeValue(
      { model: "claude-x" },
      "Review {{diff}}."
    );
    expect(value.prompt?.user).toBe("Review {{diff}}.");
    expect(value.model).toBe("claude-x");

    const payload = promptRuntimeValueToPayload(value);
    expect(payload.body).toBe("Review {{diff}}.");
    expect(payload.spec.model).toBe("claude-x");
    expect(payload.spec.prompt?.user).toBeUndefined();
  });

  it("keeps frontmatter prompt fields while stripping only prompt.user", () => {
    const value = specToPromptRuntimeValue(
      { prompt: { system: "Be terse." } },
      "do it"
    );
    const payload = promptRuntimeValueToPayload(value);
    expect(payload.body).toBe("do it");
    expect(payload.spec.prompt?.system).toBe("Be terse.");
    expect(payload.spec.prompt?.user).toBeUndefined();
  });

  it("normalizes prompt preview text to one line", () => {
    expect(
      promptPreviewText({ ...detail, body: "  Line one\n\nLine two  " })
    ).toBe("Line one Line two");
  });
});

describe("PromptPickerField", () => {
  it("renders a single compact row with model name and truncated prompt preview", async () => {
    render(
      <PromptPickerField
        value={undefined}
        onChange={() => {}}
        title="Verify"
        loadDetail={() => Promise.resolve(detail)}
        saveDetail={() => Promise.resolve(detail)}
      />
    );

    const row = await screen.findByRole("button", {
      name: "Edit prompt Verify",
    });
    expect(row).toHaveTextContent("claude-sonnet");
    expect(row).toHaveTextContent("Review {{diff}}.");
    expect(row).not.toHaveTextContent("default");
  });

  it("clips long row output inside the field instead of expanding the layout", async () => {
    const longDetail: PromptSpecDetail = {
      ...detail,
      spec: { model: "claude-sonnet-with-a-very-long-display-name" },
      body: "Review ".repeat(80),
    };

    render(
      <PromptPickerField
        value={undefined}
        onChange={() => {}}
        title="Verify"
        loadDetail={() => Promise.resolve(longDetail)}
        saveDetail={() => Promise.resolve(longDetail)}
      />
    );

    const row = await screen.findByRole("button", {
      name: "Edit prompt Verify",
    });
    expect(row).toHaveClass("max-w-full", "overflow-hidden");
    expect(screen.getByText(longDetail.spec.model as string)).toHaveClass(
      "truncate",
      "max-w-[40%]"
    );
    expect(screen.getByText(longDetail.body.trim())).toHaveClass(
      "truncate",
      "basis-0",
      "flex-1"
    );
  });

  it("opens the spec dialog and saves through the host callback", async () => {
    const saved: PromptSpecDetail = {
      ...detail,
      source: "inline",
      spec: { model: "new-model" },
      body: "Changed body",
      raw: "---\nmodel: new-model\n---\nChanged body",
    };
    const onChange = vi.fn();
    const saveDetail = vi.fn(async (_payload: PromptSpecSavePayload) => saved);

    render(
      <PromptPickerField
        value={undefined}
        onChange={onChange}
        title="Verify"
        loadDetail={() => Promise.resolve(detail)}
        saveDetail={saveDetail}
      />
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit prompt Verify" })
    );
    expect(await screen.findByText("Edit prompt · Verify")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Change runtime" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(saveDetail).toHaveBeenCalledWith({
        source: "inline",
        path: undefined,
        spec: { model: "new-model" },
        body: "Changed body",
        baseRaw: detail.raw,
      })
    );
    expect(onChange).toHaveBeenCalledWith({ inline: saved.raw });
  });

  it("resets to the default prompt through the save callback", async () => {
    const inlineDetail: PromptSpecDetail = {
      ...detail,
      source: "inline",
      spec: { model: "custom-model" },
      body: "Custom body",
      raw: "---\nmodel: custom-model\n---\nCustom body",
    };
    const defaultDetail: PromptSpecDetail = {
      ...detail,
      source: "default",
      spec: { model: "claude-sonnet" },
      body: "Review {{diff}}.",
      raw: "Review {{diff}}.",
    };
    const onChange = vi.fn();
    const saveDetail = vi.fn(
      async (_payload: PromptSpecSavePayload) => defaultDetail
    );

    render(
      <PromptPickerField
        value={{ inline: inlineDetail.raw }}
        onChange={onChange}
        title="Verify"
        loadDetail={() => Promise.resolve(inlineDetail)}
        saveDetail={saveDetail}
      />
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit prompt Verify" })
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Reset to default" })
    );

    await waitFor(() =>
      expect(saveDetail).toHaveBeenCalledWith({
        source: "default",
        baseRaw: inlineDetail.raw,
      })
    );
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(
      await screen.findByRole("button", { name: "Edit prompt Verify" })
    ).toHaveTextContent("Review {{diff}}.");
  });

  it("hides the save-location selector when only inline storage is allowed", async () => {
    render(
      <PromptPickerField
        value={undefined}
        onChange={() => {}}
        title="AI defaults"
        loadDetail={() => Promise.resolve(detail)}
        saveDetail={() => Promise.resolve(detail)}
        sources={["inline"]}
      />
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit prompt AI defaults" })
    );
    expect(screen.queryByLabelText("Save location")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: "File" })
    ).not.toBeInTheDocument();
  });
});

describe("PromptPickerField malformed prompt repair", () => {
  const invalidInline: InvalidPromptSpecDetail = {
    id: "verify",
    scope: "global",
    source: "inline",
    parseError:
      "parse prompt frontmatter: yaml: line 2: could not find expected ':'",
    raw: "---\nmodel: [broken\n---\nbody\n",
  };

  it("renders the error state but keeps the row enabled for a loaded invalid detail", async () => {
    render(
      <PromptPickerField
        value={{ inline: invalidInline.raw }}
        onChange={() => {}}
        title="Verify"
        loadDetail={() => Promise.resolve(invalidInline)}
        saveDetail={() => Promise.resolve(invalidInline)}
      />
    );

    const row = await screen.findByRole("button", {
      name: "Edit prompt Verify",
    });
    expect(row).toHaveTextContent("Prompt error");
    expect(row).toHaveTextContent("could not find expected");
    expect(row).not.toBeDisabled();
  });

  it("opens the raw editor seeded with byte-for-byte source text", async () => {
    render(
      <PromptPickerField
        value={{ inline: invalidInline.raw }}
        onChange={() => {}}
        title="Verify"
        loadDetail={() => Promise.resolve(invalidInline)}
        saveDetail={() => Promise.resolve(invalidInline)}
      />
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit prompt Verify" })
    );
    expect(
      await screen.findByText("Repair prompt · Verify")
    ).toBeInTheDocument();
    const textarea = await screen.findByLabelText("Prompt source");
    expect(textarea).toHaveValue(invalidInline.raw);
    // The parser message is shown both on the row and inside the repair dialog.
    expect(
      screen.getAllByText(invalidInline.parseError).length
    ).toBeGreaterThanOrEqual(2);
  });

  it("sends the corrected inline raw payload and syncs the field from the returned detail", async () => {
    const saved: ValidPromptSpecDetail = {
      id: "verify",
      scope: "global",
      source: "inline",
      spec: { model: "claude-sonnet" },
      body: "body",
      raw: "---\nmodel: claude-sonnet\n---\nbody\n",
    };
    const onChange = vi.fn();
    const saveDetail = vi.fn(async (_payload: PromptSpecSavePayload) => saved);

    render(
      <PromptPickerField
        value={{ inline: invalidInline.raw }}
        onChange={onChange}
        title="Verify"
        loadDetail={() => Promise.resolve(invalidInline)}
        saveDetail={saveDetail}
      />
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit prompt Verify" })
    );
    const textarea = await screen.findByLabelText("Prompt source");
    fireEvent.change(textarea, { target: { value: saved.raw } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(saveDetail).toHaveBeenCalledWith({
        source: "inline",
        path: undefined,
        raw: saved.raw,
        baseRaw: invalidInline.raw,
      })
    );
    expect(onChange).toHaveBeenCalledWith({ inline: saved.raw });
  });

  it("sends the corrected file raw payload with the resolved path and base", async () => {
    const invalidFile: InvalidPromptSpecDetail = {
      id: "verify",
      scope: "global",
      source: "file",
      path: "./prompts/verify.prompt",
      parseError: "parse prompt frontmatter: yaml: line 1: bad",
      raw: "---\n:bad\n---\n",
    };
    const savedFile: ValidPromptSpecDetail = {
      id: "verify",
      scope: "global",
      source: "file",
      path: "./prompts/verify.prompt",
      spec: {},
      body: "ok",
      raw: "---\n{}\n---\nok\n",
    };
    const onChange = vi.fn();
    const saveDetail = vi.fn(
      async (_payload: PromptSpecSavePayload) => savedFile
    );

    render(
      <PromptPickerField
        value={{ file: invalidFile.path }}
        onChange={onChange}
        title="Verify"
        loadDetail={() => Promise.resolve(invalidFile)}
        saveDetail={saveDetail}
      />
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit prompt Verify" })
    );
    const textarea = await screen.findByLabelText("Prompt source");
    fireEvent.change(textarea, { target: { value: savedFile.raw } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(saveDetail).toHaveBeenCalledWith({
        source: "file",
        path: "./prompts/verify.prompt",
        raw: savedFile.raw,
        baseRaw: invalidFile.raw,
      })
    );
    expect(onChange).toHaveBeenCalledWith({ file: "./prompts/verify.prompt" });
  });

  it("keeps the draft and dialog open and shows the parser message when a repair is rejected", async () => {
    const saveDetail = vi.fn(
      async (_payload: PromptSpecSavePayload): Promise<PromptSpecDetail> => {
        throw new Error("parse prompt frontmatter: yaml: line 2: still broken");
      }
    );

    render(
      <PromptPickerField
        value={{ inline: invalidInline.raw }}
        onChange={() => {}}
        title="Verify"
        loadDetail={() => Promise.resolve(invalidInline)}
        saveDetail={saveDetail}
      />
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit prompt Verify" })
    );
    const textarea = await screen.findByLabelText("Prompt source");
    fireEvent.change(textarea, {
      target: { value: "---\nstill: [broken\n---\n" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText(
        "parse prompt frontmatter: yaml: line 2: still broken"
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Prompt source")).toHaveValue(
      "---\nstill: [broken\n---\n"
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("offers reset to default for an invalid override", async () => {
    render(
      <PromptPickerField
        value={{ inline: invalidInline.raw }}
        onChange={() => {}}
        title="Verify"
        loadDetail={() => Promise.resolve(invalidInline)}
        saveDetail={() => Promise.resolve(invalidInline)}
      />
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit prompt Verify" })
    );
    expect(
      await screen.findByRole("button", { name: "Reset to default" })
    ).toBeInTheDocument();
  });

  it("keeps the row disabled when loadDetail genuinely fails", async () => {
    render(
      <PromptPickerField
        value={undefined}
        onChange={() => {}}
        title="Verify"
        loadDetail={() => Promise.reject(new Error("load failed (500)"))}
        saveDetail={() => Promise.resolve(invalidInline)}
      />
    );

    const row = await screen.findByRole("button", {
      name: "Edit prompt Verify",
    });
    await waitFor(() => expect(row).toBeDisabled());
    expect(row).toHaveTextContent("load failed (500)");
  });
});
