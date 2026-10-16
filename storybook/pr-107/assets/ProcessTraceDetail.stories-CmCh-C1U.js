import{r as k,j as t,aw as Ne,a9 as Pe,aq as Ee,b$ as Re}from"./iframe-BsAqiW63.js";import{e as Ie,S as De,f as _e,i as Le,l as Oe,a as K,s as Fe,c as Ae,j as $}from"./fixtures-C3TGvGxW.js";import{B as Ke}from"./button-BtSAOAKJ.js";import{S as $e}from"./select-Dx3dTqXz.js";import{T as qe}from"./Tabs-DS-db7XK.js";import{c as Ue,a as h}from"./format-2niohfpq.js";import{c as We}from"./utils-DW-IJACk.js";import{C as Ve}from"./ConfirmDialog-Dy2NjZjp.js";import{M as g}from"./MetricTile-ChxYJOW8.js";import{c as V}from"./metric-tone-UjdEBFmO.js";import{S as Me}from"./StackDumpView-w425JzSB.js";import{p as Ge,a as He,b as Qe}from"./utils-Cc6tkQt_.js";import{I as F}from"./Icon-Dyy6aaqa.js";import{i as ze,p as Ye,f as q,a as Je,b as M}from"./process-tree-BV4Gc7wn.js";import{P as Be}from"./ProcessFacetTable-pmlRUewk.js";import{s as Xe}from"./stack-checkpoints-UeFU0tRC.js";import{L as y,P as Ze}from"./ProcessTraceTree-BMcVaZcZ.js";import"./preload-helper-Drww7zV3.js";import"./index-CPURVhFy.js";import"./loading-BJEbCWIe.js";import"./TabButton-BZA9_rW6.js";import"./Callout-DsXXS4Pz.js";import"./callout-tones-EFt49BYo.js";import"./Modal-qlF4Wnfg.js";import"./index-DEP2UBhX.js";import"./index-DuXfw_hg.js";import"./modalStack-DSQeidlD.js";import"./zIndex-BGbNBNA8.js";import"./frame-heuristics-D62qKi0n.js";import"./JvmStackTrace-Dgyu4kSq.js";import"./StackFrameRow-BaIi5t3a.js";import"./FrameSourceWindow-C7BkTYwa.js";import"./code-highlight-DwCrX-Hn.js";import"./HighlightedTokens-BUaKcwG1.js";import"./DataTable-BJptSIQ7.js";import"./SortableHeader-kFQrF4xZ.js";import"./router-BgYu87PQ.js";import"./FilterBar-BRWLo9rk.js";import"./floating-ui.react-C__wji9y.js";import"./FilterPill-Bzw0s4Xn.js";import"./filter-bar-multi-UjrkZIQp.js";import"./Combobox-BKuWHLhN.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Bx8fiptj.js";import"./MultiSelect-C8zfQc50.js";import"./RangeSlider-DPi11dKG.js";import"./TimeRange-BYkBh0gt.js";import"./WorkloadPicker-Bi9tT_P3.js";import"./NamespacePicker-my8PKnLF.js";import"./index-CMSqFLvx.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-VJO0GUDl.js";import"./TagList-B5FA-7SG.js";import"./Badge-BSYyZDva.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-DFfEldqR.js";import"./Properties-DOLNt58n.js";import"./IconButton-CrvV3w7r.js";import"./DropdownMenu-CRLAXTiF.js";import"./DropdownMenuSubmenu-CyJ-SNUG.js";import"./JsonView-MllwN6TG.js";import"./AccordionList-CmL7DXC2.js";import"./collections-CoHfwOze.js";import"./StatusDot-CrwAY-qs.js";import"./Tree-CVzpFtCq.js";import"./TreeNode-DwfXB92K.js";const G={inprocess:{label:e=>e?"Refresh stack trace":"Collect stack trace",title:"Take a fresh observation and dump the goroutine stacks"},native:{label:()=>"Native sample",title:"Sample the process's native threads without interrupting it"},pprof:{label:()=>"Collect via pprof",title:"Read the goroutine profile from the process's pprof endpoint"},gops:{label:()=>"Collect via gops",title:"Read the goroutine stacks from the process's gops agent"},sigquit:{label:()=>"Dump goroutines & kill",title:"Send SIGQUIT: the process prints every goroutine's stack and exits",warning:e=>`This sends SIGQUIT to pid ${e}. The process prints every goroutine's stack and exits.`}};function Ce(e){const s=G[e];if(!s)throw new Error(`unknown stack transport "${e}"; expected one of ${Object.keys(G).join(", ")}`);return s}const et=[];function O({title:e,children:s}){return t.jsxs("section",{children:[t.jsx("div",{className:"mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",children:e}),s]})}function S({label:e,value:s,wide:a}){return t.jsxs("div",{className:`rounded-lg border border-border bg-muted/50 px-2.5 py-density-2 ${a?"col-span-2":""}`,children:[t.jsx("div",{className:"text-[10px] uppercase tracking-wide text-muted-foreground",children:e}),t.jsx("div",{className:"mt-0.5 break-all text-xs font-medium text-foreground",children:s})]})}function tt({node:e}){return t.jsxs("div",{className:"min-w-0",children:[t.jsxs("div",{className:"flex items-center gap-density-2",children:[t.jsx(F,{icon:e.isRoot?Ne:Pe,className:"shrink-0 text-2xl text-blue-600"}),t.jsx("h2",{className:"break-words text-lg font-bold text-foreground",children:Ge(e)})]}),t.jsxs("div",{className:"mt-1 flex flex-wrap items-center gap-density-2 text-xs text-muted-foreground",children:[t.jsxs("span",{className:"font-mono",children:["pid ",e.pid]}),e.ppid?t.jsxs("span",{className:"font-mono",children:["ppid ",e.ppid]}):null,t.jsxs("span",{className:`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 ${Qe(e.status)}`,children:[t.jsx(F,{icon:He(e.status)}),e.status]})]})]})}function st({transports:e,hasStack:s,collecting:a,onCollect:c}){return t.jsx("div",{className:"flex items-center gap-density-1","data-stack-actions":"",children:e.map(i=>{const r=Ce(i.transport);return t.jsxs(Ke,{size:"sm",variant:i.destructive?"destructive":s?"outline":"default",disabled:a,title:r.title,onClick:()=>c(i),children:[t.jsx(F,{icon:a?Ee:Re,className:a?"mr-1 animate-spin":"mr-1"}),r.label(s)]},i.transport)})})}function at({node:e,stacks:s,onCollectStack:a,collecting:c,collectError:i}){var W;const[r,o]=k.useState(null),[m,f]=k.useState(null),u=k.useMemo(()=>Xe(s,e.key),[s,e.key]),T=e.stackTransports??[],v=!!a&&T.length>0;if(u.length===0&&!v)return null;const l=u.find(n=>n.checkpointId===m)??u[u.length-1],p=v?t.jsx(st,{transports:T,hasStack:!!l,collecting:!!c,onCollect:n=>n.destructive?o(n):void(a==null?void 0:a(e.key,n.transport))}):null,d=r?Ce(r.transport):null;return t.jsxs(O,{title:"Stack",children:[i&&t.jsx("div",{className:"mb-2 whitespace-pre-wrap text-xs text-red-700 dark:text-red-400",role:"alert",children:i}),l?t.jsxs("div",{className:"space-y-density-1",children:[u.length>1&&t.jsx("div",{className:"max-w-md",children:t.jsx($e,{"aria-label":"Stack checkpoint",value:l.checkpointId,onChange:n=>f(n.target.value),options:[...u].reverse().map(n=>({value:n.checkpointId,label:[q(n.takenAt),n.reason,n.transport,n.failed?"failed":""].filter(Boolean).join(" · ")}))})}),t.jsx(Me,{records:l.records,...p?{headerActions:p}:{}},`${e.key}:${l.checkpointId}`)]}):t.jsxs("div",{className:"flex items-center justify-between gap-3",children:[t.jsx("div",{className:"text-xs text-muted-foreground",children:c?"Collecting stack trace...":"No stack trace collected yet."}),p]}),t.jsx(Ve,{open:r!==null,title:`${(d==null?void 0:d.label(!1))??""}?`,warning:((W=d==null?void 0:d.warning)==null?void 0:W.call(d,e.pid))??`Collecting this stack over ${(r==null?void 0:r.transport)??""} terminates pid ${e.pid}.`,message:"The stack is shown here once the dump arrives. Use a non-destructive transport to look without killing.",confirmLabel:(d==null?void 0:d.label(!1))??"Collect",variant:"destructive",onCancel:()=>o(null),onConfirm:()=>{const n=r;o(null),n&&(a==null||a(e.key,n.transport))}})]})}function rt({node:e,samples:s,links:a,...c}){const i=ze(e),r=Ye(s,e.key),o=_e(s,e.key),m={read:o.read[o.read.length-1],write:o.write[o.write.length-1]};return t.jsxs("div",{className:"space-y-density-3",children:[a,t.jsx(O,{title:"Command",children:t.jsx("pre",{className:"whitespace-pre-wrap break-all rounded bg-blue-50 p-2 font-mono text-xs text-foreground dark:bg-blue-500/10",children:e.command})}),t.jsx(O,{title:"Process",children:t.jsxs("div",{className:"grid grid-cols-2 gap-density-2 text-sm",children:[t.jsx(S,{label:"Cwd",value:e.cwd||"Unavailable",wide:!0}),t.jsx(S,{label:"Started",value:q(e.startedAt)}),t.jsx(S,{label:"Exited",value:i?q(e.exitedAt??e.lastSeenAt):"running"}),t.jsx(S,{label:"Lifetime",value:`${Ue(Je(e))}${i?"":" so far"}`})]})}),t.jsxs(O,{title:"Resources",children:[t.jsxs("div",{className:"grid grid-cols-2 gap-density-1 sm:grid-cols-4",children:[t.jsx(g,{label:"CPU",value:M(e.cpuPercent),barPct:Math.min(100,e.cpuPercent??0),tone:V(e.cpuPercent??0)}),t.jsx(g,{label:"RSS",value:h(e.rssBytes)}),t.jsx(g,{label:"Peak CPU",value:M(e.peakCpuPercent),tone:V(e.peakCpuPercent??0)}),t.jsx(g,{label:"Peak RSS",value:h(e.peakRssBytes)}),m.read!==void 0&&t.jsx(g,{label:"Disk read",value:h(m.read)}),m.write!==void 0&&t.jsx(g,{label:"Disk write",value:h(m.write)})]}),t.jsxs("div",{className:"mt-2 grid grid-cols-2 gap-density-2",children:[t.jsx(y,{label:"CPU %",values:r.cpu,format:f=>`${f.toFixed(1)}%`}),t.jsx(y,{label:"RSS",values:r.rss,format:h}),o.read.length>0&&t.jsx(y,{label:"Disk read",values:o.read,format:h}),o.write.length>0&&t.jsx(y,{label:"Disk write",values:o.write,format:h})]})]}),t.jsx(at,{node:e,...c},e.key)]})}function nt({node:e,samples:s,facet:a}){const{label:c}=De[a];return t.jsxs("div",{className:"space-y-density-3",children:[t.jsx(y,{label:c,values:Le(s,e.key,a),format:String}),t.jsx(Be,{facet:a,reading:Oe(s,e.key,a)})]})}function A({node:e,samples:s,stacks:a=et,links:c,onCollectStack:i,collecting:r,collectError:o,className:m}){const[f,u]=k.useState("overview");if(!e)return t.jsx("div",{className:"flex h-full items-center justify-center text-sm text-muted-foreground",children:t.jsxs("div",{className:"text-center",children:[t.jsx(F,{icon:Ne,className:"mb-2 block text-4xl"}),"Select a process to view its trace"]})});const T=!!(e.environment||e.environmentError),v=[{id:"overview",label:"Overview"},...T?[{id:"env",label:"Environment"}]:[],...Ie(s).map(p=>({id:p,label:De[p].label}))],l=v.some(p=>p.id===f)?f:"overview";return t.jsxs("div",{className:We("h-full space-y-density-3 overflow-y-auto p-density-4",m),"data-process-detail":e.key,children:[t.jsx(tt,{node:e}),v.length>1&&t.jsx(qe,{tabs:v,value:l,onChange:p=>u(p)}),l==="overview"?t.jsx(rt,{node:e,samples:s,stacks:a,links:c,...i?{onCollectStack:i}:{},...r!==void 0?{collecting:r}:{},...o?{collectError:o}:{}}):l==="env"?t.jsx(Be,{facet:"env",...e.environment?{environment:e.environment}:{},...e.environmentError?{error:e.environmentError}:{}}):t.jsx(nt,{node:e,samples:s,facet:l},`${e.key}:${l}`)]})}try{A.displayName="ProcessTraceDetail",A.__docgenInfo={description:`Everything the trace knows about one process: its command and lifetime,
resource usage (CPU, RSS, disk IO) and sparklines, and its stack with a
chooser across the checkpoints that dumped it and collect buttons for the
transports it offers. Tabs for open files, sockets, ports and connections
appear when the samples carry that facet, showing the latest stored list and
a count sparkline, and one for the environment when the node recorded it.
Props-only: the host supplies the selected row and the trace records.`,displayName:"ProcessTraceDetail",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx",methods:[],props:{node:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx",name:"TypeLiteral"}],description:"The selected `process_tree` record; null renders the empty selection state.",name:"node",required:!0,tags:{},type:{name:"ProcessNodeRow | null"}},samples:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx",name:"TypeLiteral"}],description:`\`process_samples\` records; those of other processes are ignored. They carry
the resource series, and the facet counts and lists: a facet tab is shown
only when the samples carry that facet's count, that is when the session
armed it.`,name:"samples",required:!0,tags:{},type:{name:"ProcessSampleRow[]"}},stacks:{defaultValue:{value:"[]"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx",name:"TypeLiteral"}],description:"`stacks` records; those of other processes are ignored.",name:"stacks",required:!1,tags:{},type:{name:"StackRecord[]"}},links:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx",name:"TypeLiteral"}],description:"Host content at the top of Overview, for example a link to the fixture step that started the process.",name:"links",required:!1,tags:{},type:{name:"ReactNode"}},onCollectStack:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx",name:"TypeLiteral"}],description:"Collects a stack for a process over one of its `stackTransports`. Without it\nno collect buttons are shown. A destructive transport (sigquit) kills the\nprocess, so it asks for confirmation first.",name:"onCollectStack",required:!1,tags:{},type:{name:"(key: string, transport: string) => void | Promise<void>"}},collecting:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx",name:"TypeLiteral"}],description:"A collection is in flight: collect buttons are disabled.",name:"collecting",required:!1,tags:{},type:{name:"boolean"}},collectError:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx",name:"TypeLiteral"}],description:"Why the last collection failed.",name:"collectError",required:!1,tags:{},type:{name:"string"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/ProcessTraceDetail.tsx",name:"TypeLiteral"}],description:"",name:"className",required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const{expect:x,userEvent:U,within:b}=__STORYBOOK_MODULE_TEST__,w=e=>$.find(s=>s.key===e),ks={title:"Data/Traces/ProcessTraceDetail",component:A,args:{node:w("101:100"),samples:Ae,stacks:Fe},decorators:[e=>t.jsx("div",{className:"h-[640px] max-w-3xl overflow-hidden rounded-md border border-border",children:t.jsx(e,{})})],parameters:{docs:{description:{component:"One process of a `process_tree` trace: command, lifetime, resource tiles and CPU/RSS/disk sparklines from `process_samples`, and its stack from the `stacks` kind with a chooser across the checkpoints that dumped it and collect buttons for the transports the node offers (a destructive one, sigquit, asks first). Tabs for open files, sockets, ports and connections appear when the samples carry that facet and show the latest stored list with its count over time; the Environment tab reads the node."}}}},j={args:{onCollectStack:async()=>{}},play:async({canvasElement:e})=>{const s=b(e);await x(s.getByText("Native sample")).toBeInTheDocument(),await x(s.getByText("Dump goroutines & kill")).toBeInTheDocument()}},N={args:{node:w("100:1"),onCollectStack:async()=>{}},play:async({canvasElement:e})=>{const s=b(e);await U.selectOptions(s.getByRole("combobox",{name:"Stack checkpoint"}),"ckpt-periodic"),await x(s.queryByText("g22")).not.toBeInTheDocument()}},D={args:{onCollectStack:async()=>{},collecting:!0}},B={args:{onCollectStack:async()=>{},collectError:"session not found: the run has ended"}},C={args:{node:w("102:101"),samples:[]},play:async({canvasElement:e})=>{await x(b(e).getByText("the process exited before a stack could be read")).toBeInTheDocument()}},P={args:{node:w("300:299"),samples:[],stacks:[]}},E={args:{links:t.jsxs("section",{children:[t.jsx("div",{className:"mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",children:"Step"}),t.jsx("a",{href:"#step",className:"text-sm text-primary hover:underline",children:"go test ./pkg/..."})]})}},R={args:{samples:K},play:async({canvasElement:e})=>{const s=b(e);await x(s.getByRole("img",{name:"Disk read over time"})).toBeInTheDocument(),await U.click(s.getByRole("tab",{name:"Open files"})),await x(await s.findByText("/work/repo/pkg")).toBeInTheDocument()}},I={args:{node:w("100:1")},play:async({canvasElement:e})=>{const s=b(e);await U.click(s.getByRole("tab",{name:"Environment"})),await x(await s.findByText("GOFLAGS")).toBeInTheDocument()}},_={args:{node:null,samples:[]}},L={decorators:[],render:e=>{const[s,a]=k.useState("101:100");return t.jsxs("div",{className:"flex h-[640px] overflow-hidden rounded-md border border-border",children:[t.jsx("div",{className:"w-1/2 overflow-auto border-r border-border",children:t.jsx(Ze,{nodes:$,samples:K,selectedKey:s,onSelect:a})}),t.jsx("div",{className:"min-w-0 flex-1",children:t.jsx(A,{...e,node:$.find(c=>c.key===s)??null,samples:K,onCollectStack:async()=>{}})})]})}};var H,Q,z;j.parameters={...j.parameters,docs:{...(H=j.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(z=(Q=j.parameters)==null?void 0:Q.docs)==null?void 0:z.source}}};var Y,J,X;N.parameters={...N.parameters,docs:{...(Y=N.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...(X=(J=N.parameters)==null?void 0:J.docs)==null?void 0:X.source}}};var Z,ee,te;D.parameters={...D.parameters,docs:{...(Z=D.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  args: {
    onCollectStack: async () => {},
    collecting: true
  }
}`,...(te=(ee=D.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var se,ae,re;B.parameters={...B.parameters,docs:{...(se=B.parameters)==null?void 0:se.docs,source:{originalSource:`{
  args: {
    onCollectStack: async () => {},
    collectError: "session not found: the run has ended"
  }
}`,...(re=(ae=B.parameters)==null?void 0:ae.docs)==null?void 0:re.source}}};var ne,oe,ie;C.parameters={...C.parameters,docs:{...(ne=C.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  args: {
    node: byKey("102:101"),
    samples: []
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("the process exited before a stack could be read")).toBeInTheDocument();
  }
}`,...(ie=(oe=C.parameters)==null?void 0:oe.docs)==null?void 0:ie.source}}};var ce,le,de;P.parameters={...P.parameters,docs:{...(ce=P.parameters)==null?void 0:ce.docs,source:{originalSource:`{
  args: {
    node: byKey("300:299"),
    samples: [],
    stacks: []
  }
}`,...(de=(le=P.parameters)==null?void 0:le.docs)==null?void 0:de.source}}};var pe,me,ue;E.parameters={...E.parameters,docs:{...(pe=E.parameters)==null?void 0:pe.docs,source:{originalSource:`{
  args: {
    links: <section>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Step</div>
        <a href="#step" className="text-sm text-primary hover:underline">
          go test ./pkg/...
        </a>
      </section>
  }
}`,...(ue=(me=E.parameters)==null?void 0:me.docs)==null?void 0:ue.source}}};var he,xe,fe;R.parameters={...R.parameters,docs:{...(he=R.parameters)==null?void 0:he.docs,source:{originalSource:`{
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
}`,...(fe=(xe=R.parameters)==null?void 0:xe.docs)==null?void 0:fe.source}}};var ve,ge,ye;I.parameters={...I.parameters,docs:{...(ve=I.parameters)==null?void 0:ve.docs,source:{originalSource:`{
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
}`,...(ye=(ge=I.parameters)==null?void 0:ge.docs)==null?void 0:ye.source}}};var ke,be,we;_.parameters={..._.parameters,docs:{...(ke=_.parameters)==null?void 0:ke.docs,source:{originalSource:`{
  args: {
    node: null,
    samples: []
  }
}`,...(we=(be=_.parameters)==null?void 0:be.docs)==null?void 0:we.source}}};var Te,Se,je;L.parameters={...L.parameters,docs:{...(Te=L.parameters)==null?void 0:Te.docs,source:{originalSource:`{
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
}`,...(je=(Se=L.parameters)==null?void 0:Se.docs)==null?void 0:je.source}}};const bs=["BusyChildWithNativeSample","RootWithCheckpointChooser","Collecting","CollectFailed","ExitedWithFailedDump","WithoutSamples","WithStepLink","WithDiskAndFacets","EnvironmentTab","NothingSelected","BesideTheTree"];export{L as BesideTheTree,j as BusyChildWithNativeSample,B as CollectFailed,D as Collecting,I as EnvironmentTab,C as ExitedWithFailedDump,_ as NothingSelected,N as RootWithCheckpointChooser,R as WithDiskAndFacets,E as WithStepLink,P as WithoutSamples,bs as __namedExportsOrder,ks as default};
