import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import { ErrorWrapper, setFallbackIconProvider } from "@flanksource/clicky-ui";
import { clickyIconProvider } from "@flanksource/clicky-ui/icons";
import { BookmarkletPanel } from "./bookmarklet/BookmarkletPanel";
import "@flanksource/clicky-ui/styles.css";
import "./styles.css";
const bookmarklet =
  new URLSearchParams(location.search).get("bookmarklet") === "1";
const App = lazy(() =>
  import("./App").then((module) => ({ default: module.App })),
);
if (!bookmarklet) void import("react-grab");

// Schema-driven surfaces carry icons as runtime strings (x-enum-icons, x-icon,
// <Icon name="...">), which no import can resolve. Registering this package's
// own generated set is what turns those names into glyphs instead of `?`.
setFallbackIconProvider(clickyIconProvider());

// react-rnd (used by ChatWindow's draggable frame) reads `process.env` in its
// drag logger; the browser has no `process`, so provide a minimal shim.
(globalThis as { process?: { env: Record<string, string> } }).process ??= {
  env: {},
};

const root = document.getElementById("app");
if (!root) throw new Error("#app root not found");
createRoot(root).render(
  <ErrorWrapper>
    <Suspense fallback={<p>Loading playground…</p>}>
      {bookmarklet ? <BookmarkletPanel /> : <App />}
    </Suspense>
  </ErrorWrapper>,
);
