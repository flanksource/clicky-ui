import { useState } from "react";
import { InputField } from "../../components/InputField";

export function RuntimeLimitInput<V extends string | number>({
  inputLabel,
  text,
  placeholder,
  parse,
  current,
  onChange,
}: {
  inputLabel: string;
  text: string;
  placeholder: string;
  parse: (text: string) => V | undefined;
  current: string | undefined;
  onChange: (next: V | undefined) => void;
}) {
  const [draft, setDraft] = useState<string>();
  const shown = draft ?? text;
  const invalid = shown.trim() !== "" && parse(shown) === undefined;
  return (
    <InputField
      value={shown}
      aria-label={inputLabel}
      placeholder={placeholder}
      invalid={invalid}
      onFocus={() => setDraft(text)}
      onBlur={() => setDraft(undefined)}
      onChange={(next) => {
        setDraft(next);
        if (next.trim() === "") {
          if (current !== undefined) onChange(undefined);
          return;
        }
        const parsed = parse(next);
        if (parsed !== undefined) onChange(parsed);
      }}
      inputClassName="font-mono text-xs"
      className="bg-background"
    />
  );
}
