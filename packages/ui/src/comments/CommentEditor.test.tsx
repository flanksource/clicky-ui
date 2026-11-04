import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommentEditor } from "./CommentEditor";
import { setCommentDraft } from "../test/comment-editor";
import { vocabularyHref, type CommentVocabulary } from "./comment-vocabulary";

const item = { catalog: "example", type: "box", id: "box/header", label: "Header", description: "Role-coloured header", references: ["src/boxes.ts"] };
const vocabulary: CommentVocabulary = { items: [item], renderPreview: entry => <span>Preview: {entry.id}</span> };
describe("CommentEditor", () => {
  it("previews an item before keyboard insertion and reserves Enter for selection", async () => {
    const submit = vi.fn();
    const change = vi.fn();
    render(<CommentEditor value="" onChange={change} vocabulary={vocabulary} mentionables={[]} onSubmit={submit} />);
    const editor = screen.getByRole("textbox");
    setCommentDraft(editor, "@box/");
    expect(screen.getByText("Preview: box/header")).toBeInTheDocument();
    expect(editor).toHaveTextContent("@box/");
    fireEvent.keyDown(editor, { key: "Enter" });
    await waitFor(() => expect(change).toHaveBeenLastCalledWith(`[Header](${vocabularyHref(item)}) `));
    expect(submit).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    fireEvent.keyDown(editor, { key: "Enter" });
    expect(submit).toHaveBeenCalledOnce();
  });
  it("dismisses the picker before cancelling the composer", () => {
    const cancel = vi.fn();
    render(<CommentEditor value="" onChange={() => {}} vocabulary={vocabulary} mentionables={[]} onCancel={cancel} />);
    const editor = screen.getByRole("textbox");
    setCommentDraft(editor, "@");
    fireEvent.keyDown(editor, { key: "Escape" });
    expect(cancel).not.toHaveBeenCalled();
    fireEvent.keyDown(editor, { key: "Escape" });
    expect(cancel).toHaveBeenCalledOnce();
  });
});
