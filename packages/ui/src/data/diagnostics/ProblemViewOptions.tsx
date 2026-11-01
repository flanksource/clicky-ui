import type { ReactNode } from "react";
import { DropdownMenu } from "../../overlay/DropdownMenu";

export function ProblemViewOptions({
  active,
  children,
}: {
  active: number;
  children: ReactNode;
}) {
  return (
    <DropdownMenu
      label={`View Options${active ? ` (${active})` : ""}`}
      menuLabel="Problem view options"
      variant="ghost"
      menuClassName="max-h-[70vh] w-80 overflow-y-auto p-3"
    >
      {() => <div className="space-y-3">{children}</div>}
    </DropdownMenu>
  );
}
