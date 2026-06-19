import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/react-vite";

import * as projectAnnotations from "./preview";

// Applies this Storybook's global configuration — the decorators, parameters and
// globals declared in preview.tsx — to every story rendered by the @vitest/browser
// tests. Without it the stories render outside the ThemeProvider/DensityProvider
// decorator, so theme/density hooks throw "must be used inside <ThemeProvider>".
const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);
