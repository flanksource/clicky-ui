import {
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { Properties } from "../data/Properties";
import { cn } from "../lib/utils";
import { IconButton } from "./IconButton";
import { UiCheck, UiClose } from "../icons";
import { controlHeightClass } from "./json-schema-form-size";
import { propertyRowClass } from "./json-schema-form-properties-size";
import { PropertyActionsContext } from "./json-schema-form-property-actions-context";
import { FieldErrorText } from "./json-schema-form-error-display";
import { fieldAriaProps, fieldErrorId } from "./json-schema-form-utils";
import type { FieldControl, RenderContext } from "./json-schema-form-types";
import type { JsonSchemaFormError } from "./json-schema-form-error-types";
import {
  propertyDraftValue,
  propertyValuesEqual,
  updatePropertyDraft,
} from "./json-schema-form-property-draft";

export function PropertyValueEditor({
  field,
  fieldId,
  ctx,
  renderEditor,
  preview,
  actionsPlacement = "inline",
}: {
  field: FieldControl;
  fieldId: string;
  ctx: RenderContext;
  renderEditor: (field: FieldControl, ctx: RenderContext) => ReactNode;
  preview: ReactNode;
  actionsPlacement?: "inline" | "row";
}) {
  const actionsTarget = useContext(PropertyActionsContext);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(field.value);
  const [rootDraft, setRootDraft] = useState<Record<string, unknown>>();
  const editor = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLDivElement>(null);
  const restoringFocus = useRef(false);
  const focusWithin = useRef(false);
  const readOnly = ctx.readOnly || field.readOnly;
  const dirty = rootDraft
    ? !propertyValuesEqual(rootDraft, ctx.rootValue)
    : !propertyValuesEqual(draft, field.value);
  useEffect(() => {
    if (!editing && restoringFocus.current) {
      trigger.current?.focus();
      restoringFocus.current = false;
    }
    const container = editor.current;
    if (!editing || !container) return;
    let focusedControl: HTMLElement | null;
    const focusControl = () => {
      focusedControl =
        container.querySelector<HTMLElement>('[contenteditable="true"]') ??
        container.querySelector<HTMLElement>(
          "input:not(:disabled):not([type=hidden]), textarea:not(:disabled), select:not(:disabled), [role=combobox]",
        ) ??
        container.querySelector<HTMLElement>("button:not(:disabled)");
      focusedControl?.focus();
    };
    focusControl();
    const observer = new MutationObserver(() => {
      if (
        focusedControl &&
        !focusedControl.isConnected &&
        document.activeElement === document.body
      )
        focusControl();
    });
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [editing]);
  const finish = () => {
    restoringFocus.current = true;
    setEditing(false);
  };
  const accept = () => {
    if (rootDraft) ctx.onRootChange?.(rootDraft);
    else field.onChange(draft);
    finish();
  };
  const start = () => {
    setDraft(field.value);
    setRootDraft(undefined);
    setEditing(true);
  };
  const acceptAndAdvance = () => {
    const container = editor.current;
    const form = container?.closest("[data-json-schema-form]");
    if (!container || !form)
      throw new Error("Property editor must belong to a JsonSchemaForm");
    const fields = () =>
      Array.from(
        form.querySelectorAll<HTMLElement>("[data-property-editor]"),
      ).filter((node) => node.closest("[data-json-schema-form]") === form);
    const nextIndex = fields().indexOf(container) + 1;
    const nextField = fields()[nextIndex]?.dataset.propertyEditor;
    flushSync(accept);
    const updatedFields = fields();
    const next =
      updatedFields.find((node) => node.dataset.propertyEditor === nextField) ??
      updatedFields[nextIndex];
    if (next?.getAttribute("role") === "button") next.focus();
    else
      next
        ?.querySelector<HTMLElement>(
          'input:not(:disabled):not([type=hidden]), textarea:not(:disabled), select:not(:disabled), [contenteditable="true"], [role=combobox]',
        )
        ?.focus();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.defaultPrevented ||
      event.nativeEvent.isComposing ||
      event.keyCode === 229
    )
      return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      finish();
    } else if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !(
        event.target instanceof Element &&
        event.target.closest("button, [role=button], a")
      )
    ) {
      event.preventDefault();
      event.stopPropagation();
      acceptAndAdvance();
    }
  };
  if (editing) {
    const actions = dirty ? (
      <>
        <IconButton
          icon={UiCheck}
          label={`Save ${field.label}`}
          className={cn(
            "w-6 text-[var(--fs-success)] hover:text-[var(--fs-success-700)]",
            controlHeightClass[ctx.size],
          )}
          onClick={accept}
        />
        <IconButton
          icon={UiClose}
          label={`Cancel editing ${field.label}`}
          className={cn(
            "w-6 text-destructive hover:text-destructive",
            controlHeightClass[ctx.size],
          )}
          onClick={finish}
        />
      </>
    ) : null;
    return (
      <div
        ref={editor}
        data-property-editor={readOnly ? undefined : fieldId}
        className="flex min-w-0 items-start gap-1"
        onFocusCapture={() => {
          focusWithin.current = true;
        }}
        onBlurCapture={() => {
          focusWithin.current = false;
          setTimeout(() => {
            if (!focusWithin.current && editor.current?.isConnected) {
              restoringFocus.current = false;
              setEditing(false);
            }
          }, 0);
        }}
        onKeyDown={handleKeyDown}
        onKeyDownCapture={(event) => {
          if (
            event.key === "Enter" &&
            event.target instanceof Element &&
            event.target.closest('[contenteditable="true"]')
          )
            handleKeyDown(event);
        }}
      >
        <div className="min-w-0 flex-1">
          {renderEditor(
            {
              ...field,
              value: draft,
              onChange: (next) => {
                setDraft(next);
                if (rootDraft)
                  setRootDraft(
                    updatePropertyDraft({
                      root: rootDraft,
                      path: ctx.instancePath,
                      value: next,
                    }),
                  );
              },
            },
            {
              ...ctx,
              ...(ctx.rootValue
                ? {
                    rootValue:
                      rootDraft ??
                      updatePropertyDraft({
                        root: ctx.rootValue,
                        path: ctx.instancePath,
                        value: draft,
                      }),
                  }
                : {}),
              ...(ctx.onRootChange
                ? {
                    onRootChange: (next: Record<string, unknown>) => {
                      setRootDraft(next);
                      setDraft(propertyDraftValue(next, ctx.instancePath));
                    },
                  }
                : {}),
            },
          )}
        </div>
        {actionsPlacement === "row"
          ? actionsTarget && createPortal(actions, actionsTarget)
          : actions}
      </div>
    );
  }
  return (
    <div
      ref={trigger}
      id={fieldId}
      data-property-editor={readOnly ? undefined : fieldId}
      role={readOnly ? undefined : "button"}
      tabIndex={readOnly ? undefined : 0}
      aria-label={readOnly ? field.label : `Edit ${field.label}`}
      onFocus={(event) => {
        if (
          event.target === event.currentTarget &&
          !readOnly &&
          !restoringFocus.current
        )
          start();
      }}
      {...fieldAriaProps(field, fieldId)}
      className={cn(
        "block w-full min-w-0 rounded text-left",
        !readOnly &&
          "cursor-pointer hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      onClickCapture={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!readOnly) start();
      }}
      onKeyDownCapture={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        if (!readOnly) start();
      }}
      onChangeCapture={(event) => {
        event.stopPropagation();
        if (!readOnly) start();
      }}
    >
      <div className="pointer-events-none [&_*]:pointer-events-none">
        {preview}
      </div>
    </div>
  );
}

export function PropertiesFieldRow({
  field,
  fieldId,
  label,
  value,
  messages,
  ctx,
}: {
  field: FieldControl;
  fieldId: string;
  label: ReactNode;
  value: ReactNode;
  messages: JsonSchemaFormError[];
  ctx: RenderContext;
}) {
  const [actionsTarget, setActionsTarget] = useState<HTMLSpanElement | null>(
    null,
  );
  const nested = field.kind === "object" || field.kind === "string-map";
  return (
    <PropertyActionsContext.Provider value={actionsTarget}>
      <Properties
        showDensityMenu={false}
        density="comfortable"
        className="rounded-none border-0 border-b"
        rowClassName={cn("items-center", propertyRowClass[ctx.size])}
        gridTemplateColumns={`minmax(0, ${ctx.layout.labelMaxWidth ?? "12rem"}) minmax(0, ${ctx.layout.valueMaxWidth ?? "1fr"})`}
        items={[
          {
            key: field.key,
            value,
            ...(field.helper &&
            (field.helpDisplay ?? ctx.layout.help) !== "hover"
              ? { subtitle: field.helper }
              : {}),
            ...(nested
              ? {
                  expandable: true,
                  expanded: true,
                  renderChildren: () => value,
                }
              : {}),
          },
        ]}
        renderLabel={() => label}
        renderValue={() => (
          <div className="flex min-w-0 items-start gap-1">
            <div className="min-w-0 flex-1">
              {!nested && value}
              <FieldErrorText id={fieldErrorId(fieldId)} errors={messages} />
            </div>
            <span
              ref={setActionsTarget}
              data-property-row-actions
              className="ml-auto inline-flex shrink-0 gap-1 empty:hidden"
            />
          </div>
        )}
      />
    </PropertyActionsContext.Provider>
  );
}
