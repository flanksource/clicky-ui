import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Es as r,Ul as i,Xr as a,n as o,ws as s}from"./icons-N6BqLuiz.js";import{n as c,t as l}from"./utils-CEDXhWC6.js";import{r as u,t as d}from"./Icon-Drf4m9fW.js";import{n as f,t as p}from"./button-D0DsVdep.js";import{n as m,t as ee}from"./ConfirmDialog-D_CFM5Ou.js";import{n as te,t as ne}from"./Tabs-BflGYxjS.js";import{n as re,t as ie}from"./select-9HsXfGO4.js";import{a as ae,n as oe,t as h}from"./format-FR4vn-Lv.js";import{a as se,i as ce,o as le,r as ue}from"./utils-CR0wbTxY.js";import{n as de,t as fe}from"./StackDumpView-BazUiwTB.js";import{n as pe,t as g}from"./MetricTile-Bhhy5n6X.js";import{t as _}from"./metric-tone-OwtTZ4da.js";import{_ as me,c as he,g as ge,h as _e,i as v,m as ve,o as y,p as b,r as ye,u as be,v as xe}from"./fixtures-DQ4-m9zu.js";import{a as x,c as Se,i as S,l as Ce,o as we,s as Te}from"./process-tree-C3QrK1Pb.js";import{n as Ee,t as C}from"./ProcessFacetTable-CXjnDlRw.js";import{n as De}from"./stack-checkpoints-DvR7c6kD.js";import{i as Oe,n as ke,r as w,t as Ae}from"./ProcessTraceTree-CsCOco45.js";function T(e){let t=j[e];if(!t)throw Error(`unknown stack transport "${e}"; expected one of ${Object.keys(j).join(`, `)}`);return t}function E({title:e,children:t}){return(0,A.jsxs)(`section`,{children:[(0,A.jsx)(`div`,{className:`mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground`,children:e}),t]})}function D({label:e,value:t,wide:n}){return(0,A.jsxs)(`div`,{className:`rounded-lg border border-border bg-muted/50 px-2.5 py-density-2 ${n?`col-span-2`:``}`,children:[(0,A.jsx)(`div`,{className:`text-[10px] uppercase tracking-wide text-muted-foreground`,children:e}),(0,A.jsx)(`div`,{className:`mt-0.5 break-all text-xs font-medium text-foreground`,children:t})]})}function je({node:e}){return(0,A.jsxs)(`div`,{className:`min-w-0`,children:[(0,A.jsxs)(`div`,{className:`flex items-center gap-density-2`,children:[(0,A.jsx)(d,{icon:e.isRoot?a:r,className:`shrink-0 text-2xl text-blue-600`}),(0,A.jsx)(`h2`,{className:`break-words text-lg font-bold text-foreground`,children:ce(e)})]}),(0,A.jsxs)(`div`,{className:`mt-1 flex flex-wrap items-center gap-density-2 text-xs text-muted-foreground`,children:[(0,A.jsxs)(`span`,{className:`font-mono`,children:[`pid `,e.pid]}),e.ppid?(0,A.jsxs)(`span`,{className:`font-mono`,children:[`ppid `,e.ppid]}):null,(0,A.jsxs)(`span`,{className:`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 ${se(e.status)}`,children:[(0,A.jsx)(d,{icon:le(e.status)}),e.status]})]})]})}function Me({transports:e,hasStack:t,collecting:n,onCollect:r}){return(0,A.jsx)(`div`,{className:`flex items-center gap-density-1`,"data-stack-actions":``,children:e.map(e=>{let a=T(e.transport);return(0,A.jsxs)(p,{size:`sm`,variant:e.destructive?`destructive`:t?`outline`:`default`,disabled:n,title:a.title,onClick:()=>r(e),children:[(0,A.jsx)(d,{icon:n?s:i,className:n?`mr-1 animate-spin`:`mr-1`}),a.label(t)]},e.transport)})})}function Ne({node:e,stacks:t,onCollectStack:n,collecting:r,collectError:i}){let[a,o]=(0,k.useState)(null),[s,c]=(0,k.useState)(null),l=(0,k.useMemo)(()=>De(t,e.key),[t,e.key]),u=e.stackTransports??[],d=!!n&&u.length>0;if(l.length===0&&!d)return null;let f=l.find(e=>e.checkpointId===s)??l[l.length-1],p=d?(0,A.jsx)(Me,{transports:u,hasStack:!!f,collecting:!!r,onCollect:t=>t.destructive?o(t):void n?.(e.key,t.transport)}):null,m=a?T(a.transport):null;return(0,A.jsxs)(E,{title:`Stack`,children:[i&&(0,A.jsx)(`div`,{className:`mb-2 whitespace-pre-wrap text-xs text-red-700 dark:text-red-400`,role:`alert`,children:i}),f?(0,A.jsxs)(`div`,{className:`space-y-density-1`,children:[l.length>1&&(0,A.jsx)(`div`,{className:`max-w-md`,children:(0,A.jsx)(ie,{"aria-label":`Stack checkpoint`,value:f.checkpointId,onChange:e=>c(e.target.value),options:[...l].reverse().map(e=>({value:e.checkpointId,label:[x(e.takenAt),e.reason,e.transport,e.failed?`failed`:``].filter(Boolean).join(` · `)}))})}),(0,A.jsx)(fe,{records:f.records,...p?{headerActions:p}:{}},`${e.key}:${f.checkpointId}`)]}):(0,A.jsxs)(`div`,{className:`flex items-center justify-between gap-3`,children:[(0,A.jsx)(`div`,{className:`text-xs text-muted-foreground`,children:r?`Collecting stack trace...`:`No stack trace collected yet.`}),p]}),(0,A.jsx)(ee,{open:a!==null,title:`${m?.label(!1)??``}?`,warning:m?.warning?.(e.pid)??`Collecting this stack over ${a?.transport??``} terminates pid ${e.pid}.`,message:`The stack is shown here once the dump arrives. Use a non-destructive transport to look without killing.`,confirmLabel:m?.label(!1)??`Collect`,variant:`destructive`,onCancel:()=>o(null),onConfirm:()=>{let t=a;o(null),t&&n?.(e.key,t.transport)}})]})}function Pe({node:e,samples:t,links:n,...r}){let i=Te(e),a=Ce(t,e.key),o=_e(t,e.key),s={read:o.read[o.read.length-1],write:o.write[o.write.length-1]};return(0,A.jsxs)(`div`,{className:`space-y-density-3`,children:[n,(0,A.jsx)(E,{title:`Command`,children:(0,A.jsx)(`pre`,{className:`whitespace-pre-wrap break-all rounded bg-blue-50 p-2 font-mono text-xs text-foreground dark:bg-blue-500/10`,children:e.command})}),(0,A.jsx)(E,{title:`Process`,children:(0,A.jsxs)(`div`,{className:`grid grid-cols-2 gap-density-2 text-sm`,children:[(0,A.jsx)(D,{label:`Cwd`,value:e.cwd||`Unavailable`,wide:!0}),(0,A.jsx)(D,{label:`Started`,value:x(e.startedAt)}),(0,A.jsx)(D,{label:`Exited`,value:i?x(e.exitedAt??e.lastSeenAt):`running`}),(0,A.jsx)(D,{label:`Lifetime`,value:`${oe(Se(e))}${i?``:` so far`}`})]})}),(0,A.jsxs)(E,{title:`Resources`,children:[(0,A.jsxs)(`div`,{className:`grid grid-cols-2 gap-density-1 sm:grid-cols-4`,children:[(0,A.jsx)(g,{label:`CPU`,value:S(e.cpuPercent),barPct:Math.min(100,e.cpuPercent??0),tone:_(e.cpuPercent??0)}),(0,A.jsx)(g,{label:`RSS`,value:h(e.rssBytes)}),(0,A.jsx)(g,{label:`Peak CPU`,value:S(e.peakCpuPercent),tone:_(e.peakCpuPercent??0)}),(0,A.jsx)(g,{label:`Peak RSS`,value:h(e.peakRssBytes)}),s.read!==void 0&&(0,A.jsx)(g,{label:`Disk read`,value:h(s.read)}),s.write!==void 0&&(0,A.jsx)(g,{label:`Disk write`,value:h(s.write)})]}),(0,A.jsxs)(`div`,{className:`mt-2 grid grid-cols-2 gap-density-2`,children:[(0,A.jsx)(w,{label:`CPU %`,values:a.cpu,format:e=>`${e.toFixed(1)}%`}),(0,A.jsx)(w,{label:`RSS`,values:a.rss,format:h}),o.read.length>0&&(0,A.jsx)(w,{label:`Disk read`,values:o.read,format:h}),o.write.length>0&&(0,A.jsx)(w,{label:`Disk write`,values:o.write,format:h})]})]}),(0,A.jsx)(Ne,{node:e,...r},e.key)]})}function Fe({node:e,samples:t,facet:n}){let{label:r}=b[n];return(0,A.jsxs)(`div`,{className:`space-y-density-3`,children:[(0,A.jsx)(w,{label:r,values:ge(t,e.key,n),format:String}),(0,A.jsx)(C,{facet:n,reading:xe(t,e.key,n)})]})}function O({node:e,samples:t,stacks:n=M,links:r,onCollectStack:i,collecting:o,collectError:s,className:c}){let[u,f]=(0,k.useState)(`overview`);if(!e)return(0,A.jsx)(`div`,{className:`flex h-full items-center justify-center text-sm text-muted-foreground`,children:(0,A.jsxs)(`div`,{className:`text-center`,children:[(0,A.jsx)(d,{icon:a,className:`mb-2 block text-4xl`}),`Select a process to view its trace`]})});let p=[{id:`overview`,label:`Overview`},...e.environment||e.environmentError?[{id:`env`,label:`Environment`}]:[],...ve(t).map(e=>({id:e,label:b[e].label}))],m=p.some(e=>e.id===u)?u:`overview`;return(0,A.jsxs)(`div`,{className:l(`h-full space-y-density-3 overflow-y-auto p-density-4`,c),"data-process-detail":e.key,children:[(0,A.jsx)(je,{node:e}),p.length>1&&(0,A.jsx)(ne,{tabs:p,value:m,onChange:e=>f(e)}),m===`overview`?(0,A.jsx)(Pe,{node:e,samples:t,stacks:n,links:r,...i?{onCollectStack:i}:{},...o===void 0?{}:{collecting:o},...s?{collectError:s}:{}}):m===`env`?(0,A.jsx)(C,{facet:`env`,...e.environment?{environment:e.environment}:{},...e.environmentError?{error:e.environmentError}:{}}):(0,A.jsx)(Fe,{node:e,samples:t,facet:m},`${e.key}:${m}`)]})}var k,A,j,M;function N(){return(N=e((()=>{k=t(),f(),re(),o(),te(),ae(),c(),m(),pe(),de(),ue(),u(),me(),we(),Ee(),Oe(),A=n(),j={inprocess:{label:e=>e?`Refresh stack trace`:`Collect stack trace`,title:`Take a fresh observation and dump the goroutine stacks`},native:{label:()=>`Native sample`,title:`Sample the process's native threads without interrupting it`},pprof:{label:()=>`Collect via pprof`,title:`Read the goroutine profile from the process's pprof endpoint`},gops:{label:()=>`Collect via gops`,title:`Read the goroutine stacks from the process's gops agent`},sigquit:{label:()=>`Dump goroutines & kill`,title:`Send SIGQUIT: the process prints every goroutine's stack and exits`,warning:e=>`This sends SIGQUIT to pid ${e}. The process prints every goroutine's stack and exits.`}},M=[];try{O.displayName=`ProcessTraceDetail`,O.__docgenInfo={description:`Everything the trace knows about one process: its command and lifetime,
resource usage (CPU, RSS, disk IO) and sparklines, and its stack with a
chooser across the checkpoints that dumped it and collect buttons for the
transports it offers. Tabs for open files, sockets, ports and connections
appear when the samples carry that facet, showing the latest stored list and
a count sparkline, and one for the environment when the node recorded it.
Props-only: the host supplies the selected row and the trace records.`,displayName:`ProcessTraceDetail`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx`,methods:[],props:{node:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx`,name:`TypeLiteral`}],description:"The selected `process_tree` record; null renders the empty selection state.",name:`node`,required:!0,tags:{},type:{name:`ProcessNodeRow | null`}},samples:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx`,name:`TypeLiteral`}],description:`\`process_samples\` records; those of other processes are ignored. They carry
the resource series, and the facet counts and lists: a facet tab is shown
only when the samples carry that facet's count, that is when the session
armed it.`,name:`samples`,required:!0,tags:{},type:{name:`ProcessSampleRow[]`}},stacks:{defaultValue:{value:`[]`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx`,name:`TypeLiteral`}],description:"`stacks` records; those of other processes are ignored.",name:`stacks`,required:!1,tags:{},type:{name:`StackRecord[]`}},links:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx`,name:`TypeLiteral`}],description:`Host content at the top of Overview, for example a link to the fixture step that started the process.`,name:`links`,required:!1,tags:{},type:{name:`ReactNode`}},onCollectStack:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx`,name:`TypeLiteral`}],description:`Collects a stack for a process over one of its \`stackTransports\`. Without it
no collect buttons are shown. A destructive transport (sigquit) kills the
process, so it asks for confirmation first.`,name:`onCollectStack`,required:!1,tags:{},type:{name:`(key: string, transport: string) => void | Promise<void>`}},collecting:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx`,name:`TypeLiteral`}],description:`A collection is in flight: collect buttons are disabled.`,name:`collecting`,required:!1,tags:{},type:{name:`boolean`}},collectError:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx`,name:`TypeLiteral`}],description:`Why the last collection failed.`,name:`collectError`,required:!1,tags:{},type:{name:`string`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx`,name:`TypeLiteral`}],description:``,name:`className`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}var P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{P=t(),ye(),N(),ke(),F=n(),{expect:I,userEvent:L,within:R}=__STORYBOOK_MODULE_TEST__,z=e=>v.find(t=>t.key===e),B={title:`Data/Traces/ProcessTraceDetail`,component:O,args:{node:z(`101:100`),samples:he,stacks:be},decorators:[e=>(0,F.jsx)(`div`,{className:`h-[640px] max-w-3xl overflow-hidden rounded-md border border-border`,children:(0,F.jsx)(e,{})})],parameters:{docs:{description:{component:"One process of a `process_tree` trace: command, lifetime, resource tiles and CPU/RSS/disk sparklines from `process_samples`, and its stack from the `stacks` kind with a chooser across the checkpoints that dumped it and collect buttons for the transports the node offers (a destructive one, sigquit, asks first). Tabs for open files, sockets, ports and connections appear when the samples carry that facet and show the latest stored list with its count over time; the Environment tab reads the node."}}}},V={args:{onCollectStack:async()=>{}},play:async({canvasElement:e})=>{let t=R(e);await I(t.getByText(`Native sample`)).toBeInTheDocument(),await I(t.getByText(`Dump goroutines & kill`)).toBeInTheDocument()}},H={args:{node:z(`100:1`),onCollectStack:async()=>{}},play:async({canvasElement:e})=>{let t=R(e);await L.selectOptions(t.getByRole(`combobox`,{name:`Stack checkpoint`}),`ckpt-periodic`),await I(t.queryByText(`g22`)).not.toBeInTheDocument()}},U={args:{onCollectStack:async()=>{},collecting:!0}},W={args:{onCollectStack:async()=>{},collectError:`session not found: the run has ended`}},G={args:{node:z(`102:101`),samples:[]},play:async({canvasElement:e})=>{await I(R(e).getByText(`the process exited before a stack could be read`)).toBeInTheDocument()}},K={args:{node:z(`300:299`),samples:[],stacks:[]}},q={args:{links:(0,F.jsxs)(`section`,{children:[(0,F.jsx)(`div`,{className:`mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground`,children:`Step`}),(0,F.jsx)(`a`,{href:`#step`,className:`text-sm text-primary hover:underline`,children:`go test ./pkg/...`})]})}},J={args:{samples:y},play:async({canvasElement:e})=>{let t=R(e);await I(t.getByRole(`img`,{name:`Disk read over time`})).toBeInTheDocument(),await L.click(t.getByRole(`tab`,{name:`Open files`})),await I(await t.findByText(`/work/repo/pkg`)).toBeInTheDocument()}},Y={args:{node:z(`100:1`)},play:async({canvasElement:e})=>{let t=R(e);await L.click(t.getByRole(`tab`,{name:`Environment`})),await I(await t.findByText(`GOFLAGS`)).toBeInTheDocument()}},X={args:{node:null,samples:[]}},Z={decorators:[],render:e=>{let[t,n]=(0,P.useState)(`101:100`);return(0,F.jsxs)(`div`,{className:`flex h-[640px] overflow-hidden rounded-md border border-border`,children:[(0,F.jsx)(`div`,{className:`w-1/2 overflow-auto border-r border-border`,children:(0,F.jsx)(Ae,{nodes:v,samples:y,selectedKey:t,onSelect:n})}),(0,F.jsx)(`div`,{className:`min-w-0 flex-1`,children:(0,F.jsx)(O,{...e,node:v.find(e=>e.key===t)??null,samples:y,onCollectStack:async()=>{}})})]})}},Q=[`BusyChildWithNativeSample`,`RootWithCheckpointChooser`,`Collecting`,`CollectFailed`,`ExitedWithFailedDump`,`WithoutSamples`,`WithStepLink`,`WithDiskAndFacets`,`EnvironmentTab`,`NothingSelected`,`BesideTheTree`],V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    onCollectStack: async () => {}
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Native sample")).toBeInTheDocument();
    await expect(canvas.getByText("Dump goroutines & kill")).toBeInTheDocument();
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    node: byKey("100:1"),
    onCollectStack: async () => {}
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", {
      name: "Stack checkpoint"
    }), "ckpt-periodic");
    await expect(canvas.queryByText("g22")).not.toBeInTheDocument();
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    onCollectStack: async () => {},
    collecting: true
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    onCollectStack: async () => {},
    collectError: "session not found: the run has ended"
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    node: byKey("102:101"),
    samples: []
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("the process exited before a stack could be read")).toBeInTheDocument();
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    node: byKey("300:299"),
    samples: [],
    stacks: []
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    links: <section>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Step</div>
        <a href="#step" className="text-sm text-primary hover:underline">
          go test ./pkg/...
        </a>
      </section>
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    samples: processFacetSampleRows
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("img", {
      name: "Disk read over time"
    })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("tab", {
      name: "Open files"
    }));
    await expect(await canvas.findByText("/work/repo/pkg")).toBeInTheDocument();
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    node: byKey("100:1")
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", {
      name: "Environment"
    }));
    await expect(await canvas.findByText("GOFLAGS")).toBeInTheDocument();
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    node: null,
    samples: []
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  decorators: [],
  render: args => {
    const [selectedKey, setSelectedKey] = useState<string | null>("101:100");
    return <div className="flex h-[640px] overflow-hidden rounded-md border border-border">
        <div className="w-1/2 overflow-auto border-r border-border">
          <ProcessTraceTree nodes={processDetailRows} samples={processFacetSampleRows} selectedKey={selectedKey} onSelect={setSelectedKey} />
        </div>
        <div className="min-w-0 flex-1">
          <ProcessTraceDetail {...args} node={processDetailRows.find(row => row.key === selectedKey) ?? null} samples={processFacetSampleRows} onCollectStack={async () => {}} />
        </div>
      </div>;
  }
}`,...Z.parameters?.docs?.source}}}})))()}$();export{Z as BesideTheTree,V as BusyChildWithNativeSample,W as CollectFailed,U as Collecting,Y as EnvironmentTab,G as ExitedWithFailedDump,X as NothingSelected,H as RootWithCheckpointChooser,J as WithDiskAndFacets,q as WithStepLink,K as WithoutSamples,Q as __namedExportsOrder,B as default};