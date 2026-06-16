import {
  AvatarBadge,
  KeyValueList,
  StatusDot,
  TagList,
  Timestamp,
  UiCheckFilled,
  normalizeTags,
} from "@flanksource/clicky-ui";
import { DemoSection, DemoRow } from "./Section";

const TAGS = normalizeTags(["env=production", "team=payments", "region=us-east-1", "tier=critical"]);
const TS = "2026-06-02T09:30:00Z";

export function CellsDemo() {
  return (
    <DemoSection
      id="cells"
      title="Table cells"
      description="Compact display primitives used inside table cells and dense lists: StatusDot, TagList, Timestamp, AvatarBadge and KeyValueList."
    >
      <DemoRow label="StatusDot">
        <StatusDot status="success" label="Healthy" />
        <StatusDot status="warning" label="Degraded" />
        <StatusDot status="error" label="Down" />
        <StatusDot status="info" label="Provisioning" />
      </DemoRow>

      <DemoRow label="TagList">
        <div className="w-80">
          <TagList tags={TAGS} maxVisible={3} />
        </div>
      </DemoRow>

      <DemoRow label="Timestamp">
        <Timestamp value={TS} format="relative" />
        <Timestamp value={TS} format="short" />
        <Timestamp value={TS} format="time" />
        <Timestamp value={TS} format="iso" />
      </DemoRow>

      <DemoRow label="AvatarBadge">
        <AvatarBadge alt="Ada Lovelace" label="Ada Lovelace" statusIcon={UiCheckFilled} statusTone="emerald" />
      </DemoRow>

      <div className="max-w-md">
        <KeyValueList
          items={[
            { key: "name", label: "Name", value: "payments-api" },
            { key: "namespace", label: "Namespace", value: "prod" },
            { key: "replicas", label: "Replicas", value: "3 / 3" },
          ]}
        />
      </div>
    </DemoSection>
  );
}
