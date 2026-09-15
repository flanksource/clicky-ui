export interface CronSuggestion {
  label: string;
  cron: string;
  description?: string;
}

export const DEFAULT_CRON = "0 2 * * *";

export const COMMON_CRON_SUGGESTIONS: readonly CronSuggestion[] = [
  { label: "Hourly", cron: "0 * * * *" },
  { label: "Daily", cron: DEFAULT_CRON, description: "Every day at 02:00" },
  { label: "Weekdays", cron: "0 2 * * 1-5", description: "Monday to Friday at 02:00" },
  { label: "Weekly", cron: "0 2 * * 0", description: "Every Sunday at 02:00" },
  { label: "Monthly", cron: "0 2 1 * *", description: "First day of each month at 02:00" },
];
