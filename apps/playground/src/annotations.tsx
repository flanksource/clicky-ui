import { createContext, useContext, type ReactNode } from "react";

import type { AnnotationVisibility } from "./route";

const AnnotationVisibilityContext = createContext<AnnotationVisibility>("visible");

export function AnnotationVisibilityProvider({
  value,
  children,
}: {
  value: AnnotationVisibility;
  children: ReactNode;
}) {
  return (
    <AnnotationVisibilityContext.Provider value={value}>
      <div data-playground-annotations={value} className="contents">
        {children}
      </div>
    </AnnotationVisibilityContext.Provider>
  );
}

export function useAnnotationsHidden(): boolean {
  return useContext(AnnotationVisibilityContext) === "hidden";
}
