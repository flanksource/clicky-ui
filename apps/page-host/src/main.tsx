import { createRoot } from "react-dom/client";
import { DensityProvider, ErrorWrapper, ThemeProvider } from "@flanksource/clicky-ui";
import { App } from "./App";
import "@flanksource/clicky-ui/styles.css";
import "./styles.css";

const root = document.getElementById("app");
if (!root) throw new Error("#app root is missing");
createRoot(root).render(<ErrorWrapper><ThemeProvider><DensityProvider><App /></DensityProvider></ThemeProvider></ErrorWrapper>);
