import { act, fireEvent, render, screen } from "@testing-library/react";
import { HarEntryDetails, HarPanel } from "./HarPanel";
import {
  completedHarEntry,
  pendingHarEntry,
  sampleHarEntries,
  transportErrorHarEntry,
} from "./fixtures";

const SNAPSHOT_AT = new Date("2026-09-28T10:00:40.000Z");
const STARTED_40S_AGO = new Date("2026-09-28T10:00:00.000Z");
// The collector's elapsed-at-snapshot value; deliberately far from the 40s the
// clock says, so a row that reads `time` instead of `startedDateTime` shows.
const STALE_SNAPSHOT_MS = 1_500;
const PENDING_URL = "https://api.example.com/v1/cycles/run";
const ERROR_URL = "https://api.example.com/v1/activities/pending";
const TRANSPORT_ERROR = "context deadline exceeded";
const COMPLETED_BODY = "cycle accepted";

describe("HarPanel", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("keeps controlled search behavior and expands row details", () => {
    render(<HarPanel entries={sampleHarEntries} search="slow" />);

    expect(screen.getByText("https://api.example.com/v1/slow")).toBeInTheDocument();
    expect(screen.queryByText("https://api.example.com/v1/configs")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/filter url, method, or body/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("https://api.example.com/v1/slow"));

    expect(screen.getByText("Response Body")).toBeInTheDocument();
    expect(screen.getByText("Service Unavailable")).toBeInTheDocument();
  });

  it("loads a private body preview only after opening a row and links its full download", async () => {
    const entry = completedHarEntry(pendingHarEntry(STARTED_40S_AGO, STALE_SNAPSHOT_MS), "");
    const preview = vi.fn().mockResolvedValue("preview text");
    render(<HarPanel entries={[entry]} bodySource={{
      hasBody: (_, part) => part === "response",
      preview,
      downloadHref: () => "/api/v1/trace-results/http/stream/entries/request/body/response?download=1",
    }} />);
    expect(preview).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText(entry.request.url));
    expect(screen.getByText("Response Body")).toBeInTheDocument();
    expect(preview).toHaveBeenCalledOnce();
    expect(await screen.findByText("preview text")).toBeInTheDocument();
    expect(preview).toHaveBeenCalledWith(entry._id, "response");
    expect(screen.getByRole("link", { name: "Download full body" })).toHaveAttribute(
      "href", "/api/v1/trace-results/http/stream/entries/request/body/response?download=1",
    );
  });

  it("keeps the expanded body preview when a refreshed row has the same ID", async () => {
    const entry = completedHarEntry(pendingHarEntry(STARTED_40S_AGO, STALE_SNAPSHOT_MS), "");
    const preview = vi.fn().mockResolvedValue("preview text");
    const bodySource = {
      hasBody: () => true,
      preview,
      downloadHref: () => "/body",
    };
    const view = render(<HarPanel entries={[entry]} bodySource={bodySource} />);
    fireEvent.click(screen.getByText(entry.request.url));
    expect(await screen.findByText("preview text")).toBeInTheDocument();

    view.rerender(<HarPanel entries={[{ ...entry }]} bodySource={bodySource} />);

    expect(preview).toHaveBeenCalledOnce();
    expect(screen.getByText("preview text")).toBeInTheDocument();
  });

  it("renders a pending request detail outside a HarPanel table", () => {
    vi.useFakeTimers();
    vi.setSystemTime(SNAPSHOT_AT);
    render(<HarEntryDetails entry={pendingHarEntry(STARTED_40S_AGO, STALE_SNAPSHOT_MS)} />);
    expect(screen.getByText(/Waiting for response/)).toBeInTheDocument();
    expect(screen.getByText("40 s")).toBeInTheDocument();
  });

  it("shows a body read error in the expanded row", async () => {
    const entry = completedHarEntry(pendingHarEntry(STARTED_40S_AGO, STALE_SNAPSHOT_MS), "");
    render(<HarPanel entries={[entry]} bodySource={{
      hasBody: (_, part) => part === "response",
      preview: () => Promise.reject(new Error("body expired")),
      downloadHref: () => "/body",
    }} />);
    fireEvent.click(screen.getByText(entry.request.url));
    expect(await screen.findByRole("alert")).toHaveTextContent("body expired");
  });

  it("keeps the default row count summary when nothing is running", () => {
    render(<HarPanel entries={sampleHarEntries} />);

    expect(screen.getByText("4 of 4 rows")).toBeInTheDocument();
  });

  it("shows a pending row as running with an elapsed clock that ticks from startedDateTime", () => {
    vi.useFakeTimers();
    vi.setSystemTime(SNAPSHOT_AT);
    render(<HarPanel entries={[pendingHarEntry(STARTED_40S_AGO, STALE_SNAPSHOT_MS)]} />);

    expect(screen.getByText("running")).toBeInTheDocument();
    expect(screen.getByText("40 s")).toBeInTheDocument();
    expect(screen.queryByText("1.5 s")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2_000));

    expect(screen.getByText("42 s")).toBeInTheDocument();
  });

  it("falls back to the snapshot time when startedDateTime is unparseable", () => {
    vi.useFakeTimers();
    vi.setSystemTime(SNAPSHOT_AT);
    const entry = { ...pendingHarEntry(STARTED_40S_AGO, 7_000), startedDateTime: "not-a-date" };
    render(<HarPanel entries={[entry]} />);

    expect(screen.getByText("7 s")).toBeInTheDocument();
  });

  it("counts running requests in the summary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(SNAPSHOT_AT);
    render(
      <HarPanel
        entries={[...sampleHarEntries, pendingHarEntry(STARTED_40S_AGO, STALE_SNAPSHOT_MS)]}
      />,
    );

    expect(screen.getByText("5 of 5 rows · 1 running")).toBeInTheDocument();
  });

  it("mounts no clock without pending rows and clears the one it mounts on unmount", () => {
    vi.useFakeTimers();
    vi.setSystemTime(SNAPSHOT_AT);
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    const idle = render(<HarPanel entries={sampleHarEntries} />);
    expect(setIntervalSpy).not.toHaveBeenCalled();
    idle.unmount();

    const live = render(
      <HarPanel entries={[pendingHarEntry(STARTED_40S_AGO, STALE_SNAPSHOT_MS)]} />,
    );
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    const clockId = setIntervalSpy.mock.results[0]?.value;

    live.unmount();

    expect(clearIntervalSpy).toHaveBeenCalledWith(clockId);
  });

  it("renders a transport error as ERR with the error text in the row and the details", () => {
    render(
      <HarPanel entries={[transportErrorHarEntry(STARTED_40S_AGO, TRANSPORT_ERROR)]} />,
    );

    expect(screen.getByText("ERR")).toBeInTheDocument();
    expect(screen.getAllByText(TRANSPORT_ERROR)).toHaveLength(1);

    fireEvent.click(screen.getByText(ERROR_URL));

    expect(screen.getByText("Transport Error")).toBeInTheDocument();
    expect(screen.getAllByText(TRANSPORT_ERROR)).toHaveLength(2);
  });

  it("keeps an expanded pending row open when the same _id arrives completed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(SNAPSHOT_AT);
    const pending = pendingHarEntry(STARTED_40S_AGO, STALE_SNAPSHOT_MS);
    const view = render(<HarPanel entries={[pending]} />);

    fireEvent.click(screen.getByText(PENDING_URL));
    expect(screen.getByText(/Waiting for response/)).toBeInTheDocument();

    view.rerender(<HarPanel entries={[completedHarEntry(pending, COMPLETED_BODY)]} />);

    expect(screen.queryByText(/Waiting for response/)).not.toBeInTheDocument();
    expect(screen.getByText("Response Body")).toBeInTheDocument();
    expect(screen.getByText(COMPLETED_BODY)).toBeInTheDocument();
  });

  it("does not render a pending row as a transport error", () => {
    vi.useFakeTimers();
    vi.setSystemTime(SNAPSHOT_AT);
    render(<HarPanel entries={[pendingHarEntry(STARTED_40S_AGO, STALE_SNAPSHOT_MS)]} />);

    expect(screen.getByText(PENDING_URL)).toBeInTheDocument();
    expect(screen.queryByText("ERR")).not.toBeInTheDocument();
  });
});
