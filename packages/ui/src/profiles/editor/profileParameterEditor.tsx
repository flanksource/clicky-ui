import { JsonSchemaForm } from "../../components/JsonSchemaForm";
import { ItemActions } from "../../components/ItemActions";
import {
  ItemBadge,
  ItemGlyph,
  RequiredMark,
} from "../../components/json-schema-form-item-row";
import {
  addItemLabel,
  emptyItemsCopy,
  itemActionsAllow,
  itemCountLabel,
  itemSummaryFor,
  noItemsLabel,
  resolveItemSpec,
} from "../../components/json-schema-form-item-summary";
import { resolveControl } from "../../components/json-schema-form-resolve";
import {
  canAddItem,
  canRemoveItem,
  seedFromSchema,
} from "../../components/json-schema-form-utils";
import type {
  FieldControl,
  JsonSchemaObject,
  JsonSchemaProperty,
} from "../../components/json-schema-form-types";
import { UiAdd } from "../../icons";
import {
  duplicateIndex,
  isPlainObject,
  moveItem,
  removeIndex,
  setIndex,
} from "../../lib/collections";
import { profileFormExtensions, profileSchema } from "../profileApi";
import type {
  ParamDraft,
  ProfileWizardDraft,
} from "../wizard/profileWizardModel";

type ParameterEditorProps = {
  draft: ProfileWizardDraft;
  activeIndex: number;
  onChange: (draft: ProfileWizardDraft) => void;
};

export function ProfileParameterSidebar({
  draft,
  activeIndex,
  onActiveIndexChange,
  onChange,
}: ParameterEditorProps & {
  onActiveIndexChange: (index: number) => void;
}) {
  const field = parameterArrayField(draft, onChange);
  const items = parameterItems(field);
  const itemSchema = parameterItemSchema(field.schema);
  const spec = resolveItemSpec(field.schema, itemSchema);
  const emptyCopy = emptyItemsCopy(spec, field.schema);
  const selectedIndex = boundedActiveIndex(activeIndex, items.length);
  const commit = (next: ParamDraft[]) => field.onChange(next);

  const move = (from: number, to: number) => {
    commit(moveItem(items, from, to));
    onActiveIndexChange(reorderedActiveIndex(selectedIndex, from, to));
  };

  return (
    <div className="space-y-2 py-1">
      <p className="text-[11px] text-muted-foreground">
        {items.length === 0
          ? noItemsLabel(spec)
          : itemCountLabel(spec, items.length)}
      </p>
      <div className="space-y-0.5">
        {items.map((item, index) => {
          const summary = itemSummaryFor({ item, index, spec, itemSchema });
          const active = index === selectedIndex;
          return (
            <div
              key={`${item.name ?? "parameter"}-${index}`}
              data-profile-tree-item
              className={`group relative flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 ${
                active ? "bg-primary/[0.08]" : "hover:bg-muted/50"
              }`}
            >
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                className="flex min-w-0 flex-1 items-center gap-1.5 rounded px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onActiveIndexChange(index)}
              >
                <ItemGlyph glyph={summary.glyph} />
                <span className="truncate text-xs font-medium">
                  {summary.title}
                </span>
                <ItemBadge badge={summary.badge} />
                {summary.flagged ? <RequiredMark /> : null}
              </button>
              <ItemActions
                label={summary.title}
                index={index}
                count={items.length}
                size="xs"
                {...(itemActionsAllow(spec, "reorder")
                  ? { onMove: (to: number) => move(index, to) }
                  : {})}
                {...(itemActionsAllow(spec, "duplicate")
                  ? {
                      onDuplicate: () => {
                        commit(duplicateIndex(items, index));
                        onActiveIndexChange(index + 1);
                      },
                    }
                  : {})}
                {...(itemActionsAllow(spec, "remove") &&
                canRemoveItem(field, items.length)
                  ? {
                      onRemove: () => {
                        commit(removeIndex(items, index));
                        onActiveIndexChange(
                          removedActiveIndex(
                            selectedIndex,
                            index,
                            items.length,
                          ),
                        );
                      },
                    }
                  : {})}
              />
            </div>
          );
        })}
        {canAddItem(field, items.length) ? (
          <button
            type="button"
            data-profile-tree-item
            className="relative flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-xs text-muted-foreground hover:bg-muted/50"
            onClick={() => {
              commit([...items, parameterSeed(itemSchema)]);
              onActiveIndexChange(items.length);
            }}
          >
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-foreground/60">
              <UiAdd className="size-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block font-medium text-foreground">
                {addItemLabel(spec)}
              </span>
              {items.length === 0 && emptyCopy ? (
                <span className="mt-0.5 block leading-snug">{emptyCopy}</span>
              ) : null}
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ProfileParameterDetail({
  draft,
  activeIndex,
  onChange,
}: ParameterEditorProps) {
  const field = parameterArrayField(draft, onChange);
  const items = parameterItems(field);
  const selectedIndex = boundedActiveIndex(activeIndex, items.length);
  const item = items[selectedIndex];
  if (!item) {
    return (
      <div className="grid h-full place-items-center p-8 text-sm text-muted-foreground">
        Add a parameter in the sidebar to configure it.
      </div>
    );
  }

  const itemSchema = parameterItemSchema(field.schema);
  const wrapperKey = "parameter";
  const extensions = profileFormExtensions();
  return (
    <JsonSchemaForm
      idPrefix={`profile-parameter-${selectedIndex}`}
      schema={{
        type: "object",
        properties: { [wrapperKey]: itemSchema },
      }}
      value={{ [wrapperKey]: item }}
      onChange={(next) => {
        if (!isPlainObject(next[wrapperKey])) {
          throw new Error(
            "profile parameter editor produced a non-object item",
          );
        }
        field.onChange(
          setIndex(items, selectedIndex, next[wrapperKey] as ParamDraft),
        );
      }}
      rootValue={draft}
      onRootChange={onChange}
      instancePath={`/params/${selectedIndex}`}
      layout={{ mode: "stacked", valueMaxWidth: "40rem", help: "hover" }}
      showPreferencesMenu={false}
      pre={extensions.pre}
      post={extensions.post}
    />
  );
}

function parameterArrayField(
  draft: ProfileWizardDraft,
  onChange: (draft: ProfileWizardDraft) => void,
): FieldControl {
  const schema = profileSchema();
  const prop = schema.properties?.params;
  if (!prop) throw new Error("profile schema does not define params");
  const value = draft.params ?? [];
  let field: FieldControl | null = resolveControl({
    key: "params",
    prop,
    required: schema.required?.includes("params") ?? false,
    value,
    onChange: (next) => {
      if (!Array.isArray(next)) {
        throw new Error("profile params editor produced a non-array value");
      }
      onChange({ ...draft, params: next as ParamDraft[] });
    },
  });
  for (const extension of profileFormExtensions().pre) {
    if (!field) break;
    field = extension(field, {
      key: "params",
      prop,
      value,
      rootValue: draft,
      onRootChange: onChange,
    });
  }
  if (!field)
    throw new Error("profile params field was hidden by an extension");
  if (field.kind !== "array") {
    throw new Error(
      `profile params must resolve to an array, got ${field.kind}`,
    );
  }
  return field;
}

function parameterItemSchema(schema: JsonSchemaProperty): JsonSchemaObject {
  if (!schema.items || Array.isArray(schema.items)) {
    throw new Error("profile params schema must define one object item schema");
  }
  return schema.items as JsonSchemaObject;
}

function parameterItems(field: FieldControl): ParamDraft[] {
  if (!Array.isArray(field.value)) {
    throw new Error("profile params value must be an array");
  }
  return field.value as ParamDraft[];
}

function parameterSeed(schema: JsonSchemaProperty): ParamDraft {
  const seed = seedFromSchema(schema);
  if (!isPlainObject(seed)) {
    throw new Error("profile parameter schema must seed an object");
  }
  return seed as ParamDraft;
}

function reorderedActiveIndex(
  active: number,
  from: number,
  to: number,
): number {
  if (active === from) return to;
  if (from < active && to >= active) return active - 1;
  if (from > active && to <= active) return active + 1;
  return active;
}

function removedActiveIndex(active: number, removed: number, count: number) {
  if (count <= 1) return 0;
  if (active === removed) return Math.max(0, Math.min(removed - 1, count - 2));
  return active > removed ? active - 1 : active;
}

function boundedActiveIndex(active: number, count: number) {
  return count === 0 ? 0 : Math.max(0, Math.min(active, count - 1));
}
