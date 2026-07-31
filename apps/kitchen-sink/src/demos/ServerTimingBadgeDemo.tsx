import {
  parseServerTiming,
  ServerTimingBadge,
} from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

const detailed = parseServerTiming(
  'total;dur=120.5, command;dur=95.2, format;dur=4.1, sql;dur=18.6;desc="queries=2 rows_returned=501", redis;dur=1.2;desc="ops=3 hits=2 misses=1 errors=0"',
);

const idle = parseServerTiming(
  'total;dur=8.2, sql;dur=0;desc="queries=0 rows_returned=0", redis;dur=0;desc="ops=0 hits=0 misses=0 errors=0"',
);

export function ServerTimingBadgeDemo() {
  return (
    <DemoSection
      id="server-timing"
      title="ServerTimingBadge"
      description="Request duration badge with Server-Timing phases and diagnostic counters."
    >
      <DemoRow label="Detailed request">
        <ServerTimingBadge metrics={detailed} />
      </DemoRow>
      <DemoRow label="No SQL or Redis activity">
        <ServerTimingBadge metrics={idle} />
      </DemoRow>
    </DemoSection>
  );
}
