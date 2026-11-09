import { useEffect } from "react";
import { DensityProvider, RouterProvider, ThemeProvider, useBrowserRouter, useDensity, useTheme } from "@flanksource/clicky-ui";

type FrameData = { theme: "light" | "dark"; density: "compact" | "comfortable" | "spacious"; annotations: "visible" | "hidden"; showRejected: boolean };

export function FrameProviders({ data, children }: { data: FrameData; children: React.ReactNode }) {
  if (!data || !["light", "dark"].includes(data.theme) || !["compact", "comfortable", "spacious"].includes(data.density) || !["visible", "hidden"].includes(data.annotations) || typeof data.showRejected !== "boolean") throw new Error("Invalid playground frame data");
  const router = useBrowserRouter();
  return <ThemeProvider defaultTheme={data.theme}><DensityProvider defaultDensity={data.density}><RouterProvider adapter={router}><Sync data={data} /><div data-playground-annotations={data.annotations} data-show-rejected={data.showRejected} className="min-h-screen bg-background p-4 text-foreground">{children}</div></RouterProvider></DensityProvider></ThemeProvider>;
}

function Sync({ data }: { data: FrameData }) {
  const { setTheme } = useTheme();
  const { setDensity } = useDensity();
  useEffect(() => { setTheme(data.theme); setDensity(data.density); }, [data.theme, data.density, setTheme, setDensity]);
  return null;
}
