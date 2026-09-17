export interface StructuredCron {
  time: string;
  weekdays: number[];
}

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

export function parseStructuredCron(cron: string): StructuredCron | undefined {
  const fields = cron.trim().split(/\s+/);
  if (fields.length !== 5) return undefined;
  const [minuteField, hourField, dayOfMonth, month, weekdayField] = fields;
  if (dayOfMonth !== "*" || month !== "*") return undefined;
  const minute = parseInteger(minuteField, 0, 59);
  const hour = parseInteger(hourField, 0, 23);
  if (minute === undefined || hour === undefined || !weekdayField)
    return undefined;
  const weekdays = parseWeekdays(weekdayField);
  if (!weekdays) return undefined;
  return {
    time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    weekdays,
  };
}

export function formatStructuredCron(
  time: string,
  weekdays: readonly number[],
): string {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) throw new Error(`Invalid schedule time: ${time}`);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error(`Invalid schedule hour: ${match[1]}`);
  }
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error(`Invalid schedule minute: ${match[2]}`);
  }
  const normalized = [...new Set(weekdays)].sort((left, right) => left - right);
  if (normalized.length === 0 || normalized.some((day) => day < 0 || day > 6)) {
    throw new Error("Select at least one valid weekday");
  }
  const weekdayField =
    normalized.length === EVERY_DAY.length ? "*" : normalized.join(",");
  return `${minute} ${hour} * * ${weekdayField}`;
}

function parseInteger(
  value: string | undefined,
  minimum: number,
  maximum: number,
): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return parsed >= minimum && parsed <= maximum ? parsed : undefined;
}

function parseWeekdays(field: string): number[] | undefined {
  if (field === "*") return [...EVERY_DAY];
  const days = new Set<number>();
  for (const part of field.split(",")) {
    const range = /^(\d)-(\d)$/.exec(part);
    if (range) {
      const start = normalizeWeekday(Number(range[1]));
      const end = normalizeWeekday(Number(range[2]));
      if (start === undefined || end === undefined || start > end)
        return undefined;
      for (let day = start; day <= end; day += 1) days.add(day);
      continue;
    }
    const day = normalizeWeekday(Number(part));
    if (day === undefined || !/^\d$/.test(part)) return undefined;
    days.add(day);
  }
  return days.size > 0
    ? [...days].sort((left, right) => left - right)
    : undefined;
}

function normalizeWeekday(day: number): number | undefined {
  if (!Number.isInteger(day) || day < 0 || day > 7) return undefined;
  return day === 7 ? 0 : day;
}
