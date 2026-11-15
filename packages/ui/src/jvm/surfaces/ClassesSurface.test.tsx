import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveBlob } from "../classes/class-download";
import type { ClassesSurfaceState } from "../classes/classes-state";
import type { MonacoEditorProps } from "../../monaco/types";
import { APP_LOADER, CLASS_LOADERS, classSourceFixture } from "../fixtures/classes";
import { fakeJvmClient, type FakeJvmClient } from "../fixtures/fake-client";
import type { JvmDiagnosticsClient } from "../protocol/client";
import type { JvmStatus } from "../protocol/types";
import { ClassesSurface, type ClassesSurfaceProps } from "./ClassesSurface";
import { JvmProvider } from "./JvmProvider";

vi.mock("../../data/code-highlight", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../data/code-highlight")>()),
  highlightToLines: vi.fn(async () => null),
}));
vi.mock("../classes/class-download", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../classes/class-download")>()),
  saveBlob: vi.fn(),
}));
vi.mock("../../monaco/MonacoEditor", () => ({
  MonacoEditor: function FakeMonacoEditor(props: MonacoEditorProps) {
    return <textarea aria-label="Replacement source" value={props.value} onChange={(event) => props.onChange?.(event.target.value)} />;
  },
}));

const CLASS = "com.example.orders.OrderService";
const FIXTURE = classSourceFixture(CLASS, APP_LOADER);
const CHECKOUT = "checkout(Ljava/lang/String;)D";
const OPEN: ClassesSurfaceState = { class: CLASS, loader: APP_LOADER };

type Change = { next: ClassesSurfaceState; options: { replace: boolean } | undefined };

function renderSurface(
  initial: ClassesSurfaceState,
  { status = { allowMutation: true }, client = fakeJvmClient({ status }), ...props }: { status?: JvmStatus; client?: JvmDiagnosticsClient } & Partial<ClassesSurfaceProps> = {},
) {
  const changes: Change[] = [];
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  function Harness() {
    const [state, setState] = useState(initial);
    return (
      <JvmProvider client={client} scope="test">
        <ClassesSurface
          state={state}
          onStateChange={(next, options) => {
            changes.push({ next, options });
            setState(next);
          }}
          {...props}
        />
      </JvmProvider>
    );
  }
  render(
    <QueryClientProvider client={queryClient}>
      <Harness />
    </QueryClientProvider>,
  );
  return { client: client as FakeJvmClient, changes, queryClient };
}

const row = (index: number) => {
  const element = document.querySelector<HTMLElement>(`[data-row="${index}"]`);
  if (!element) throw new Error(`no row ${index}`);
  return element;
};
const editButton = async () => {
  const button = await screen.findByRole("button", { name: "Edit" });
  await waitFor(() => expect(button).toBeEnabled());
  return button;
};
const editDraft = async (suffix = "\n// patched\n") => {
  fireEvent.click(await editButton());
  const editor = await screen.findByRole("textbox", { name: "Replacement source" });
  fireEvent.change(editor, { target: { value: FIXTURE.source + suffix } });
  return { editor, draft: FIXTURE.source + suffix };
};
const allowReplacing = async () => fireEvent.click(await screen.findByRole("checkbox", { name: "Allow replacing class bytecode" }));

beforeEach(() => vi.clearAllMocks());

describe("ClassesSurface browsing", () => {
  it("opens a class picked in the tree with its loader, clearing any method and line, and reads it decompiled", async () => {
    const { changes } = renderSurface({ q: "OrderService", method: "old", line: "9" });
    fireEvent.click(within(await screen.findByRole("treeitem", { name: CLASS })).getByText("OrderService"));
    expect(changes.at(-1)).toEqual({ next: { q: "OrderService", class: CLASS, loader: APP_LOADER }, options: undefined });
    expect(await screen.findByText(/CFR 0\.152/)).toBeInTheDocument();
    expect(row(15)).toHaveTextContent("inventory.reserve(order);");
    expect(screen.getByRole("combobox", { name: "Jump to method" })).toHaveTextContent("checkout(String)");
  });

  it("lists platform classes when state asks for them, and reports a browsed-loader change", async () => {
    const { changes } = renderSurface({ q: "Thread", platform: "true" });
    expect(await screen.findByRole("treeitem", { name: "java.lang.Thread" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Include platform classes" })).toBeChecked();
    fireEvent.change(screen.getByRole("combobox", { name: "Class loader" }), { target: { value: "bootstrap" } });
    expect(changes.at(-1)).toEqual({ next: { q: "Thread", platform: "true", loader: "bootstrap" }, options: undefined });
  });

  it("toggles platform classes as a refinement of the view", async () => {
    const { changes } = renderSurface({});
    fireEvent.click(await screen.findByRole("checkbox", { name: "Include platform classes" }));
    expect(changes.at(-1)).toEqual({ next: { platform: "true" }, options: { replace: true } });
  });

  it("loads further pages on request until every class is listed", async () => {
    const base = fakeJvmClient();
    const paged: JvmDiagnosticsClient = { ...base, classes: (query, options) => base.classes({ ...query, limit: 4 }, options) };
    renderSurface({}, { client: paged });
    expect(await screen.findByText("4 of 9 classes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(await screen.findByText("8 of 9 classes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(await screen.findByText("9 of 9 classes")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });

  it("explains a class that cannot be decompiled", async () => {
    renderSurface({ class: "com.example.Missing", loader: APP_LOADER });
    expect(await screen.findByText("Decompiling failed")).toBeInTheDocument();
    expect(screen.getAllByText(/ClassNotFoundException/).length).toBeGreaterThan(0);
  });

  it("invites a class pick when none is in state", async () => {
    renderSurface({});
    expect(await screen.findByText(/pick a class to read its decompiled source/)).toBeInTheDocument();
  });

  it("lists patched classes under the tree and opens one", async () => {
    const { changes } = renderSurface({});
    const list = (await screen.findByText("Patched in this JVM (1)")).parentElement!;
    fireEvent.click(within(list).getByRole("button", { name: CLASS }));
    expect(changes.at(-1)?.next).toEqual({ class: CLASS, loader: APP_LOADER });
  });

  it("decorates the tree with the host's class badge", async () => {
    renderSurface({ q: "Ledger" }, { renderClassBadge: (ref) => <span data-testid="badge">{ref.name.split(".").length} segments</span> });
    expect(await screen.findByTestId("badge")).toHaveTextContent("4 segments");
  });
});

describe("ClassesSurface reading a class", () => {
  it("folds to the method named in state and says how much is hidden", async () => {
    renderSurface({ ...OPEN, method: CHECKOUT });
    expect(await screen.findByRole("button", { name: "Show 13 hidden lines above" })).toBeInTheDocument();
    expect([...document.querySelectorAll("[data-row]")].map((element) => element.getAttribute("data-row"))).toEqual(["13", "14", "15", "16", "17", "18"]);
    expect(screen.getByRole("combobox", { name: "Jump to method" })).toHaveValue(CHECKOUT);
  });

  it("highlights the row of a bytecode line from state", async () => {
    renderSurface({ ...OPEN, line: "19" });
    await screen.findByText(/CFR 0\.152/);
    expect(row(16)).toHaveAttribute("data-highlighted", "true");
  });

  it("explains a line the decompiled source has no row for", async () => {
    renderSurface({ ...OPEN, line: "3" });
    expect(await screen.findByText(`Line 3 is not in the decompiled source of ${CLASS}.`)).toBeInTheDocument();
  });

  it("jumping to a method replaces the view's state and drops a stale line", async () => {
    const { changes } = renderSurface({ ...OPEN, line: "19" });
    await screen.findByText(/CFR 0\.152/);
    fireEvent.change(screen.getByRole("combobox", { name: "Jump to method" }), { target: { value: CHECKOUT } });
    expect(changes.at(-1)).toEqual({ next: { ...OPEN, method: CHECKOUT }, options: { replace: true } });
  });

  it("puts a clicked row's bytecode line in state, and clears it for a row the gutter leaves blank", async () => {
    const { changes } = renderSurface(OPEN);
    await screen.findByText(/CFR 0\.152/);
    fireEvent.click(row(15));
    expect(changes.at(-1)).toEqual({ next: { ...OPEN, line: "18" }, options: { replace: true } });
    fireEvent.click(row(0));
    expect(changes.at(-1)).toEqual({ next: OPEN, options: { replace: true } });
  });

  it("offers Trace method only when a host handler exists, enabled once a method is picked", async () => {
    const onTraceMethod = vi.fn();
    renderSurface({ ...OPEN, method: CHECKOUT }, { onTraceMethod });
    const trace = await screen.findByRole("button", { name: "Trace method" });
    await waitFor(() => expect(trace).toBeEnabled());
    fireEvent.click(trace);
    expect(onTraceMethod).toHaveBeenCalledWith({ class: CLASS, loader: APP_LOADER, method: CHECKOUT });
  });

  it("disables Trace method until a method is picked", async () => {
    renderSurface(OPEN, { onTraceMethod: vi.fn() });
    expect(await screen.findByRole("button", { name: "Trace method" })).toBeDisabled();
  });

  it("has no Trace method action without a host handler", async () => {
    renderSurface(OPEN);
    await screen.findByText(/CFR 0\.152/);
    expect(screen.queryByRole("button", { name: "Trace method" })).toBeNull();
  });

  it("renders host source actions with the decompiled class", async () => {
    renderSurface(OPEN, { sourceActions: (source) => <span data-testid="action">{source.digest}</span> });
    expect(await screen.findByTestId("action")).toHaveTextContent(FIXTURE.digest);
  });

  it("downloads the class file under the class's name", async () => {
    renderSurface(OPEN);
    await screen.findByText(/CFR 0\.152/);
    fireEvent.click(screen.getByRole("button", { name: "Download .class" }));
    await waitFor(() => expect(saveBlob).toHaveBeenCalledOnce());
    expect(vi.mocked(saveBlob).mock.calls[0]?.[0]).toBe("com.example.orders.OrderService.class");
  });

  it("downloads the decompiled source", async () => {
    renderSurface(OPEN);
    await screen.findByText(/CFR 0\.152/);
    fireEvent.click(screen.getByRole("button", { name: "Download source" }));
    expect(vi.mocked(saveBlob).mock.calls[0]?.[0]).toBe("com.example.orders.OrderService.java");
  });
});

describe("ClassesSurface patching", () => {
  it("applies a patch only after the current draft compiled and the operator allowed it, then refreshes sources and patches", async () => {
    const { client, queryClient } = renderSurface(OPEN);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { draft } = await editDraft();

    const apply = screen.getByRole("button", { name: "Apply patch" });
    expect(apply).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Compile preview" }));
    expect(await screen.findByText("Compiles with 1 warning. Not applied yet.")).toBeInTheDocument();
    expect(apply).toBeDisabled();
    await allowReplacing();
    expect(apply).toBeEnabled();
    fireEvent.change(screen.getByRole("combobox", { name: "Restore original bytecode after" }), { target: { value: "300" } });
    fireEvent.click(apply);

    expect(await screen.findByText("Patch applied. The original bytecode is restored in 5 minutes.")).toBeInTheDocument();
    expect(client.mutations).toEqual([{ method: "patchClass", request: { class: CLASS, loader: APP_LOADER, source: draft, leaseSeconds: 300 } }]);
    expect(screen.queryByRole("textbox", { name: "Replacement source" })).toBeNull();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["jvm", "test", "class-source"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["jvm", "test", "patches"] });
  });

  it("withdraws apply when the draft changes after a clean compile", async () => {
    renderSurface(OPEN);
    const { editor } = await editDraft();
    await allowReplacing();
    fireEvent.click(screen.getByRole("button", { name: "Compile preview" }));
    await screen.findByText("Compiles with 1 warning. Not applied yet.");
    expect(screen.getByRole("button", { name: "Apply patch" })).toBeEnabled();
    fireEvent.change(editor, { target: { value: FIXTURE.source + "\n// patched again\n" } });
    expect(screen.getByRole("button", { name: "Apply patch" })).toBeDisabled();
    expect(screen.queryByText(/Not applied yet/)).toBeNull();
  });

  it("lists compiler errors and never enables apply for a draft that does not compile", async () => {
    const { client } = renderSurface(OPEN);
    await editDraft("\n// TODO compile error\n");
    await allowReplacing();
    fireEvent.click(screen.getByRole("button", { name: "Compile preview" }));
    expect(await screen.findByText("Compilation failed with 1 error.")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Compiler diagnostics" })).getByRole("listitem")).toHaveTextContent("incompatible types");
    expect(screen.getByRole("button", { name: "Apply patch" })).toBeDisabled();
    expect(client.mutations).toEqual([]);
  });

  it("keeps editing and shows the compiler's answer when the agent refuses a patch the preview accepted", async () => {
    const base = fakeJvmClient();
    const refusing: JvmDiagnosticsClient = {
      ...base,
      patchClass: async () => ({ success: false, diagnostics: [{ kind: "ERROR", line: 4, column: 1, message: "cannot find symbol" }] }),
    };
    renderSurface(OPEN, { client: refusing });
    await editDraft();
    await allowReplacing();
    fireEvent.click(screen.getByRole("button", { name: "Compile preview" }));
    await screen.findByText("Compiles with 1 warning. Not applied yet.");
    fireEvent.click(screen.getByRole("button", { name: "Apply patch" }));
    expect(await screen.findByText("Compilation failed with 1 error.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Replacement source" })).toBeInTheDocument();
  });

  it("surfaces a transport failure from the agent without leaving the editor", async () => {
    const base = fakeJvmClient();
    const failing: JvmDiagnosticsClient = { ...base, patchClass: async () => Promise.reject(new Error("redefinition failed: schema change not supported")) };
    renderSurface(OPEN, { client: failing });
    await editDraft();
    await allowReplacing();
    fireEvent.click(screen.getByRole("button", { name: "Compile preview" }));
    await screen.findByText("Compiles with 1 warning. Not applied yet.");
    fireEvent.click(screen.getByRole("button", { name: "Apply patch" }));
    expect(await screen.findByText("Patch failed")).toBeInTheDocument();
    expect(screen.getAllByText(/schema change not supported/).length).toBeGreaterThan(0);
    expect(screen.getByRole("textbox", { name: "Replacement source" })).toBeInTheDocument();
  });

  it("does not claim a patch the agent reported as not applied", async () => {
    const base = fakeJvmClient();
    const unapplied: JvmDiagnosticsClient = { ...base, patchClass: async () => ({ success: true, diagnostics: [], applied: false }) };
    renderSurface(OPEN, { client: unapplied });
    await editDraft();
    await allowReplacing();
    fireEvent.click(screen.getByRole("button", { name: "Compile preview" }));
    await screen.findByText("Compiles with 1 warning. Not applied yet.");
    fireEvent.click(screen.getByRole("button", { name: "Apply patch" }));
    expect(await screen.findByText("Patch failed")).toBeInTheDocument();
    expect(screen.queryByText(/Patch applied/)).toBeNull();
  });

  it("cancelling leaves the class unchanged and sends nothing", async () => {
    const { client } = renderSurface(OPEN);
    await editDraft();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(await screen.findByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(client.mutations).toEqual([]);
  });

  it("restores a patched class after the operator allows it, then refreshes the patch list", async () => {
    const { client } = renderSurface(OPEN);
    const restore = await screen.findByRole("button", { name: "Restore original" });
    expect(restore).toBeDisabled();
    await allowReplacing();
    fireEvent.click(restore);
    await waitFor(() => expect(client.mutations).toEqual([{ method: "restoreClass", request: { class: CLASS, loader: APP_LOADER } }]));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Restore original" })).toBeNull());
    expect(screen.queryByText(/Patched in this JVM/)).toBeNull();
  });

  it("explains that the agent refuses mutations and keeps restore and apply disabled", async () => {
    renderSurface(OPEN, { status: { allowMutation: false } });
    expect(await screen.findByText(/Runtime changes are disabled for this JVM/)).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Allow replacing class bytecode" })).toBeNull();
    expect(screen.getByRole("button", { name: "Restore original" })).toBeDisabled();
    await editDraft();
    fireEvent.click(screen.getByRole("button", { name: "Compile preview" }));
    await screen.findByText("Compiles with 1 warning. Not applied yet.");
    expect(screen.getByRole("button", { name: "Apply patch" })).toBeDisabled();
  });

  it("hides the consent control and keeps writes off when the host does not permit them", async () => {
    renderSurface(OPEN, { canMutate: false });
    expect(await screen.findByRole("button", { name: "Restore original" })).toBeDisabled();
    expect(screen.queryByRole("checkbox", { name: "Allow replacing class bytecode" })).toBeNull();
  });

  it("allows writing without a consent step when the host drops it", async () => {
    renderSurface(OPEN, { requireConsent: false });
    const restore = await screen.findByRole("button", { name: "Restore original" });
    await waitFor(() => expect(restore).toBeEnabled());
    expect(screen.queryByRole("checkbox", { name: "Allow replacing class bytecode" })).toBeNull();
  });

  it("locks the method picker while editing", async () => {
    renderSurface(OPEN);
    await editDraft();
    expect(screen.getByRole("combobox", { name: "Jump to method" })).toBeDisabled();
  });

  it("explains why a class in a loader group cannot be edited", async () => {
    const base = fakeJvmClient();
    const grouped: JvmDiagnosticsClient = { ...base, classLoaders: async () => [{ ...CLASS_LOADERS[0]!, virtual: true }] };
    renderSurface(OPEN, { client: grouped });
    const edit = await screen.findByRole("button", { name: "Edit" });
    await waitFor(() => expect(edit).toHaveAttribute("title", "This is a group of loaders; pick the loader that defines the class."));
    expect(edit).toBeDisabled();
  });

  it("explains that a JVM without instrumentation cannot replace classes", async () => {
    renderSurface(OPEN, { status: { allowMutation: true, instrumentation: false } });
    const edit = await screen.findByRole("button", { name: "Edit" });
    await waitFor(() => expect(edit).toHaveAttribute("title", "This JVM has no instrumentation attached, so classes cannot be replaced."));
    expect(edit).toBeDisabled();
  });
});
