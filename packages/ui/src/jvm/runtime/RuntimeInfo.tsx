import { KeyValueList } from "../../data/KeyValueList";
import { formatDuration } from "../../lib/format";
import type { JvmRuntimeInfo } from "../protocol/types";

export type RuntimeInfoProps = {
  runtime: JvmRuntimeInfo;
  className?: string;
};

/** Java, OS, processors, load average and uptime of the JVM. */
export function RuntimeInfo({ runtime, className }: RuntimeInfoProps) {
  return (
    <KeyValueList
      {...(className ? { className } : {})}
      items={[
        { key: "java", label: "Java", value: <span className="break-all font-mono text-xs">{runtime.javaVersion}</span> },
        { key: "home", label: "Java home", hidden: !runtime.javaHome, value: <span className="break-all font-mono text-xs">{runtime.javaHome}</span> },
        { key: "os", label: "OS", value: `${runtime.osName} ${runtime.osVersion}` },
        { key: "processors", label: "Processors", value: runtime.processors },
        { key: "load", label: "Load average", value: runtime.systemLoadAverage < 0 ? "Unavailable" : runtime.systemLoadAverage.toFixed(2) },
        { key: "uptime", label: "Uptime", value: formatDuration(runtime.uptime) },
      ]}
    />
  );
}
