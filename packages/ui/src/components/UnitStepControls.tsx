import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { UiAdd, UiRemove } from "../icons";
import { IconButton } from "./IconButton";

export function UnitStepControls({
  label,
  suffix,
  decrease,
  increase,
  schemaReadOnly,
  onChange,
}: {
  label: string;
  suffix: ReactNode;
  decrease: string | null;
  increase: string | null;
  schemaReadOnly: boolean;
  onChange: (next: string) => void;
}) {
  const controlsRef = useRef<HTMLSpanElement>(null);
  const [readOnly, setReadOnly] = useState(schemaReadOnly);
  useLayoutEffect(() => {
    const input = controlsRef.current
      ?.closest("[data-jsf-control]")
      ?.querySelector<HTMLInputElement>("input[data-jsf-input]");
    setReadOnly(schemaReadOnly || input?.disabled === true);
  });

  if (readOnly) {
    return <span ref={controlsRef}>{suffix}</span>;
  }
  return (
    <span ref={controlsRef} className="flex items-center gap-1">
      {suffix}
      <IconButton
        icon={UiRemove}
        label={`Decrease ${label}`}
        className="size-7"
        iconClassName="text-base"
        disabled={decrease === null}
        onMouseDown={(event) => event.preventDefault()}
        {...(decrease !== null ? { onClick: () => onChange(decrease) } : {})}
      />
      <IconButton
        icon={UiAdd}
        label={`Increase ${label}`}
        className="size-7"
        iconClassName="text-base"
        disabled={increase === null}
        onMouseDown={(event) => event.preventDefault()}
        {...(increase !== null ? { onClick: () => onChange(increase) } : {})}
      />
    </span>
  );
}
