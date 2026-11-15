import { useEffect, useState, type ReactNode } from "react";
import { Section } from "../layout/Section";

export function FormObjectSection({
  title,
  actions,
  hasErrors,
  children,
}: {
  title: ReactNode;
  actions?: ReactNode;
  hasErrors: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(hasErrors);
  useEffect(() => {
    if (hasErrors) setOpen(true);
  }, [hasErrors]);
  return (
    <div className="col-span-full min-w-0">
      <Section title={title} summary={actions} open={open} onToggle={setOpen}>
        {children}
      </Section>
    </div>
  );
}
