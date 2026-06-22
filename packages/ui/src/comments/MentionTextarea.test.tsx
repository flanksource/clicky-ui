import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MentionTextarea } from "./MentionTextarea";
import type { CommentMention, CommentMentionable } from "./comment-types";

const MENTIONABLES: CommentMentionable[] = [
  { id: "u1", name: "Ada", kind: "user" },
  { id: "a1", name: "claude", kind: "agent" },
  { id: "a2", name: "gemini", kind: "agent" },
];

function Harness({
  onValue,
  onMentionSelect,
  onSubmit,
}: {
  onValue?: (v: string) => void;
  onMentionSelect?: (m: CommentMention) => void;
  onSubmit?: () => void;
}) {
  const [value, setValue] = useState("");
  return (
    <MentionTextarea
      value={value}
      onChange={(v) => {
        setValue(v);
        onValue?.(v);
      }}
      mentionables={MENTIONABLES}
      {...(onMentionSelect ? { onMentionSelect } : {})}
      {...(onSubmit ? { onSubmit } : {})}
      data-testid="ta"
    />
  );
}

function type(value: string) {
  const ta = screen.getByTestId("ta") as HTMLTextAreaElement;
  fireEvent.change(ta, { target: { value, selectionStart: value.length } });
  return ta;
}

describe("MentionTextarea", () => {
  it("opens a filtered mention popover when typing @", () => {
    render(<Harness />);
    type("hi @cl");
    expect(screen.getByTestId("mention-popover")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("claude");
  });

  it("does not treat an email-like @ as a mention", () => {
    render(<Harness />);
    type("ping a@b");
    expect(screen.queryByTestId("mention-popover")).not.toBeInTheDocument();
  });

  it("inserts the selected mention and reports it", () => {
    const onValue = vi.fn();
    const onMentionSelect = vi.fn();
    render(<Harness onValue={onValue} onMentionSelect={onMentionSelect} />);
    type("@cl");
    fireEvent.mouseDown(screen.getByRole("option", { name: /claude/ }));
    expect(onValue).toHaveBeenLastCalledWith("@claude ");
    expect(onMentionSelect).toHaveBeenCalledWith({
      id: "a1",
      name: "claude",
      kind: "agent",
    });
  });

  it("submits on Enter when the popover is closed", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    const ta = type("no mentions");
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not submit on Enter while the popover is open", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    const ta = type("@cl");
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
