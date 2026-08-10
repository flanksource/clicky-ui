import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { JSONPathField } from "./JSONPathField";
import type { JSONPathEvalRequest, JSONPathEvalResult } from "./JSONPathPlayground";

// Deeper than the dropdown's 12-level cap, so "the playground goes further" is
// something the test can actually observe rather than assert about a constant.
function deepRow(depth: number) {
  let value: unknown = "leaf";
  for (let i = 0; i < depth; i += 1) value = { down: value };
  return { nested: value };
}

function Field({
  json,
  rows,
  evaluate,
  onSelectPath,
  initial = "$",
}: {
  json: unknown;
  rows?: unknown[];
  evaluate?: (request: JSONPathEvalRequest) => Promise<JSONPathEvalResult>;
  onSelectPath?: (path: string, context: { root?: string }) => void;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <JSONPathField
      aria-label="Records"
      json={json}
      value={value}
      onChange={setValue}
      {...(rows ? { rows } : {})}
      {...(evaluate ? { evaluate } : {})}
      {...(onSelectPath ? { onSelectPath } : {})}
    />
  );
}

function openPlayground() {
  fireEvent.click(screen.getByRole("button", { name: "Browse Records JSON paths" }));
  fireEvent.click(screen.getByRole("button", { name: "Open playground…" }));
  return screen.getByRole("tree", { name: "JSON paths" });
}

/**
 * Reveals `path`'s children, tolerating the levels `defaultOpen` already opened
 * — clicking one of those would collapse it instead.
 */
async function expand(tree: HTMLElement, path: string) {
  const row = within(tree).getByText(path);
  if (row.closest("[role=treeitem]")?.getAttribute("aria-expanded") === "false") {
    fireEvent.click(row);
  }
  await waitFor(() =>
    expect(within(tree).getAllByText(new RegExp(`^${escapeRegExp(path)}[.[]`)).length).toBeGreaterThan(0),
  );
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("JSONPathPlayground", () => {
  it("opens from the dropdown and closes it behind itself", () => {
    render(<Field json={{ a: 1 }} />);

    openPlayground();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(document.querySelector('[data-slot="tree-picker-popup"]')).toBeNull();
  });

  it("descends past the depth the dropdown stops at", async () => {
    render(<Field json={deepRow(16)} />);

    // The dropdown truncates at depth 12: $.nested plus 11 more levels.
    fireEvent.click(screen.getByRole("button", { name: "Browse Records JSON paths" }));
    const dropdown = document.querySelector('[data-slot="tree-picker-popup"]') as HTMLElement;
    expect(within(dropdown).queryByText(`$.nested${".down".repeat(12)}`)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open playground…" }));

    const tree = screen.getByRole("tree", { name: "JSON paths" });
    for (let i = 0; i < 16; i += 1) {
      await expand(tree, `$.nested${".down".repeat(i)}`);
    }

    expect(within(tree).getByText(`$.nested${".down".repeat(16)}`)).toBeInTheDocument();
  });

  it("browses every array element, not only the first", async () => {
    render(<Field json={{ items: ["a", "b", "c"] }} />);
    const tree = openPlayground();

    await expand(tree, "$.items");

    expect(within(tree).getByText("$.items[2]")).toBeInTheDocument();
    expect(within(tree).getByText("$.items[1]")).toBeInTheDocument();
  });

  it("commits the selected path back to the field", async () => {
    render(<Field json={{ messages: [{ payload: "hello" }] }} />);
    const tree = openPlayground();

    await expand(tree, "$.messages");
    fireEvent.click(within(tree).getByText("$.messages[0]"));
    fireEvent.click(screen.getByRole("button", { name: "Use path" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("textbox", { name: "Records" })).toHaveValue("$.messages[0]");
  });

  it("switches between sampled rows so a field absent from the first is reachable", async () => {
    render(<Field json={{ id: 1 }} rows={[{ id: 1 }, { id: 2, extra: "only here" }]} />);
    const tree = openPlayground();

    expect(within(tree).queryByText("$.extra")).toBeNull();
    fireEvent.change(screen.getByLabelText("Sample row"), { target: { value: "1" } });

    await waitFor(() => expect(within(tree).getByText("$.extra")).toBeInTheDocument());
  });

  it("descends into a JSON-encoded column and commits the source it is rooted at", async () => {
    const onSelectPath = vi.fn();
    render(
      <Field
        json={{ payload: '{"status":"OPEN"}' }}
        onSelectPath={onSelectPath}
      />,
    );
    const tree = openPlayground();

    await waitFor(() => expect(within(tree).getByText("$.status")).toBeInTheDocument());
    fireEvent.click(within(tree).getByText("$.status"));

    // onSelectPath writes the root itself, so the banner says it will be set
    // rather than telling the author to go and set it.
    expect(screen.getByText(/Applying it sets the column's/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Use path" }));
    expect(onSelectPath).toHaveBeenCalledWith("$.status", { root: "payload" });
  });

  // A column that already declares a source has its path written against that
  // column decoded. Browsing and evaluating from the row instead would report no
  // matches for a column that works, and invite an author to "fix" it.
  it("browses and evaluates from the column's declared source", async () => {
    const evaluate = vi.fn(async () => ({ matches: ["ada@example.com"], count: 1 }));
    const row = { payload: '{"user":{"email":"ada@example.com"}}', other: 1 };
    render(
      <JSONPathField
        aria-label="Records"
        json={row}
        value="$.user.email"
        onChange={vi.fn()}
        source="payload"
        evaluate={evaluate}
      />,
    );
    const tree = openPlayground();

    // The tree offers source-rooted paths, the same language the value is in.
    await waitFor(() => expect(within(tree).getByText("$.user")).toBeInTheDocument());
    expect(within(tree).queryByText("$.payload")).toBeNull();
    expect(within(tree).queryByText("$.other")).toBeNull();

    await waitFor(() =>
      expect(evaluate).toHaveBeenCalledWith({ jsonpath: "$.user.email", source: "payload", row }),
    );
    expect(screen.getByText(/already the column's/)).toBeInTheDocument();
  });

  it("tells an author who must pair the source by hand to do so", async () => {
    render(<Field json={{ payload: '{"status":"OPEN"}' }} />);
    const tree = openPlayground();

    await waitFor(() => expect(within(tree).getByText("$.status")).toBeInTheDocument());
    fireEvent.click(within(tree).getByText("$.status"));

    // Without onSelectPath the committed path drops the root, so the dialog has
    // to say the pairing is still outstanding.
    expect(screen.getByText(/must be set to/)).toBeInTheDocument();
  });

  it("reports the match count and the field the path is filterable as", async () => {
    const evaluate = vi.fn(async () => ({
      matches: ["ada@example.com"],
      count: 1,
      filterField: "metadata.email",
    }));
    render(<Field json={{ metadata: { email: "ada@example.com" } }} evaluate={evaluate} initial="$.metadata.email" />);
    openPlayground();

    await waitFor(() => expect(screen.getByText("1 match")).toBeInTheDocument());
    expect(screen.getByText("metadata.email")).toBeInTheDocument();
    expect(evaluate).toHaveBeenCalledWith({
      jsonpath: "$.metadata.email",
      row: { metadata: { email: "ada@example.com" } },
    });
  });

  it("shows the evaluator's parse error instead of pretending the path matched nothing", async () => {
    const evaluate = vi.fn(async () => ({
      matches: [],
      count: 0,
      error: `jsonpath "$.[" is invalid: expected a child name`,
    }));
    render(<Field json={{ a: 1 }} evaluate={evaluate} initial="$.[" />);
    openPlayground();

    await waitFor(() =>
      expect(screen.getByText(/is invalid: expected a child name/)).toBeInTheDocument(),
    );
    expect(screen.queryByText("0 matches")).toBeNull();
  });
});
