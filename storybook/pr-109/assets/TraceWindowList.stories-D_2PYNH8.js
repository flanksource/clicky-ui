import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{f as r,n as i,r as a,s as o,t as s,u as c}from"./fixtures-DQ4-m9zu.js";import{n as l,t as u}from"./TraceView-B6j0wgP6.js";function d({summary:e}){let t=Object.entries(e??{}).filter(([e,t])=>e!==`count`&&b(t)).slice(0,v);return(0,g.jsx)(g.Fragment,{children:t.map(([e,t])=>(0,g.jsxs)(`span`,{className:`rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground`,"data-summary-chip":e,children:[e,`: `,(0,g.jsx)(`span`,{className:`font-mono`,children:String(t)})]},e))})}function f({window:e,fetchRecords:t}){let[n,r]=(0,h.useState)(null),[i,a]=(0,h.useState)(void 0);return(0,h.useEffect)(()=>{let n=new AbortController;return t(e,n.signal).then(r,e=>{n.signal.aborted||a(e instanceof Error?e.message:String(e))}),()=>n.abort()},[e.run_id,e.kind,e.stream,e.afterSeq,e.toSeq]),i?(0,g.jsx)(`div`,{className:`whitespace-pre-wrap border-t border-border px-2 py-1.5 text-xs text-red-700 dark:text-red-400`,role:`alert`,children:i}):n?(0,g.jsx)(`div`,{className:`border-t border-border`,style:{height:420},children:(0,g.jsx)(x,{children:(0,g.jsx)(u,{kind:e.kind,rows:n})})}):(0,g.jsx)(`div`,{className:`border-t border-border px-2 py-1.5 text-xs text-muted-foreground`,children:`Loading records...`})}function p({window:e,mount:t,formats:n,fetchRecords:r,exportUrl:i,openUrl:a}){let[o,s]=(0,h.useState)(!1),c=`text-xs text-primary hover:underline`;return(0,g.jsxs)(`div`,{className:`rounded border border-border`,"data-trace-kind":e.kind,children:[(0,g.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2 px-2 py-1.5 text-sm`,children:[(0,g.jsx)(`span`,{className:`font-mono font-medium text-foreground`,children:e.kind}),(0,g.jsxs)(`span`,{className:`text-xs text-muted-foreground`,children:[e.count,` `,e.count===1?`record`:`records`]}),(0,g.jsx)(d,{summary:e.summary}),(0,g.jsx)(`span`,{className:`flex-1`}),t&&(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(`a`,{className:c,href:a(e),target:`_blank`,rel:`noreferrer`,children:`Open in query`}),n.map(t=>(0,g.jsx)(`a`,{className:c,href:i(e,t.name),download:!0,children:t.name.toUpperCase()},t.name)),(0,g.jsx)(`button`,{type:`button`,className:c,onClick:()=>s(!o),children:o?`Hide`:`View`})]})]}),e.error&&(0,g.jsx)(`div`,{className:`whitespace-pre-wrap px-2 pb-1.5 text-xs text-red-700 dark:text-red-400`,children:e.error}),o&&t&&(0,g.jsx)(f,{window:e,fetchRecords:r})]})}function m({windows:e,resolve:t,formats:n,fetchRecords:r,exportUrl:i,openUrl:a,error:o}){let s=e.map(e=>t(e)),c=[...new Set(s.filter(e=>!e.mount).map(e=>e.unavailable||_))];return(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`h3`,{className:`mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground`,children:`Traces`}),c.map(e=>(0,g.jsx)(`div`,{className:`mb-2 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300`,role:`status`,children:e},e)),(0,g.jsx)(`div`,{className:`space-y-2`,children:e.map((e,t)=>(0,g.jsx)(p,{window:e,mount:s[t].mount,formats:n(e.kind),fetchRecords:r,exportUrl:i,openUrl:a},y(e)))}),o&&(0,g.jsx)(`div`,{className:`mt-1 text-xs text-red-700 dark:text-red-400`,children:o})]})}var h,g,_,v,y,b,x;function S(){return(S=e((()=>{h=t(),l(),g=n(),_=`This run's trace store is not served, so its windows cannot be opened.`,v=6,y=e=>`${e.run_id}:${e.kind}:${e.stream}:${e.afterSeq??0}`,b=e=>typeof e==`string`||typeof e==`number`||typeof e==`boolean`,x=class extends h.Component{state={};static getDerivedStateFromError(e){return{error:e instanceof Error?e.message:String(e)}}render(){return this.state.error?(0,g.jsx)(`div`,{className:`px-2 py-1.5 text-xs text-red-700 dark:text-red-400`,role:`alert`,children:this.state.error}):this.props.children}};try{m.displayName=`TraceWindowList`,m.__docgenInfo={description:`One fixture's trace windows: what each captured (kind, record count, summary
chips), a link into the query app at exactly that window, per-format export
downloads and an inline viewer of its records. Windows of a run whose store
is not served say why, once per reason. Props-only: the host resolves stores
and builds the URLs.`,displayName:`TraceWindowList`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx`,methods:[],props:{windows:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx`,name:`TypeLiteral`}],description:``,name:`windows`,required:!0,tags:{},type:{name:`TraceWindow[]`}},resolve:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx`,name:`TypeLiteral`}],description:`Resolves the store of a window's run.`,name:`resolve`,required:!0,tags:{},type:{name:`(window: TraceWindow) => TraceWindowSource`}},formats:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx`,name:`TypeLiteral`}],description:'The export formats of a kind, for example `[{ name: "har" }]`.',name:`formats`,required:!0,tags:{},type:{name:`(kind: string) => { name: string; }[]`}},fetchRecords:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx`,name:`TypeLiteral`}],description:"Reads a window's records for the inline viewer. Must reject on failure and honour `signal`.",name:`fetchRecords`,required:!0,tags:{},type:{name:`(window: TraceWindow, signal: AbortSignal) => Promise<TraceRow[]>`}},exportUrl:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx`,name:`TypeLiteral`}],description:`Download URL of a window in one export format.`,name:`exportUrl`,required:!0,tags:{},type:{name:`(window: TraceWindow, format: string) => string`}},openUrl:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx`,name:`TypeLiteral`}],description:`URL of the query app opened at exactly this window.`,name:`openUrl`,required:!0,tags:{},type:{name:`(window: TraceWindow) => string`}},error:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/traces/TraceWindowList.tsx`,name:`TypeLiteral`}],description:`A failure that applies to the whole list, such as the export formats not loading.`,name:`error`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}var C,w,T,E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{a(),S(),C=n(),{expect:w,userEvent:T,within:E}=__STORYBOOK_MODULE_TEST__,D={title:`Data/Traces/TraceWindowList`,component:m,args:{windows:r,resolve:()=>({mount:`/query/run-1`}),formats:e=>e===`http_proxy`?[{name:`har`}]:[],fetchRecords:async e=>e.kind===`process_tree`?o:i,exportUrl:(e,t)=>`#export-${e.kind}.${t}`,openUrl:e=>`#open-${e.kind}`},decorators:[e=>(0,C.jsx)(`div`,{className:`max-w-3xl`,children:(0,C.jsx)(e,{})})],parameters:{docs:{description:{component:"The trace windows one fixture step armed: kind, record count, summary chips, a link into the query app at that window, per-format export downloads and an inline `TraceView`. Windows of a run whose store is not served say why once. Props-only: the host resolves stores and builds the URLs."}}}},O={play:async({canvasElement:e})=>{let t=E(e);await T.click(t.getAllByRole(`button`,{name:`View`})[1]),await w(await t.findByText(`orphan`)).toBeInTheDocument()}},k={args:{windows:[{kind:`goprof`,stream:`step-1`,run_id:`run-1`,count:s.length,summary:{profiles:2}},{kind:`stacks`,stream:`step-1`,run_id:`run-1`,count:c.length,summary:{checkpoints:4}}],formats:e=>e===`goprof`?[{name:`pprof`}]:[],fetchRecords:async e=>e.kind===`goprof`?s:c},play:async({canvasElement:e})=>{let t=E(e);await T.click(t.getAllByRole(`button`,{name:`View`})[0]),await w(await t.findByRole(`combobox`,{name:`Profile checkpoint`})).toBeInTheDocument()}},A={args:{resolve:()=>({unavailable:`run-1 was pruned since this run finished`})}},j={args:{windows:[{...r[0],error:`stream step-1 not found in run-1`},r[1]]}},M={args:{fetchRecords:async()=>[{unexpected:!0}]},play:async({canvasElement:e})=>{let t=E(e);await T.click(t.getAllByRole(`button`,{name:`View`})[0]),await w(await t.findByRole(`alert`)).toBeInTheDocument()}},N=[`Windows`,`ProfileAndStackWindows`,`StoreNotServed`,`WindowReadError`,`ViewerRefusesRecords`],O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", {
      name: "View"
    })[1]!);
    await expect(await canvas.findByText("orphan")).toBeInTheDocument();
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    resolve: () => ({
      unavailable: "run-1 was pruned since this run finished"
    })
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    windows: [{
      ...traceWindows[0]!,
      error: "stream step-1 not found in run-1"
    }, traceWindows[1]!]
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}}})))()}P();export{k as ProfileAndStackWindows,A as StoreNotServed,M as ViewerRefusesRecords,j as WindowReadError,O as Windows,N as __namedExportsOrder,D as default};