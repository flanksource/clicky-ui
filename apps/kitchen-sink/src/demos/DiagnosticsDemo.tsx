import { useState } from "react";
import {
  DiagnosticsDetailPanel,
  DiagnosticsTree,
  findProcessByPID,
  SplitPane,
  type ProcessNode,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const sampleStack = `goroutine 1 [running]:
main.main()
\t/home/user/go/src/app/main.go:42 +0x1a2
runtime.main()
\truntime/proc.go:250 +0x204

goroutine 17 [chan receive, 2 minutes]:
app/server.(*Server).serve(0xc0001b2000)
\t/home/user/go/src/app/server/server.go:118 +0xa5
created by app/server.New
\t/home/user/go/src/app/server/server.go:58 +0xe0

goroutine 22 [select]:
database/sql.(*DB).connectionOpener(0xc000110000, {0xabcd, 0xc0000aa0c0})
\tdatabase/sql/sql.go:1196 +0x88
created by database/sql.OpenDB
\tdatabase/sql/sql.go:791 +0x158
`;

const sampleTree: ProcessNode = {
  pid: 1,
  name: "clicky-api",
  command: "/usr/local/bin/clicky-api --config /etc/clicky/config.yaml",
  status: "running",
  cpu_percent: 12.4,
  rss: 245 * 1024 * 1024,
  vms: 540 * 1024 * 1024,
  open_files: 34,
  is_root: true,
  stack_capture: {
    status: "ready",
    text: sampleStack,
    collected_at: new Date().toISOString(),
  },
  children: [
    {
      pid: 42,
      ppid: 1,
      name: "worker",
      command: "worker --queue default",
      status: "sleeping",
      cpu_percent: 3.1,
      rss: 88 * 1024 * 1024,
      vms: 180 * 1024 * 1024,
      open_files: 12,
      children: [
        {
          pid: 123,
          ppid: 42,
          name: "child",
          command: "child --id 1",
          status: "running",
          cpu_percent: 0.5,
          rss: 14 * 1024 * 1024,
        },
      ],
    },
    {
      pid: 88,
      ppid: 1,
      name: "zombie-pid",
      status: "zombie",
      cpu_percent: 0,
      rss: 0,
    },
  ],
};

export function DiagnosticsDemo() {
  const [pid, setPid] = useState<number | null>(1);
  const selected = findProcessByPID(sampleTree, pid ?? -1);

  return (
    <DemoSection
      id="diagnostics"
      title="DiagnosticsTree / DiagnosticsDetailPanel"
      description="Process tree + goroutine stack inspector (ported from gavel test UI)."
    >
      <div className="h-[calc(100vh-8rem)] min-h-[420px] border border-border rounded-md overflow-hidden flex">
        <SplitPane
          left={
            <div className="h-full overflow-auto">
              <DiagnosticsTree root={sampleTree} selectedPid={pid} onSelect={setPid} />
            </div>
          }
          right={
            <div className="h-full">
              <DiagnosticsDetailPanel process={selected} />
            </div>
          }
          defaultSplit={40}
        />
      </div>
    </DemoSection>
  );
}
