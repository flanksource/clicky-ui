import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./StackDumpView-D5Zx4kcN.js";import{r as i,t as a}from"./fixtures-h1Qmgw_D.js";import{r as o,u as s}from"./fixtures-DQ4-m9zu.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{o(),a(),n(),c=t(),{expect:l,within:u}=__STORYBOOK_MODULE_TEST__,d={title:`Data/Diagnostics/StackDumpView`,component:r,args:{text:i},parameters:{docs:{description:{component:`A captured stack dump: Go goroutines or JVM threads as searchable cards with state chips and a hide-runtime-only toggle, or the raw text when the format is not recognised. Used by the diagnostics panel, the process trace detail and failed-test panics.`}}},decorators:[e=>(0,c.jsx)(`div`,{className:`h-[480px] max-w-3xl rounded-md border border-border p-density-3`,children:(0,c.jsx)(e,{})})]},f={args:{status:`ready`,collectedAt:`2026-10-01T09:00:00.000Z`,reason:`watchdog timeout`},play:async({canvasElement:e})=>{await l(u(e).getByText(/goroutines$/)).toBeInTheDocument()}},p={args:{status:`ready`,headerActions:(0,c.jsx)(`button`,{type:`button`,className:`rounded border border-border px-2 py-1 text-[11px]`,children:`Refresh`})}},m={args:{text:`"http-nio-8080-exec-7" #41 daemon prio=5 os_prio=0 tid=0x00007f1c nid=0x2b1 runnable [0x00007f1b]
   java.lang.Thread.State: RUNNABLE
	at com.acme.billing.CycleService.process(CycleService.java:212)
	at java.base/java.lang.Thread.run(Thread.java:840)

"main" #1 prio=5 os_prio=0 tid=0x00007f10 nid=0x101 waiting on condition [0x00007f0f]
   java.lang.Thread.State: WAITING (parking)
	at jdk.internal.misc.Unsafe.park(Native Method)
	at com.acme.App.main(App.java:20)
`}},h={args:{text:`goroutine 17 [chan receive, 2 minutes]:
app/server.(*Server).serve(0xc0001b2000)
	/home/user/go/src/app/server/server.go:118 +0xa5
created by app/server.New
	/home/user/go/src/app/server/server.go:58 +0xe0
`,singleItem:!0}},g={args:{text:`Sampling process 4242 for 1 seconds
Call graph:
    1 Thread_1001  DispatchQueue_1: com.apple.main-thread
      1 start  (in dyld)
`,status:`ready`,reason:`native sample`}},_=e=>s.filter(t=>t.checkpointId===e),v={render:()=>(0,c.jsx)(r,{records:_(`ckpt-timeout`)}),play:async({canvasElement:e})=>{await l(u(e).getByText(`3 / 3 goroutines`)).toBeInTheDocument()}},y={render:()=>(0,c.jsx)(r,{records:_(`ckpt-native`)})},b={render:()=>(0,c.jsx)(r,{records:_(`ckpt-exited`)})},x={args:{error:`SIGQUIT delivered, but the dump was truncated at 1 MiB`}},S=[`GoGoroutines`,`WithHeaderActions`,`JvmThreads`,`SingleGoroutine`,`RawNativeSample`,`GoroutineRecords`,`NativeDumpRecord`,`FailedDumpRecord`,`WithError`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    status: "ready",
    collectedAt: "2026-10-01T09:00:00.000Z",
    reason: "watchdog timeout"
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText(/goroutines$/)).toBeInTheDocument();
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    status: "ready",
    headerActions: <button type="button" className="rounded border border-border px-2 py-1 text-[11px]">
        Refresh
      </button>
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    text: \`"http-nio-8080-exec-7" #41 daemon prio=5 os_prio=0 tid=0x00007f1c nid=0x2b1 runnable [0x00007f1b]
   java.lang.Thread.State: RUNNABLE
\\tat com.acme.billing.CycleService.process(CycleService.java:212)
\\tat java.base/java.lang.Thread.run(Thread.java:840)

"main" #1 prio=5 os_prio=0 tid=0x00007f10 nid=0x101 waiting on condition [0x00007f0f]
   java.lang.Thread.State: WAITING (parking)
\\tat jdk.internal.misc.Unsafe.park(Native Method)
\\tat com.acme.App.main(App.java:20)
\`
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    text: \`goroutine 17 [chan receive, 2 minutes]:
app/server.(*Server).serve(0xc0001b2000)
\\t/home/user/go/src/app/server/server.go:118 +0xa5
created by app/server.New
\\t/home/user/go/src/app/server/server.go:58 +0xe0
\`,
    singleItem: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    text: "Sampling process 4242 for 1 seconds\\nCall graph:\\n    1 Thread_1001  DispatchQueue_1: com.apple.main-thread\\n      1 start  (in dyld)\\n",
    status: "ready",
    reason: "native sample"
  }
}`,...g.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <StackDumpView records={checkpoint("ckpt-timeout")} />,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("3 / 3 goroutines")).toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <StackDumpView records={checkpoint("ckpt-native")} />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <StackDumpView records={checkpoint("ckpt-exited")} />
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    error: "SIGQUIT delivered, but the dump was truncated at 1 MiB"
  }
}`,...x.parameters?.docs?.source}}}})))()}C();export{b as FailedDumpRecord,f as GoGoroutines,v as GoroutineRecords,m as JvmThreads,y as NativeDumpRecord,g as RawNativeSample,h as SingleGoroutine,x as WithError,p as WithHeaderActions,S as __namedExportsOrder,d as default};