import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Combobox } from "../../components/Combobox";
import type { ComboboxOption } from "../../components/combobox-types";
import type { FormSize } from "../../components/json-schema-form-size";
import { Button } from "../../components/button";
import { UiAdd } from "../../icons";
import { cn } from "../../lib/utils";
import { AgentIdentity } from "../chat/AgentIdentity";
import { sessionPickerDescription, sessionPickerTitle, type SessionPickerLoader, type SessionPickerSession } from "./SessionPicker.model";

export type { SessionPickerLoader, SessionPickerSession } from "./SessionPicker.model";

export type SessionPickerProps = {
  /** Selected session id; `undefined` selects "New session" when `onNew` is set. */
  value: string | undefined;
  onChange: (session: SessionPickerSession) => void;
  /** Sessions to offer; pass either `sessions` or `load`. */
  sessions?: readonly SessionPickerSession[];
  /** Loads the sessions on mount and whenever `scope` changes. */
  load?: SessionPickerLoader;
  /** Changing this reloads `load`. */
  scope?: string;
  /** Offers a "New session" choice first. */
  onNew?: () => void;
  /** Groups the options under headers, e.g. by status or folder. */
  groupBy?: (session: SessionPickerSession) => string | undefined;
  /** Accessible name of the control. */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: FormSize;
  menuWidth?: number;
  /** Controls above the options, outside the listbox. */
  menuHeader?: ReactNode;
  /** Content pinned below the options. */
  footer?: ReactNode;
  className?: string;
  /** Reference time for "updated" labels; defaults to the current time. */
  now?: Date;
};

const NEW_SESSION = "\u0000new-session";

function identity(session: SessionPickerSession) {
  if (!session.provider && !session.model) return undefined;
  return (
    <AgentIdentity
      iconOnly
      className="shrink-0"
      identityId={session.id}
      {...(session.provider ? { provider: session.provider } : {})}
      {...(session.model ? { model: session.model } : {})}
    />
  );
}

function useSessions(sessions: readonly SessionPickerSession[] | undefined, load: SessionPickerLoader | undefined, scope: string) {
  if (sessions && load) throw new Error("SessionPicker takes either sessions or load, not both");
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<{ items: readonly SessionPickerSession[]; loading: boolean; error: Error | null }>({ items: [], loading: Boolean(load), error: null });
  useEffect(() => {
    if (!load) return;
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: null }));
    load({ signal: controller.signal }).then(
      (items) => { if (!controller.signal.aborted) setState({ items, loading: false, error: null }); },
      (cause: unknown) => { if (!controller.signal.aborted) setState({ items: [], loading: false, error: cause instanceof Error ? cause : new Error(String(cause)) }); },
    );
    return () => controller.abort();
  }, [load, scope, version]);
  const retry = useCallback(() => setVersion((previous) => previous + 1), []);
  return { ...(sessions ? { items: sessions, loading: false, error: null } : state), retry };
}

/**
 * A searchable dropdown of agent sessions: each option shows the provider icon,
 * title and a status · folder · context · cost · age line. Sessions come from a
 * list or an async loader; `onNew` adds a "New session" choice.
 */
export function SessionPicker(props: SessionPickerProps) {
  const { value, onChange, onNew, groupBy, label = "Session", disabled = false, now, className } = props;
  const data = useSessions(props.sessions, props.load, props.scope ?? "");
  const options: ComboboxOption[] = [
    ...(onNew ? [{ value: NEW_SESSION, label: "New session", icon: <UiAdd />, description: "Start a fresh session" }] : []),
    ...data.items.map((session) => {
      const description = sessionPickerDescription(session, now);
      const group = groupBy?.(session);
      const icon = identity(session);
      return {
        value: session.id,
        label: sessionPickerTitle(session),
        descriptionLayout: "stacked" as const,
        title: [sessionPickerTitle(session), session.cwd, session.id].filter(Boolean).join("\n"),
        ...(description ? { description } : {}),
        ...(group ? { group } : {}),
        ...(icon ? { icon } : {}),
      };
    }),
  ];
  const selected = data.items.find((session) => session.id === value);
  const comboValue = value ?? (onNew ? NEW_SESSION : "");
  const caption = selected ? sessionPickerTitle(selected) : comboValue === NEW_SESSION ? "New session" : value ?? props.placeholder ?? "Select a session…";
  const status = data.error
    ? <span className="flex items-center justify-between gap-2 text-destructive"><span className="break-words">{data.error.message}</span>
        {props.load && <Button type="button" size="sm" variant="ghost" onMouseDown={(event) => event.preventDefault()} onClick={data.retry}>Retry</Button>}</span>
    : data.loading ? "Loading sessions…" : data.items.length === 0 ? "No sessions" : `${data.items.length} ${data.items.length === 1 ? "session" : "sessions"}`;

  return (
    <Combobox
      searchPlacement="menu"
      ariaLabel={label}
      value={comboValue}
      options={options}
      allowCustomValue={false}
      required
      disabled={disabled}
      loading={data.loading}
      invalid={Boolean(data.error)}
      menuWidth={props.menuWidth ?? 420}
      className={cn("min-w-0", className)}
      title={data.error?.message ?? (selected ? [sessionPickerTitle(selected), selected.cwd, selected.id].filter(Boolean).join("\n") : caption)}
      {...(props.size ? { size: props.size } : {})}
      {...(props.menuHeader ? { menuHeader: props.menuHeader } : {})}
      triggerContent={
        <span className="flex min-w-0 items-center gap-1.5">
          {selected ? identity(selected) : comboValue === NEW_SESSION ? <UiAdd className="size-3.5 shrink-0" aria-hidden /> : null}
          <span className={cn("min-w-0 truncate", !selected && comboValue !== NEW_SESSION && "text-muted-foreground")}>{caption}</span>
        </span>
      }
      footer={<div className="space-y-1">{props.footer}<div role="status">{status}</div></div>}
      onChange={(next) => {
        if (next === NEW_SESSION) return onNew?.();
        const session = data.items.find((item) => item.id === next);
        if (session) onChange(session);
      }}
    />
  );
}
