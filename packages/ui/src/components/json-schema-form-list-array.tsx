import { useState, type KeyboardEvent } from "react";
import { Icon } from "../data/Icon";
import { UiAdd, UiClose } from "../icons";
import { Button } from "./button";
import { InputField } from "./InputField";
import { ListMenu, ListMenuItem } from "./ListMenu";
import type { FieldControl } from "./json-schema-form-types";

export function CompactListArray({
  field,
  fieldId,
  readOnly,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
}) {
  const [draft, setDraft] = useState("");
  const rawItems = Array.isArray(field.value) ? field.value : [];
  if (rawItems.some((item) => typeof item !== "string")) {
    throw new Error(`${field.key} compact list received a non-string value`);
  }
  const items = rawItems as string[];

  const addDraft = () => {
    const next = draft.trim();
    if (!next) return;
    field.onChange([...items, next]);
    setDraft("");
  };

  const addOnEnter = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addDraft();
  };

  return (
    <ListMenu
      role="list"
      aria-label={field.label}
      className="overflow-hidden rounded-md border border-input bg-background"
      data-jsf-input
    >
      {items.map((item, index) => (
        <ListMenuItem
          key={`${item}-${index}`}
          role="listitem"
          variant="compact"
          interactive={false}
          className="border-l-0"
        >
          {readOnly ? (
            <span className="block truncate py-1 font-mono text-foreground">{item}</span>
          ) : (
            <InputField
              id={`${fieldId}-${index}`}
              aria-label={`${field.label} ${index + 1}`}
              value={item}
              onChange={(next) =>
                field.onChange(items.map((value, itemIndex) => (itemIndex === index ? next : value)))
              }
              className="h-7 border-0 bg-transparent px-0 shadow-none focus-within:ring-0"
              inputClassName="font-mono text-xs"
              suffix={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 p-0 text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${item}`}
                  onClick={() => field.onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <Icon icon={UiClose} className="size-3.5" />
                </Button>
              }
            />
          )}
        </ListMenuItem>
      ))}
      {!readOnly && (
        <ListMenuItem
          role="listitem"
          variant="compact"
          interactive={false}
          className="border-l-0 bg-muted/20"
        >
          <InputField
            id={fieldId}
            aria-label={`Add ${field.label}`}
            value={draft}
            onChange={setDraft}
            onKeyDown={addOnEnter}
            prefix={<Icon icon={UiAdd} className="size-3.5 text-muted-foreground" />}
            suffix={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                disabled={!draft.trim()}
                onClick={addDraft}
              >
                Add
              </Button>
            }
            className="h-7 border-0 bg-transparent px-0 shadow-none focus-within:ring-0"
            inputClassName="font-mono text-xs"
          />
        </ListMenuItem>
      )}
    </ListMenu>
  );
}
