import { useState } from "react";
import {
  DatePicker,
  DateTimePicker,
  Field,
  IconButton,
  Loading,
  RangeSlider,
  Select,
  UiClose,
  UiDotsVertical,
  UiFilter,
  type RangeSliderValue,
} from "@flanksource/clicky-ui";
import { DemoSection, DemoRow } from "./Section";

const REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "eu-west-1", label: "EU (Ireland)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
];

export function FormFieldsDemo() {
  const [date, setDate] = useState("2026-06-16");
  const [datetime, setDatetime] = useState("2026-06-16T09:30");
  const [range, setRange] = useState<RangeSliderValue>([20, 70]);

  return (
    <DemoSection
      id="form-fields"
      title="Form fields"
      description="Primitive form controls: Field chrome, Select, DatePicker / DateTimePicker, RangeSlider, IconButton and Loading."
    >
      <div className="grid max-w-3xl gap-density-4 sm:grid-cols-2">
        <Field label="Region" htmlFor="ff-region" required helper="Where workloads run.">
          <Select
            id="ff-region"
            options={REGIONS}
            placeholder="Select a region"
            defaultValue="eu-west-1"
          />
        </Field>

        <Field label="Severity" htmlFor="ff-sev" error="Pick a severity to continue.">
          <Select
            id="ff-sev"
            options={[
              { value: "low", label: "Low" },
              { value: "high", label: "High" },
            ]}
            placeholder="Select…"
            defaultValue=""
          />
        </Field>

        <Field label="Date" htmlFor="ff-date">
          <DatePicker value={date} onChange={setDate} />
        </Field>

        <Field label="Date & time" htmlFor="ff-dt" helper="Accepts now-1h style expressions.">
          <DateTimePicker value={datetime} onChange={setDatetime} />
        </Field>

        <Field label="Replicas" helper={`${range[0]} – ${range[1]}`}>
          <RangeSlider min={0} max={100} value={range} onChange={setRange} />
        </Field>
      </div>

      <DemoRow label="IconButton">
        <IconButton icon={UiDotsVertical} label="More actions" />
        <IconButton icon={UiFilter} label="Filter" />
        <IconButton icon={UiClose} label="Dismiss" />
        <IconButton icon={UiDotsVertical} label="Disabled" disabled />
      </DemoRow>

      <DemoRow label="Loading">
        <Loading size="sm" label="sm" />
        <Loading size="md" label="md" />
        <Loading size="lg" label="lg" />
      </DemoRow>
    </DemoSection>
  );
}
