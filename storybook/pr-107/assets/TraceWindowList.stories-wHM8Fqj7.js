var C=Object.defineProperty;var $=(e,t,a)=>t in e?C(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var v=(e,t,a)=>$(e,typeof t!="symbol"?t+"":t,a);import{j as r,r as p}from"./iframe-BsAqiW63.js";import{g as T,s as R,k as w,b as M,h as F}from"./fixtures-C3TGvGxW.js";import{T as H}from"./TraceView-Due3q5iO.js";import"./preload-helper-Drww7zV3.js";import"./utils-DW-IJACk.js";import"./DataTable-BJptSIQ7.js";import"./SortableHeader-kFQrF4xZ.js";import"./loading-BJEbCWIe.js";import"./router-BgYu87PQ.js";import"./Modal-qlF4Wnfg.js";import"./index-DEP2UBhX.js";import"./index-DuXfw_hg.js";import"./Icon-Dyy6aaqa.js";import"./button-BtSAOAKJ.js";import"./index-CPURVhFy.js";import"./modalStack-DSQeidlD.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BRWLo9rk.js";import"./floating-ui.react-C__wji9y.js";import"./FilterPill-Bzw0s4Xn.js";import"./filter-bar-multi-UjrkZIQp.js";import"./Combobox-BKuWHLhN.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Bx8fiptj.js";import"./MultiSelect-C8zfQc50.js";import"./RangeSlider-DPi11dKG.js";import"./TimeRange-BYkBh0gt.js";import"./select-Dx3dTqXz.js";import"./WorkloadPicker-Bi9tT_P3.js";import"./NamespacePicker-my8PKnLF.js";import"./index-CMSqFLvx.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-VJO0GUDl.js";import"./TagList-B5FA-7SG.js";import"./Badge-BSYyZDva.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-DFfEldqR.js";import"./Properties-DOLNt58n.js";import"./IconButton-CrvV3w7r.js";import"./DropdownMenu-CRLAXTiF.js";import"./DropdownMenuSubmenu-CyJ-SNUG.js";import"./format-2niohfpq.js";import"./JsonView-MllwN6TG.js";import"./AccordionList-CmL7DXC2.js";import"./collections-CoHfwOze.js";import"./StatusDot-CrwAY-qs.js";import"./StackDumpView-w425JzSB.js";import"./frame-heuristics-D62qKi0n.js";import"./JvmStackTrace-Dgyu4kSq.js";import"./StackFrameRow-BaIi5t3a.js";import"./FrameSourceWindow-C7BkTYwa.js";import"./code-highlight-DwCrX-Hn.js";import"./HighlightedTokens-BUaKcwG1.js";import"./GoProfileView-Da4fihJ1.js";import"./process-tree-BV4Gc7wn.js";import"./stack-checkpoints-UeFU0tRC.js";import"./ProcessTraceTree-BMcVaZcZ.js";import"./utils-Cc6tkQt_.js";import"./Tree-CVzpFtCq.js";import"./TreeNode-DwfXB92K.js";import"./SqlTraceTable-DDkz9gNw.js";import"./Switch-EcEvbvOl.js";import"./CodeBlock-BNi0pMSL.js";import"./CodeDiff-Y1v5LX7n.js";import"./SegmentedControl-CKXvowSa.js";import"./code-diff-BUXB4Bx8.js";import"./TerminalCastPlayer-Cqy8Ridx.js";import"./AnsiHtml-fT4U1N1H.js";import"./TraceHarView-CqJW7wFH.js";import"./HarPanel-Dn5MhPvi.js";import"./use-resource-clock-BDxUuUeC.js";const K="This run's trace store is not served, so its windows cannot be opened.",Y=6,X=e=>`${e.run_id}:${e.kind}:${e.stream}:${e.afterSeq??0}`,z=e=>typeof e=="string"||typeof e=="number"||typeof e=="boolean";function G({summary:e}){const t=Object.entries(e??{}).filter(([a,o])=>a!=="count"&&z(o)).slice(0,Y);return r.jsx(r.Fragment,{children:t.map(([a,o])=>r.jsxs("span",{className:"rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground","data-summary-chip":a,children:[a,": ",r.jsx("span",{className:"font-mono",children:String(o)})]},a))})}class J extends p.Component{constructor(){super(...arguments);v(this,"state",{})}static getDerivedStateFromError(a){return{error:a instanceof Error?a.message:String(a)}}render(){return this.state.error?r.jsx("div",{className:"px-2 py-1.5 text-xs text-red-700 dark:text-red-400",role:"alert",children:this.state.error}):this.props.children}}function Q({window:e,fetchRecords:t}){const[a,o]=p.useState(null),[c,d]=p.useState(void 0);return p.useEffect(()=>{const s=new AbortController;return t(e,s.signal).then(o,i=>{s.signal.aborted||d(i instanceof Error?i.message:String(i))}),()=>s.abort()},[e.run_id,e.kind,e.stream,e.afterSeq,e.toSeq]),c?r.jsx("div",{className:"whitespace-pre-wrap border-t border-border px-2 py-1.5 text-xs text-red-700 dark:text-red-400",role:"alert",children:c}):a?r.jsx("div",{className:"border-t border-border",style:{height:420},children:r.jsx(J,{children:r.jsx(H,{kind:e.kind,rows:a})})}):r.jsx("div",{className:"border-t border-border px-2 py-1.5 text-xs text-muted-foreground",children:"Loading records..."})}function Z({window:e,mount:t,formats:a,fetchRecords:o,exportUrl:c,openUrl:d}){const[s,i]=p.useState(!1),m="text-xs text-primary hover:underline";return r.jsxs("div",{className:"rounded border border-border","data-trace-kind":e.kind,children:[r.jsxs("div",{className:"flex flex-wrap items-center gap-2 px-2 py-1.5 text-sm",children:[r.jsx("span",{className:"font-mono font-medium text-foreground",children:e.kind}),r.jsxs("span",{className:"text-xs text-muted-foreground",children:[e.count," ",e.count===1?"record":"records"]}),r.jsx(G,{summary:e.summary}),r.jsx("span",{className:"flex-1"}),t&&r.jsxs(r.Fragment,{children:[r.jsx("a",{className:m,href:d(e),target:"_blank",rel:"noreferrer",children:"Open in query"}),a.map(n=>r.jsx("a",{className:m,href:c(e,n.name),download:!0,children:n.name.toUpperCase()},n.name)),r.jsx("button",{type:"button",className:m,onClick:()=>i(!s),children:s?"Hide":"View"})]})]}),e.error&&r.jsx("div",{className:"whitespace-pre-wrap px-2 pb-1.5 text-xs text-red-700 dark:text-red-400",children:e.error}),s&&t&&r.jsx(Q,{window:e,fetchRecords:o})]})}function y({windows:e,resolve:t,formats:a,fetchRecords:o,exportUrl:c,openUrl:d,error:s}){const i=e.map(n=>t(n)),m=[...new Set(i.filter(n=>!n.mount).map(n=>n.unavailable||K))];return r.jsxs("div",{children:[r.jsx("h3",{className:"mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:"Traces"}),m.map(n=>r.jsx("div",{className:"mb-2 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300",role:"status",children:n},n)),r.jsx("div",{className:"space-y-2",children:e.map((n,I)=>r.jsx(Z,{window:n,mount:i[I].mount,formats:a(n.kind),fetchRecords:o,exportUrl:c,openUrl:d},X(n)))}),s&&r.jsx("div",{className:"mt-1 text-xs text-red-700 dark:text-red-400",children:s})]})}try{y.displayName="TraceWindowList",y.__docgenInfo={description:`One fixture's trace windows: what each captured (kind, record count, summary
chips), a link into the query app at exactly that window, per-format export
downloads and an inline viewer of its records. Windows of a run whose store
is not served say why, once per reason. Props-only: the host resolves stores
and builds the URLs.`,displayName:"TraceWindowList",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx",methods:[],props:{windows:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx",name:"TypeLiteral"}],description:"",name:"windows",required:!0,tags:{},type:{name:"TraceWindow[]"}},resolve:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx",name:"TypeLiteral"}],description:"Resolves the store of a window's run.",name:"resolve",required:!0,tags:{},type:{name:"(window: TraceWindow) => TraceWindowSource"}},formats:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx",name:"TypeLiteral"}],description:'The export formats of a kind, for example `[{ name: "har" }]`.',name:"formats",required:!0,tags:{},type:{name:"(kind: string) => { name: string; }[]"}},fetchRecords:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx",name:"TypeLiteral"}],description:"Reads a window's records for the inline viewer. Must reject on failure and honour `signal`.",name:"fetchRecords",required:!0,tags:{},type:{name:"(window: TraceWindow, signal: AbortSignal) => Promise<TraceRow[]>"}},exportUrl:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx",name:"TypeLiteral"}],description:"Download URL of a window in one export format.",name:"exportUrl",required:!0,tags:{},type:{name:"(window: TraceWindow, format: string) => string"}},openUrl:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx",name:"TypeLiteral"}],description:"URL of the query app opened at exactly this window.",name:"openUrl",required:!0,tags:{},type:{name:"(window: TraceWindow) => string"}},error:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx",name:"TypeLiteral"}],description:"A failure that applies to the whole list, such as the export formats not loading.",name:"error",required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const{expect:g,userEvent:k,within:b}=__STORYBOOK_MODULE_TEST__,kr={title:"Data/Traces/TraceWindowList",component:y,args:{windows:w,resolve:()=>({mount:"/query/run-1"}),formats:e=>e==="http_proxy"?[{name:"har"}]:[],fetchRecords:async e=>e.kind==="process_tree"?M:F,exportUrl:(e,t)=>`#export-${e.kind}.${t}`,openUrl:e=>`#open-${e.kind}`},decorators:[e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{})})],parameters:{docs:{description:{component:"The trace windows one fixture step armed: kind, record count, summary chips, a link into the query app at that window, per-format export downloads and an inline `TraceView`. Windows of a run whose store is not served say why once. Props-only: the host resolves stores and builds the URLs."}}}},l={play:async({canvasElement:e})=>{const t=b(e);await k.click(t.getAllByRole("button",{name:"View"})[1]),await g(await t.findByText("orphan")).toBeInTheDocument()}},u={args:{windows:[{kind:"goprof",stream:"step-1",run_id:"run-1",count:T.length,summary:{profiles:2}},{kind:"stacks",stream:"step-1",run_id:"run-1",count:R.length,summary:{checkpoints:4}}],formats:e=>e==="goprof"?[{name:"pprof"}]:[],fetchRecords:async e=>e.kind==="goprof"?T:R},play:async({canvasElement:e})=>{const t=b(e);await k.click(t.getAllByRole("button",{name:"View"})[0]),await g(await t.findByRole("combobox",{name:"Profile checkpoint"})).toBeInTheDocument()}},x={args:{resolve:()=>({unavailable:"run-1 was pruned since this run finished"})}},f={args:{windows:[{...w[0],error:"stream step-1 not found in run-1"},w[1]]}},h={args:{fetchRecords:async()=>[{unexpected:!0}]},play:async({canvasElement:e})=>{const t=b(e);await k.click(t.getAllByRole("button",{name:"View"})[0]),await g(await t.findByRole("alert")).toBeInTheDocument()}};var j,N,S;l.parameters={...l.parameters,docs:{...(j=l.parameters)==null?void 0:j.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", {
      name: "View"
    })[1]!);
    await expect(await canvas.findByText("orphan")).toBeInTheDocument();
  }
}`,...(S=(N=l.parameters)==null?void 0:N.docs)==null?void 0:S.source}}};var W,_,E;u.parameters={...u.parameters,docs:{...(W=u.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    windows: [{
      kind: "goprof",
      stream: "step-1",
      run_id: "run-1",
      count: goProfileRecords.length,
      summary: {
        profiles: 2
      }
    }, {
      kind: "stacks",
      stream: "step-1",
      run_id: "run-1",
      count: stackRecords.length,
      summary: {
        checkpoints: 4
      }
    }],
    formats: kind => kind === "goprof" ? [{
      name: "pprof"
    }] : [],
    fetchRecords: async window => (window.kind === "goprof" ? goProfileRecords : stackRecords) as unknown as TraceRow[]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", {
      name: "View"
    })[0]!);
    await expect(await canvas.findByRole("combobox", {
      name: "Profile checkpoint"
    })).toBeInTheDocument();
  }
}`,...(E=(_=u.parameters)==null?void 0:_.docs)==null?void 0:E.source}}};var L,V,B;x.parameters={...x.parameters,docs:{...(L=x.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    resolve: () => ({
      unavailable: "run-1 was pruned since this run finished"
    })
  }
}`,...(B=(V=x.parameters)==null?void 0:V.docs)==null?void 0:B.source}}};var q,U,A;f.parameters={...f.parameters,docs:{...(q=f.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    windows: [{
      ...traceWindows[0]!,
      error: "stream step-1 not found in run-1"
    }, traceWindows[1]!]
  }
}`,...(A=(U=f.parameters)==null?void 0:U.docs)==null?void 0:A.source}}};var P,D,O;h.parameters={...h.parameters,docs:{...(P=h.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    fetchRecords: async () => [{
      unexpected: true
    }] as TraceRow[]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", {
      name: "View"
    })[0]!);
    await expect(await canvas.findByRole("alert")).toBeInTheDocument();
  }
}`,...(O=(D=h.parameters)==null?void 0:D.docs)==null?void 0:O.source}}};const br=["Windows","ProfileAndStackWindows","StoreNotServed","WindowReadError","ViewerRefusesRecords"];export{u as ProfileAndStackWindows,x as StoreNotServed,h as ViewerRefusesRecords,f as WindowReadError,l as Windows,br as __namedExportsOrder,kr as default};
