import {
  Button,
  DensityProvider,
  ThemeProvider,
  useDensity,
  useTheme,
  type Density,
  type Theme,
} from "@flanksource/clicky-ui";

const THEMES: Theme[] = ["light", "dark", "system"];
const DENSITIES: Density[] = ["compact", "comfortable", "spacious"];

function Switcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { density, setDensity } = useDensity();

  return (
    <div className="flex flex-wrap items-center gap-density-3 rounded-lg border p-density-3">
      <label className="flex items-center gap-density-2 text-sm">
        <span>Theme</span>
        <select
          value={theme}
          onChange={(event) =>
            setTheme((event.target as HTMLSelectElement).value as Theme)
          }
          className="h-control-h rounded-md border bg-background px-2"
          data-testid="theme-select"
        >
          {THEMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground" data-testid="resolved-theme">
          (resolved: {resolvedTheme})
        </span>
      </label>
      <label className="flex items-center gap-density-2 text-sm">
        <span>Density</span>
        <select
          value={density}
          onChange={(event) =>
            setDensity((event.target as HTMLSelectElement).value as Density)
          }
          className="h-control-h rounded-md border bg-background px-2"
          data-testid="density-select"
        >
          {DENSITIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function Showcase() {
  return (
    <section className="space-y-density-3">
      <h2 className="text-xl font-semibold">Button</h2>
      <div className="flex flex-wrap gap-density-2">
        <Button>Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex flex-wrap items-center gap-density-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
    </section>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <DensityProvider>
        <main className="mx-auto flex max-w-4xl flex-col gap-density-4 p-density-4">
          <header className="space-y-density-2">
            <h1 className="text-2xl font-bold">Clicky UI — Kitchen Sink</h1>
            <p className="text-muted-foreground">
              Preact-hosted showcase consuming{" "}
              <code>@flanksource/clicky-ui</code> via{" "}
              <code>preact/compat</code>.
            </p>
          </header>
          <Switcher />
          <Showcase />
        </main>
      </DensityProvider>
    </ThemeProvider>
  );
}
