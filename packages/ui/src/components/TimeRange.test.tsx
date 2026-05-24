import { fireEvent, render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import { TimeRange } from "./TimeRange";

describe("TimeRange", () => {
  it("applies typed time range values from the custom inputs", () => {
    const onApply = vi.fn();

    render(<TimeRange from="now-24h" to="now" onApply={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /time range filter/i }));
    fireEvent.change(screen.getByLabelText("Time range from"), {
      target: { value: "-2h" },
    });
    fireEvent.change(screen.getByLabelText("Time range to"), {
      target: { value: "now" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith("now-2h", "now");
  });

  it("renders chip rows grouped by unit and applies a chip selection", () => {
    const onApply = vi.fn();

    render(<TimeRange from="now-1d" to="now" onApply={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /time range filter/i }));
    const filterList = screen.getByRole("list", { name: /time filters/i });

    const tokens = ["now-15m", "now-1h", "now-1d", "now-1w", "now-1M", "now-1y"];
    for (const token of tokens) {
      expect(within(filterList).getByRole("button", { name: token })).toBeInTheDocument();
    }

    expect(within(filterList).getByRole("button", { name: "now-1d" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(within(filterList).getByRole("button", { name: "now-1M" }));
    expect(onApply).toHaveBeenCalledWith("now-1M", "now");
  });

  it("falls back to the preset list when custom presets are provided for time", () => {
    const onApply = vi.fn();

    render(
      <TimeRange
        from=""
        to=""
        presets={[{ label: "Last hour", from: "now-1h", to: "now" }]}
        onApply={onApply}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /time range filter/i }));
    const filterList = screen.getByRole("list", { name: /time filters/i });
    fireEvent.click(within(filterList).getByRole("button", { name: /last hour/i }));

    expect(onApply).toHaveBeenCalledWith("now-1h", "now");
  });

  it("clears a custom field via the inline close icon", () => {
    const onApply = vi.fn();

    render(<TimeRange from="now-24h" to="now" onApply={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /time range filter/i }));
    fireEvent.change(screen.getByLabelText("Time range from"), {
      target: { value: "now-3h" },
    });

    fireEvent.click(screen.getByRole("button", { name: /clear time range from/i }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith("", "now");
  });

  it("renders chip rows for the date kind by default", () => {
    const onApply = vi.fn();

    render(<TimeRange kind="date" label="Date range" from="" to="" onApply={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /date range filter/i }));
    const filterList = screen.getByRole("list", { name: /time filters/i });

    expect(within(filterList).getByRole("button", { name: "now-1d" })).toBeInTheDocument();
    expect(within(filterList).getByRole("button", { name: "now-1w" })).toBeInTheDocument();
    expect(within(filterList).getByRole("button", { name: "now-1M" })).toBeInTheDocument();

    fireEvent.click(within(filterList).getByRole("button", { name: "now-7d" }));
    expect(onApply).toHaveBeenCalledWith("now-7d", "now");
  });

  it("opens a native date picker for the custom field when kind is date", () => {
    const onApply = vi.fn();

    const { container } = render(
      <TimeRange kind="date" label="Date range" from="" to="" onApply={onApply} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /date range filter/i }));

    const picker = container.querySelector('input[type="date"]') as HTMLInputElement & {
      showPicker?: () => void;
    };
    if (!picker) {
      throw new Error("Expected hidden date input for the custom field");
    }
    picker.showPicker = vi.fn();

    fireEvent.click(screen.getByRole("button", { name: /pick date range from/i }));
    expect(picker.showPicker).toHaveBeenCalledTimes(1);
  });

  it("renders date and time as separate inputs for the custom field when kind is time", () => {
    const onApply = vi.fn();

    const { container } = render(<TimeRange from="now-24h" to="now" onApply={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /time range filter/i }));

    const datePicker = container.querySelector('input[type="date"]') as HTMLInputElement & {
      showPicker?: () => void;
    };
    const timeInput = screen.getByLabelText("Time range from time") as HTMLInputElement;
    expect(datePicker).not.toBeNull();
    expect(timeInput).toHaveAttribute("type", "time");

    datePicker.showPicker = vi.fn();
    fireEvent.click(screen.getByRole("button", { name: /pick time range from/i }));
    expect(datePicker.showPicker).toHaveBeenCalledTimes(1);
  });

  it("composes a date and time selection into a datetime value on apply", () => {
    const onApply = vi.fn();

    render(<TimeRange from="" to="now" onApply={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /time range filter/i }));
    fireEvent.change(screen.getByLabelText("Time range from"), {
      target: { value: "2026-05-01" },
    });
    fireEvent.change(screen.getByLabelText("Time range from time"), {
      target: { value: "09:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith("2026-05-01T09:30", "now");
  });

  it("keeps the popover open when a date is picked from the native picker", () => {
    const onApply = vi.fn();

    const { container } = render(
      <TimeRange kind="date" label="Date range" from="" to="2026-05-05" onApply={onApply} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /date range filter/i }));
    expect(screen.getByRole("dialog", { name: /date range/i })).toBeInTheDocument();

    const picker = container.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(picker, { target: { value: "2026-04-15" } });

    expect(onApply).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: /date range/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Date range from")).toHaveValue("2026-04-15");

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith("2026-04-15", "2026-05-05");
  });

  it("accepts a typed date value alongside date math in the custom field", () => {
    const onApply = vi.fn();

    render(<TimeRange kind="date" label="Date range" from="" to="" onApply={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /date range filter/i }));
    fireEvent.change(screen.getByLabelText("Date range from"), {
      target: { value: "2026-04-01" },
    });
    fireEvent.change(screen.getByLabelText("Date range to"), {
      target: { value: "now-1d" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith("2026-04-01", "now-1d");
  });

  it("applies date presets", () => {
    const onApply = vi.fn();

    render(
      <TimeRange
        kind="date"
        label="Date range"
        from=""
        to=""
        presets={[{ label: "Today", from: "2026-05-05", to: "2026-05-05" }]}
        onApply={onApply}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /date range filter/i }));
    fireEvent.click(screen.getByRole("button", { name: /today/i }));

    expect(onApply).toHaveBeenCalledWith("2026-05-05", "2026-05-05");
  });
});
