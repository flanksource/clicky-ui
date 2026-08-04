import { ErrorWrapper } from "@flanksource/clicky-ui";

const DEMO_ERROR = new Error("Unable to load workspace tenant-x", {
  cause: "GET /api/workspaces/tenant-x returned HTTP 503",
});
DEMO_ERROR.stack = [
  "Error: Unable to load workspace tenant-x",
  "    at loadWorkspace (src/workspaces/loadWorkspace.ts:42:11)",
  "    at WorkspacePage (src/workspaces/WorkspacePage.tsx:18:5)",
  "    at renderWithHooks (node_modules/react-dom/client.js:5529:22)",
].join("\n");

function BrokenWorkspace(): never {
  throw DEMO_ERROR;
}

export function ErrorWrapperDemo() {
  return (
    <div className="-m-density-4">
      <ErrorWrapper>
        <BrokenWorkspace />
      </ErrorWrapper>
    </div>
  );
}
