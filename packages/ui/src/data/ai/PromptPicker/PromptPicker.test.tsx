import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import {
  PromptPickerField,
  promptPreviewText,
  promptRuntimeValueToPayload,
  specToPromptRuntimeValue,
  type PromptSpecDetail,
  type PromptSpecSavePayload,
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
    const value = specToPromptRuntimeValue({ model: "claude-x" }, "Review {{diff}}.");
    expect(value.prompt?.user).toBe("Review {{diff}}.");
    expect(value.model).toBe("claude-x");

    const payload = promptRuntimeValueToPayload(value);
    expect(payload.body).toBe("Review {{diff}}.");
    expect(payload.spec.model).toBe("claude-x");
    expect(payload.spec.prompt?.user).toBeUndefined();
  });

  it("keeps frontmatter prompt fields while stripping only prompt.user", () => {
    const value = specToPromptRuntimeValue({ prompt: { system: "Be terse." } }, "do it");
    const payload = promptRuntimeValueToPayload(value);
    expect(payload.body).toBe("do it");
    expect(payload.spec.prompt?.system).toBe("Be terse.");
    expect(payload.spec.prompt?.user).toBeUndefined();
  });

  it("normalizes prompt preview text to one line", () => {
    expect(promptPreviewText({ ...detail, body: "  Line one\n\nLine two  " })).toBe(
      "Line one Line two",
    );
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
      />,
    );

    const row = await screen.findByRole("button", { name: "Edit prompt Verify" });
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
      />,
    );

    const row = await screen.findByRole("button", { name: "Edit prompt Verify" });
    expect(row).toHaveClass("max-w-full", "overflow-hidden");
    expect(screen.getByText(longDetail.spec.model as string)).toHaveClass("truncate", "max-w-[40%]");
    expect(screen.getByText(longDetail.body.trim())).toHaveClass("truncate", "basis-0", "flex-1");
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
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Edit prompt Verify" }));
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
      }),
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
    const saveDetail = vi.fn(async (_payload: PromptSpecSavePayload) => defaultDetail);

    render(
      <PromptPickerField
        value={{ inline: inlineDetail.raw }}
        onChange={onChange}
        title="Verify"
        loadDetail={() => Promise.resolve(inlineDetail)}
        saveDetail={saveDetail}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Edit prompt Verify" }));
    fireEvent.click(await screen.findByRole("button", { name: "Reset to default" }));

    await waitFor(() =>
      expect(saveDetail).toHaveBeenCalledWith({
        source: "default",
        baseRaw: inlineDetail.raw,
      }),
    );
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(await screen.findByRole("button", { name: "Edit prompt Verify" })).toHaveTextContent(
      "Review {{diff}}.",
    );
  });
});
