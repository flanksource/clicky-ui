import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScheduleEditor, type ScheduleValue } from "./ScheduleEditor";

const value: ScheduleValue = {
  cron: "0 2 * * 0",
  timezone: "Africa/Johannesburg",
  enabled: true,
};

describe("ScheduleEditor", () => {
  it("emits the complete schedule value when each field changes", () => {
    const onChange = vi.fn();
    render(<ScheduleEditor id="maintenance" value={value} onChange={onChange} />);

    const cron = screen.getByRole("combobox", { name: "Cron expression" });
    fireEvent.focus(cron);
    fireEvent.change(cron, {
      target: { value: "0 3 * * 0" },
    });
    fireEvent.keyDown(cron, { key: "Enter" });
    fireEvent.change(screen.getByLabelText("Timezone"), {
      target: { value: "UTC" },
    });
    fireEvent.click(screen.getByRole("switch", { name: "Enabled" }));

    expect(onChange).toHaveBeenNthCalledWith(1, { ...value, cron: "0 3 * * 0" });
    expect(onChange).toHaveBeenNthCalledWith(2, { ...value, timezone: "UTC" });
    expect(onChange).toHaveBeenNthCalledWith(3, { ...value, enabled: false });
  });

  it("keeps labels persistent and disables every control", () => {
    render(<ScheduleEditor id="readonly" value={value} onChange={vi.fn()} disabled />);

    expect(screen.getByLabelText(/Cron expression/)).toBeDisabled();
    expect(screen.getByLabelText("Timezone")).toBeDisabled();
    expect(screen.getByRole("switch", { name: "Enabled" })).toBeDisabled();
  });

  it("offers operation and common examples in an editable cron dropdown", () => {
    const onChange = vi.fn();
    render(
      <ScheduleEditor
        id="suggestions"
        value={value}
        onChange={onChange}
        cronSuggestions={[
          { label: "Recommended", cron: value.cron },
          { label: "Recommended duplicate", cron: value.cron },
        ]}
        timezoneSuggestions={[value.timezone, value.timezone]}
      />,
    );

    const cron = screen.getByRole("combobox", { name: "Cron expression" });
    fireEvent.focus(cron);
    expect(screen.getByRole("option", { name: /Recommended/ })).toBeInTheDocument();
    const hourly = screen.getByRole("option", { name: /Hourly/ });

    fireEvent.mouseDown(hourly);
    fireEvent.click(hourly);
    expect(onChange).toHaveBeenCalledWith({ ...value, cron: "0 * * * *" });
  });
});
