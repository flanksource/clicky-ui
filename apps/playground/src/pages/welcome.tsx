import { Button } from "@flanksource/clicky-ui";

export const meta = {
  title: "Welcome",
  description: "How the playground works2",
};

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {n}
      </span>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </li>
  );
}

export default function Welcome() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Playground</h1>
        <p className="text-muted-foreground">
          A scratch surface for one-page TSX artifacts. Drop a file in{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            src/pages/
          </code>
          , show it to someone, collect their notes, hand the whole thing to an
          agent.
        </p>
      </header>

      <ol className="space-y-4">
        <Step n={1} title="Create an artifact">
          Add{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            src/pages/my-idea.tsx
          </code>{" "}
          with a default-exported component. It shows up in the sidebar
          immediately — no catalog to edit. Optionally{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            export const meta = {"{ title, description }"}
          </code>
          . Nest files in a folder to group them in the nav.
        </Step>

        <Step n={2} title="Grab an element for your agent">
          Hover anything and press{" "}
          <kbd className="rounded border border-border px-1 text-xs">⌘C</kbd>.
          react-grab copies the element, its React component stack and its
          source location — paste it into Claude Code.
        </Step>

        <Step n={3} title="Leave anchored feedback">
          Press{" "}
          <kbd className="rounded border border-border px-1 text-xs">c</kbd> (or
          the Comment button), click an element, and write a note. Pins are
          anchored to the element and persist to{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            apps/playground/.playground/comments.json
          </code>
          , together with its React component/source path, a 4 KB HTML snapshot,
          and a screenshot attempt. If browser capture is unavailable or
          cancelled, the note is still saved with that state recorded
          explicitly.
        </Step>

        <Step n={4} title="Hand the notes over">
          <span className="font-medium text-foreground">Copy feedback</span>{" "}
          puts every note on this page — note, status, replies, React source
          context, HTML, screenshot link, and absolute URLs for replying or
          marking the thread resolved — on the clipboard as markdown. Each
          comment's Copy action does the same for its whole thread, and Maximise
          previews that Markdown in a tab. The toolbar dropdown widens the copy
          to the unresolved notes on this page, or to every page at once. An
          agent can also skip the clipboard entirely and call{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            /__playground/comments
          </code>{" "}
          to list, reply to and resolve notes directly — see the playground
          README.
        </Step>
      </ol>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold">What you can build with</h2>
        <p className="text-sm text-muted-foreground">
          The full{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            @flanksource/clicky-ui
          </code>{" "}
          library, the theme tokens (try the theme and density switchers above),
          plain Tailwind, and any Iconify icon by name.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Library button</Button>
          <Button variant="outline">Outline</Button>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-sm">
            <iconify-icon
              icon="ph:rocket-launch-duotone"
              width="18"
              height="18"
            />
            any iconify name
          </span>
        </div>
      </section>
    </div>
  );
}
