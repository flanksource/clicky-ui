import { useCallback, useRef, useState } from "react";
import { Button } from "../components/button";
import { DropdownMenu, type DropdownMenuItem } from "../overlay/DropdownMenu";
import { Modal } from "../overlay/Modal";
import { UiChevronDown, UiEllipsis } from "../icons";
import { Icon } from "./Icon";
import type {
  DataTableSelectionAction,
  DataTableSelectionConfirm,
  DataTableSelectionContext,
} from "./DataTable";
// The placement rules live beside this file rather than in it: they are pure
// functions over descriptors, and a module that exports both components and
// helpers loses fast refresh for the component.
import { splitSelectionActions } from "./selectionActionSplit";

/**
 * The count and the way out of it. `SelectionScopeNotice` says the same thing
 * in more words once a cross-page scope is in play, so exactly one of the two
 * ever renders — a toolbar that states the count twice reads as two selections.
 */
function SelectionCountNotice({
  count,
  onClear,
}: {
  count: number;
  onClear: () => void;
}) {
  return (
    <div
      role="status"
      data-testid="data-table-selection-count"
      className="flex flex-wrap items-center gap-density-2 text-xs text-muted-foreground"
    >
      <span className="font-medium text-foreground">
        {count.toLocaleString()} selected
      </span>
      <Button type="button" variant="outline" size="sm" onClick={onClear}>
        Clear selection
      </Button>
    </div>
  );
}

const DEFAULT_CANCEL_LABEL = "Cancel";

/**
 * Confirmation goes through Modal rather than a popover of its own: Modal owns
 * focus trapping, the escape layer and the overlay z-index stack, and this
 * library should have one answer to "are you sure".
 */
function SelectionConfirmModal<T extends Record<string, unknown>>({
  action,
  context,
  onCancel,
  onConfirm,
}: {
  action: DataTableSelectionAction<T>;
  context: DataTableSelectionContext<T>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  // `confirm: true` and `confirm: false` both mean "no copy supplied"; only an
  // object customises the prompt.
  const options: DataTableSelectionConfirm<T> =
    typeof action.confirm === "object" ? action.confirm : {};
  const count = context.selectedScope?.total ?? context.selectedRowIds.length;
  const message =
    typeof options.message === "function"
      ? options.message(context)
      : (options.message ??
        `This will apply to ${count.toLocaleString()} selected ${
          count === 1 ? "row" : "rows"
        }.`);
  const confirmLabel =
    options.confirmLabel ??
    (typeof action.label === "string" ? action.label : "Confirm");

  return (
    <Modal
      open
      size="sm"
      expandable={false}
      onClose={onCancel}
      title={options.title ?? action.label}
      footer={
        <div className="flex justify-end gap-density-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {options.cancelLabel ?? DEFAULT_CANCEL_LABEL}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={
              action.variant === "destructive" ? "destructive" : "default"
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </Modal>
  );
}

export type SelectionActionBarProps<T extends Record<string, unknown>> = {
  actions: DataTableSelectionAction<T>[];
  context: DataTableSelectionContext<T>;
  /**
   * Render the `{n} selected` count and Clear. False when something else is
   * already stating them — DataTable's cross-page scope notice, say.
   */
  showCount?: boolean;
  /**
   * How many plain buttons stay on the row before the rest collapse. Named
   * dropdowns are never capped — they are what the bar is for.
   */
  maxButtons?: number;
  className?: string;
};

/**
 * The bulk-action cluster a table renders for itself when `selectionActions` is
 * a list. It owns the three things every caller was otherwise re-deriving: what
 * the selection is, which actions are worth a button, and the fact that a bulk
 * call is a request that can still be in flight.
 *
 * It takes only a descriptor list and a selection context, so a list that is
 * not a table — a hand-rolled sidebar of rows, say — can render the identical
 * toolbar rather than growing a second one that drifts.
 */
export function SelectionActionBar<T extends Record<string, unknown>>({
  actions,
  context,
  showCount = true,
  maxButtons,
  className,
}: SelectionActionBarProps<T>) {
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [confirming, setConfirming] =
    useState<DataTableSelectionAction<T> | null>(null);
  const running = useRef(false);

  // A bulk action is a request: it can be slow, it can fail, and it must not be
  // sent twice. Failure is the caller's to report — this component's only
  // obligation is to stop claiming the action is still running.
  const run = useCallback(
    (action: DataTableSelectionAction<T>) => {
      if (running.current || action.disabled) return;
      running.current = true;
      setPendingActionId(action.id);
      const settle = () => {
        running.current = false;
        setPendingActionId(null);
      };
      let result: void | Promise<void>;
      try {
        result = action.onSelect(context);
      } catch (error) {
        settle();
        throw error;
      }
      // A synchronous action settles in the same batch it started, so it never
      // paints a spinner — which is right: there was nothing to wait for.
      if (result instanceof Promise) void result.finally(settle);
      else settle();
    },
    [context],
  );

  const begin = useCallback(
    (action: DataTableSelectionAction<T>) => {
      // Confirm first, run second. The prompt is modal rather than a popover
      // because the click that opens it is the last one the reader gets back.
      if (action.confirm) setConfirming(action);
      else run(action);
    },
    [run],
  );

  const { menus, buttons, overflow } = splitSelectionActions(actions, {
    maxButtons,
  });
  const inline = [...menus, ...buttons];
  const busy = pendingActionId !== null;
  const pendingOverflow = overflow.find(
    (action) => action.id === pendingActionId,
  );

  // Every sibling locks while one action runs. The rows underneath are already
  // being rewritten, and a second bulk call against a selection that is halfway
  // through changing is the one nobody can put back.
  const toMenuItem = (
    action: DataTableSelectionAction<T>,
  ): DropdownMenuItem => ({
    label: action.label,
    onSelect: () => begin(action),
    disabled: action.disabled || busy,
    ...(action.icon ? { icon: action.icon } : {}),
    ...(action.section !== undefined ? { group: action.section } : {}),
    ...(action.children?.length
      ? { children: action.children.map(toMenuItem) }
      : {}),
  });

  // Grouped so DropdownMenu's contiguous-group headings land on the right rows:
  // it renders a heading above the first item of each run and expects the
  // caller to have grouped them.
  //
  // Sections keep the order they first appear in, and items keep theirs within
  // a section. Sorting alphabetically would also make the groups contiguous,
  // but it would silently reorder the caller's list — and a caller that put its
  // destructive action last would find a section named "Danger" sorted to the
  // top of the menu, directly under the cursor.
  const bySection = new Map<string, DataTableSelectionAction<T>[]>();
  for (const action of overflow) {
    const key = action.section ?? "";
    const existing = bySection.get(key);
    if (existing) existing.push(action);
    else bySection.set(key, [action]);
  }
  const overflowItems = [...bySection.values()].flat().map(toMenuItem);

  return (
    <>
      {showCount ? (
        <SelectionCountNotice
          count={context.selectedScope?.total ?? context.selectedRowIds.length}
          onClear={context.clearSelection}
        />
      ) : null}
      <span className={className}>
        {inline.map((action) => {
          const pending = pendingActionId === action.id;
          const isMenu = menus.includes(action);
          const trigger = (
            <Button
              type="button"
              size="sm"
              variant={action.variant ?? "outline"}
              disabled={action.disabled || (busy && !pending)}
              loading={pending}
              {...(isMenu
                ? { "aria-haspopup": "menu" as const }
                : { onClick: () => begin(action) })}
            >
              {/* The spinner takes the icon's place rather than sitting beside it. */}
              {action.icon && !pending ? (
                <Icon
                  icon={action.icon}
                  {...(action.iconClassName
                    ? { className: action.iconClassName }
                    : {})}
                />
              ) : null}
              {pending && action.pendingLabel !== undefined
                ? action.pendingLabel
                : action.label}
              {isMenu ? <Icon icon={UiChevronDown} /> : null}
            </Button>
          );

          if (!isMenu) {
            return <span key={action.id}>{trigger}</span>;
          }

          // The trigger only opens the menu; the write is whichever value the
          // reader picks inside it. `menu` and `children` are the two bodies a
          // caller can supply, and DropdownMenu already renders both — one as
          // items, one as its own render prop — so nothing here re-implements a
          // menu.
          const body = action.menu
            ? {
                children: (closeMenu: () => void) =>
                  action.menu!({
                    context,
                    close: closeMenu,
                    busy,
                    // Work started inside a custom body is still this action's
                    // work: routing it through `run` is what puts the spinner
                    // on this trigger and locks the siblings, instead of the
                    // bar sitting idle while a bulk call is in flight.
                    run: (task) =>
                      begin({
                        ...action,
                        ...(task.pendingLabel !== undefined
                          ? { pendingLabel: task.pendingLabel }
                          : {}),
                        ...(task.confirm !== undefined
                          ? { confirm: task.confirm }
                          : {}),
                        onSelect: task.onSelect,
                      }),
                  }),
              }
            : { items: (action.children ?? []).map(toMenuItem) };

          return (
            <DropdownMenu
              key={action.id}
              align="left"
              menuLabel={
                typeof action.label === "string" ? action.label : action.id
              }
              trigger={trigger}
              {...body}
            />
          );
        })}
        {overflow.length > 0 ? (
          <DropdownMenu
            align="right"
            menuLabel="Selection actions"
            items={overflowItems}
            trigger={
              <Button
                type="button"
                size="sm"
                variant="outline"
                aria-haspopup="menu"
                aria-label="More selection actions"
                // A menu action that is running has no row of its own to report
                // from, so the trigger it came out of reports for it.
                disabled={busy && !pendingOverflow}
                loading={!!pendingOverflow}
              >
                {pendingOverflow ? null : <Icon icon={UiEllipsis} />}
                More
                <Icon icon={UiChevronDown} />
              </Button>
            }
          />
        ) : null}
      </span>
      {confirming ? (
        <SelectionConfirmModal
          action={confirming}
          context={context}
          onCancel={() => setConfirming(null)}
          onConfirm={() => {
            const action = confirming;
            setConfirming(null);
            run(action);
          }}
        />
      ) : null}
    </>
  );
}
