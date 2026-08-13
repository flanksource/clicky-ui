import { useState } from "react";
import { AccordionList, Badge } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

type Route = { path: string; method: string; upstream: string };

const ROUTES: Route[] = [
  { path: "/api/v1/users", method: "GET", upstream: "users-svc:8080" },
  { path: "/api/v1/events", method: "POST", upstream: "events-svc:8080" },
  { path: "/api/v1/health", method: "GET", upstream: "gateway:8080" },
];

type Middleware = { name: string; phase: string; config: string };

const MIDDLEWARES: Middleware[] = [
  { name: "rate-limit", phase: "pre-auth", config: "100 req/min per token" },
  { name: "jwt-verify", phase: "auth", config: "RS256, 5m clock skew" },
  { name: "access-log", phase: "post-response", config: "json, sampled 1:10" },
];

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="flex items-center gap-density-2 text-sm">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <input
        className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function AccordionListDemo() {
  const [routes, setRoutes] = useState(ROUTES);
  const [middlewares, setMiddlewares] = useState(MIDDLEWARES);

  return (
    <DemoSection
      id="accordion-list"
      title="AccordionList"
      description="A list of items collapsed to one row each, expanding one at a time. renderHeader / renderBody are the only content you supply; reorder, duplicate, remove and the add row are each opt-in."
    >
      <p className="text-xs text-muted-foreground">
        Full editor — <code>allowReorder allowDuplicate allowRemove</code> plus{" "}
        <code>onCreate</code>. Arrow keys, Home and End rove across the rows and onto the add row.
      </p>
      <AccordionList<Route>
        items={routes}
        onChange={setRoutes}
        summary={routes.length === 1 ? "1 route" : `${routes.length} routes`}
        itemLabel={({ item }) => item.path || "new route"}
        allowReorder
        allowDuplicate
        allowRemove
        onCreate={() => ({ path: "", method: "GET", upstream: "" })}
        addLabel="Add route"
        addDescription="A route forwards one path to one upstream service."
        renderHeader={({ item, index }) => (
          <>
            {/* The header renders inside the disclosure button, so nothing in it
                may be interactive — a copyable Badge would be a nested button. */}
            <Badge variant="outline" clickToCopy={false}>
              {item.method}
            </Badge>
            <span className="shrink-0 text-sm font-medium">
              {item.path || `Route ${index + 1}`}
            </span>
            <code className="truncate font-mono text-xs text-muted-foreground">{item.upstream}</code>
          </>
        )}
        renderBody={({ item, onChange }) => (
          <div className="flex flex-col gap-density-2">
            <Field label="Path" value={item.path} onChange={(path) => onChange({ ...item, path })} />
            <Field
              label="Upstream"
              value={item.upstream}
              onChange={(upstream) => onChange({ ...item, upstream })}
            />
          </div>
        )}
      />

      <p className="text-xs text-muted-foreground">
        Reorder only — no add row, no duplicate, no delete. The same component, different opt-ins.
      </p>
      <AccordionList<Middleware>
        items={middlewares}
        onChange={setMiddlewares}
        allowReorder
        itemLabel={({ item }) => item.name}
        renderHeader={({ item }) => (
          <span className="shrink-0 text-sm font-medium">{item.name}</span>
        )}
        renderBody={({ item }) => (
          <dl className="grid grid-cols-[6rem_1fr] gap-x-density-3 text-sm">
            <dt className="text-muted-foreground">Phase</dt>
            <dd>{item.phase}</dd>
            <dt className="text-muted-foreground">Config</dt>
            <dd className="font-mono text-xs">{item.config}</dd>
          </dl>
        )}
      />
    </DemoSection>
  );
}
