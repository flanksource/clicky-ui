import { Button } from "../components/button";
import { Icon } from "../data/Icon";
import { UiDatabase } from "../icons";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";
import { savedConnectionID } from "./connectionBrowserModel";
import {
  ProfileBuilderWorkspace,
  type ProfileDraft
} from "./profileBuilderWorkspace";
import "./profileBuilder.css";

const ProfileBuilderAutoOpenContext = createContext(false);

export function ProfileBuilderAutoOpen({ children }: { children: ReactNode }) {
  return (
    <ProfileBuilderAutoOpenContext.Provider value>
      {children}
    </ProfileBuilderAutoOpenContext.Provider>
  );
}

export function ProfileQueryBuilderField({
  input,
  rootValue,
  onRootChange
}: {
  input: ReactNode;
  rootValue: ProfileDraft;
  onRootChange?: ((next: Record<string, unknown>) => void) | undefined;
}) {
  const [open, setOpen] = useState(false);
  const autoOpen = useContext(ProfileBuilderAutoOpenContext);
  const autoOpened = useRef(false);
  const connection = rootValue.provider?.connection ?? "";
  const connectionID = savedConnectionID(connection);

  useEffect(() => {
    if (!autoOpen || autoOpened.current || !connectionID || !onRootChange) {
      return;
    }
    autoOpened.current = true;
    setOpen(true);
  }, [autoOpen, connectionID, onRootChange]);

  return (
    <div className="min-w-0 space-y-2">
      {input}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!connectionID || !onRootChange}
          title={
            connectionID
              ? "Browse the saved connection and sample rows"
              : "Choose a saved connection before opening the builder"
          }
          onClick={() => setOpen(true)}
        >
          <Icon icon={UiDatabase} className="size-4" />
          Build from connection
        </Button>
        {!connectionID ? (
          <span className="text-xs text-muted-foreground">
            Choose a saved connection to browse its catalog and sample rows.
            Inline URLs can still be configured manually.
          </span>
        ) : null}
      </div>
      {open && connectionID && onRootChange ? (
        <ProfileBuilderWorkspace
          connectionID={connectionID}
          rootValue={rootValue}
          onApply={onRootChange}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
