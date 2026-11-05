import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { EditableTextPart } from "./editable-dom";

function copiedTextStyle(element: HTMLElement): CSSProperties {
  const computed = getComputedStyle(element);
  return {
    fontFamily: computed.fontFamily,
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
    lineHeight: computed.lineHeight,
    color: computed.color,
    textAlign: computed.textAlign as CSSProperties["textAlign"],
  };
}

/** An input laid exactly over a text part; the page's own DOM is never made contentEditable. */
export function InlineTextEditor({ part, label, zIndex, onCommit, onCancel }: {
  part: EditableTextPart;
  label: string;
  zIndex: number;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [typography] = useState(() => copiedTextStyle(part.element));
  const finished = useRef(false);
  const multiline = part.text.includes("\n");
  const rect = part.element.getBoundingClientRect();

  const finish = (value: string | null) => {
    if (finished.current) return;
    finished.current = true;
    if (value === null || value === part.text) onCancel();
    else onCommit(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      finish(null);
    } else if (event.key === "Enter" && !(multiline && event.shiftKey)) {
      event.preventDefault();
      finish(event.currentTarget.value);
    }
  };

  const shared = {
    autoFocus: true,
    defaultValue: part.text,
    "aria-label": `Edit ${part.prop} of ${label}`,
    className: "pointer-events-auto fixed m-0 resize-none rounded-sm border-0 bg-background p-0 outline-none ring-2 ring-primary",
    style: { ...typography, left: rect.left, top: rect.top, width: Math.max(rect.width, 48), height: rect.height, zIndex },
    onKeyDown,
    onBlur: (event: { currentTarget: { value: string } }) => finish(event.currentTarget.value),
  };
  return multiline ? <textarea {...shared} /> : <input type="text" {...shared} />;
}
