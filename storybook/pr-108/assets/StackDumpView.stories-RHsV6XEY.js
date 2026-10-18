import{j as r}from"./iframe-CKgGkAV6.js";import{s as L}from"./fixtures-C3TGvGxW.js";import{a as F}from"./fixtures-ChS9IFbi.js";import{S as m}from"./StackDumpView-DwFfc0-r.js";import"./preload-helper-D6IOlyYr.js";import"./Icon-zT9BHEU_.js";import"./utils-DW-IJACk.js";import"./frame-heuristics-D62qKi0n.js";import"./JvmStackTrace-DZyI9rwy.js";import"./StackFrameRow-C6JgP64f.js";import"./FrameSourceWindow-DOFZJrxo.js";import"./code-highlight-BWRQ-hT_.js";import"./HighlightedTokens-Dei84GlG.js";const{expect:O,within:Q}=__STORYBOOK_MODULE_TEST__,se={title:"Data/Diagnostics/StackDumpView",component:m,args:{text:F},parameters:{docs:{description:{component:"A captured stack dump: Go goroutines or JVM threads as searchable cards with state chips and a hide-runtime-only toggle, or the raw text when the format is not recognised. Used by the diagnostics panel, the process trace detail and failed-test panics."}}},decorators:[e=>r.jsx("div",{className:"h-[480px] max-w-3xl rounded-md border border-border p-density-3",children:r.jsx(e,{})})]},a={args:{status:"ready",collectedAt:"2026-10-01T09:00:00.000Z",reason:"watchdog timeout"},play:async({canvasElement:e})=>{await O(Q(e).getByText(/goroutines$/)).toBeInTheDocument()}},t={args:{status:"ready",headerActions:r.jsx("button",{type:"button",className:"rounded border border-border px-2 py-1 text-[11px]",children:"Refresh"})}},s={args:{text:`"http-nio-8080-exec-7" #41 daemon prio=5 os_prio=0 tid=0x00007f1c nid=0x2b1 runnable [0x00007f1b]
   java.lang.Thread.State: RUNNABLE
	at com.acme.billing.CycleService.process(CycleService.java:212)
	at java.base/java.lang.Thread.run(Thread.java:840)

"main" #1 prio=5 os_prio=0 tid=0x00007f10 nid=0x101 waiting on condition [0x00007f0f]
   java.lang.Thread.State: WAITING (parking)
	at jdk.internal.misc.Unsafe.park(Native Method)
	at com.acme.App.main(App.java:20)
`}},o={args:{text:`goroutine 17 [chan receive, 2 minutes]:
app/server.(*Server).serve(0xc0001b2000)
	/home/user/go/src/app/server/server.go:118 +0xa5
created by app/server.New
	/home/user/go/src/app/server/server.go:58 +0xe0
`,singleItem:!0}},n={args:{text:`Sampling process 4242 for 1 seconds
Call graph:
    1 Thread_1001  DispatchQueue_1: com.apple.main-thread
      1 start  (in dyld)
`,status:"ready",reason:"native sample"}},u=e=>L.filter(J=>J.checkpointId===e),c={render:()=>r.jsx(m,{records:u("ckpt-timeout")}),play:async({canvasElement:e})=>{await O(Q(e).getByText("3 / 3 goroutines")).toBeInTheDocument()}},i={render:()=>r.jsx(m,{records:u("ckpt-native")})},p={render:()=>r.jsx(m,{records:u("ckpt-exited")})},d={args:{error:"SIGQUIT delivered, but the dump was truncated at 1 MiB"}};var l,g,h;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(h=(g=a.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var x,v,S;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    status: "ready",
    headerActions: <button type="button" className="rounded border border-border px-2 py-1 text-[11px]">
        Refresh
      </button>
  }
}`,...(S=(v=t.parameters)==null?void 0:v.docs)==null?void 0:S.source}}};var y,b,T;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(T=(b=s.parameters)==null?void 0:b.docs)==null?void 0:T.source}}};var w,k,f;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    text: \`goroutine 17 [chan receive, 2 minutes]:
app/server.(*Server).serve(0xc0001b2000)
\\t/home/user/go/src/app/server/server.go:118 +0xa5
created by app/server.New
\\t/home/user/go/src/app/server/server.go:58 +0xe0
\`,
    singleItem: true
  }
}`,...(f=(k=o.parameters)==null?void 0:k.docs)==null?void 0:f.source}}};var j,D,N;n.parameters={...n.parameters,docs:{...(j=n.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    text: "Sampling process 4242 for 1 seconds\\nCall graph:\\n    1 Thread_1001  DispatchQueue_1: com.apple.main-thread\\n      1 start  (in dyld)\\n",
    status: "ready",
    reason: "native sample"
  }
}`,...(N=(D=n.parameters)==null?void 0:D.docs)==null?void 0:N.source}}};var _,A,I;c.parameters={...c.parameters,docs:{...(_=c.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <StackDumpView records={checkpoint("ckpt-timeout")} />,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("3 / 3 goroutines")).toBeInTheDocument();
  }
}`,...(I=(A=c.parameters)==null?void 0:A.docs)==null?void 0:I.source}}};var R,B,G;i.parameters={...i.parameters,docs:{...(R=i.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <StackDumpView records={checkpoint("ckpt-native")} />
}`,...(G=(B=i.parameters)==null?void 0:B.docs)==null?void 0:G.source}}};var E,U,C;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <StackDumpView records={checkpoint("ckpt-exited")} />
}`,...(C=(U=p.parameters)==null?void 0:U.docs)==null?void 0:C.source}}};var M,V,W;d.parameters={...d.parameters,docs:{...(M=d.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    error: "SIGQUIT delivered, but the dump was truncated at 1 MiB"
  }
}`,...(W=(V=d.parameters)==null?void 0:V.docs)==null?void 0:W.source}}};const oe=["GoGoroutines","WithHeaderActions","JvmThreads","SingleGoroutine","RawNativeSample","GoroutineRecords","NativeDumpRecord","FailedDumpRecord","WithError"];export{p as FailedDumpRecord,a as GoGoroutines,c as GoroutineRecords,s as JvmThreads,i as NativeDumpRecord,n as RawNativeSample,o as SingleGoroutine,d as WithError,t as WithHeaderActions,oe as __namedExportsOrder,se as default};
