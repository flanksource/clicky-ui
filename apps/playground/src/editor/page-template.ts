import { humanizeSlug } from "../registry";

/** PascalCase component name for a slug: `dashboards/agent-inbox` → `AgentInbox`. */
export function componentName(slug: string): string {
  const leaf = slug.split("/").pop() ?? slug;
  const pascal = leaf
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  // A component must start with a letter, and JSX requires an uppercase name.
  return /^[A-Za-z]/.test(pascal) ? pascal : `Page${pascal}`;
}

export function pageTemplate(slug: string, title = humanizeSlug(slug)): string {
  return `export const meta = { title: ${JSON.stringify(title)} };

export default function ${componentName(slug)}() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{${JSON.stringify(title)}}</h1>
      <p className="text-muted-foreground">Start building.</p>
    </div>
  );
}
`;
}
