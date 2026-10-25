import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,zr as i}from"./icons-N6BqLuiz.js";import{g as a,h as o}from"./suspense-Bcp9qyqt.js";import{n as s,t as c}from"./queryClient-BlbTeML9.js";import{n as l,t as u}from"./TimeseriesPanel-zu9rsfJb.js";function d(e,t){let n=2166136261;for(let t of e)n=(n^t.charCodeAt(0))*16777619;return n=(n^t)>>>0,(n%1e3/1e3-.5)*2}function f(e,t,n=0){return Array.from({length:S},(r,i)=>{let a=n+t*(Math.sin(i/6+e.length)*.5+.5+d(e,i)*.15);return{at:new Date(b+i*x).toISOString(),value:Math.max(0,a)}})}function p(e){return async t=>{let n=e.find(e=>t.includes(e.match))??e[0];return{id:t,points:f(t,n.scale,n.offset??0)}}}function m(e,t,n=0){return async({signal:r})=>(r.throwIfAborted(),{id:e,points:f(e,t,n)})}function h(e){let t=(0,g.useMemo)(()=>new c({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return(0,_.jsx)(o,{client:t,children:(0,_.jsx)(`div`,{className:`w-[420px]`,children:(0,_.jsx)(u,{...e})})})}var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{g=t(),s(),a(),r(),l(),_=n(),{expect:v,within:y}=__STORYBOOK_MODULE_TEST__,b=Date.parse(`2026-06-02T12:00:00Z`),x=3e4,S=60,C=()=>new Promise(()=>{}),w=async()=>{throw Error(`metrics request failed: 503`)},T=async e=>({id:e,points:[]}),E={title:`Charts/TimeseriesPanel`,component:u,parameters:{docs:{description:{component:"Polling time-series chart backed by TanStack Query. Stories pass a synthetic `fetcher` (no network) and `refreshMs={0}` to disable polling. Supports single- or multi-series, area/line/stacked variants, mirrored series, Grafana-style units, and an expand-to-modal action."}}},argTypes:{title:{control:`text`},url:{control:`text`},baseUrl:{control:`text`},unit:{control:`select`,options:[`percent`,`bytes`,`short`,`ms`]},range:{control:`text`},refreshMs:{control:{type:`number`,min:0,step:1e3}},variant:{control:`select`,options:[`area`,`line`,`stacked`,`breakdown`]},expandVariant:{control:`inline-radio`,options:[`area`,`line`,`stacked`]},height:{control:{type:`range`,min:80,max:360,step:20}},total:{control:{type:`number`,min:0,step:1e3}},expandable:{control:`boolean`},icon:{table:{disable:!0}},fetcher:{table:{disable:!0}},series:{table:{disable:!0}},referenceLines:{table:{disable:!0}},className:{table:{disable:!0}}},render:e=>(0,_.jsx)(h,{...e})},D={args:{title:`CPU`,url:`/api/v1/metrics/sqlserver.cpu`,unit:`percent`,refreshMs:0,fetcher:p([{match:`cpu`,scale:80,offset:5}])}},O={args:{...D.args,variant:`line`}},k={args:{...D.args,icon:i}},A={args:{title:`Memory`,url:`/api/v1/metrics/sqlserver.memory`,unit:`bytes`,refreshMs:0,fetcher:p([{match:`memory`,scale:6e9,offset:1e9}])}},j={args:{title:`Connections`,baseUrl:`/api/v1/metrics/`,unit:`short`,refreshMs:0,series:[{id:`conn.active`,label:`active`},{id:`conn.idle`,label:`idle`}],fetcher:p([{match:`active`,scale:400,offset:50},{match:`idle`,scale:150,offset:20}])}},M={args:{...j.args,variant:`stacked`}},N={args:{title:`Pod resources`,icon:i,baseUrl:`/api/v1/metrics/`,refreshMs:0,series:[{id:`pod.cpu`,label:`CPU`,unit:`percent`},{id:`pod.memory`,label:`Working set`,unit:`bytes`}],fetcher:p([{match:`cpu`,scale:70,offset:10},{match:`memory`,scale:5e9,offset:8e8}])}},P={args:{title:`IOPS`,baseUrl:`/api/v1/metrics/`,unit:`short`,refreshMs:0,series:[{id:`iops.read`,label:`reads`},{id:`iops.write`,label:`writes`,transform:e=>-e}],fetcher:p([{match:`read`,scale:1200,offset:100},{match:`write`,scale:800,offset:80}])}},F={args:{title:`Heap`,baseUrl:`/api/v1/metrics/`,unit:`bytes`,refreshMs:0,variant:`breakdown`,total:8e9,series:[{id:`heap.eden`,label:`Eden Space`,color:`bg-emerald-500`,current:24e8},{id:`heap.survivor`,label:`Survivor Space`,color:`bg-amber-500`,current:3e8},{id:`heap.old`,label:`Old Gen`,color:`bg-rose-500`,current:31e8}],fetcher:p([{match:`eden`,scale:24e8,offset:5e8},{match:`survivor`,scale:3e8,offset:5e7},{match:`old`,scale:31e8,offset:1e9}])}},I={args:{...F.args,series:[{id:`heap.eden`,label:`Eden Space`,color:`#10b981`,current:24e8},{id:`heap.survivor`,label:`Survivor Space`,color:`#f59e0b`,current:3e8},{id:`heap.old`,label:`Old Gen`,color:`var(--chart-2, #ef4444)`,current:31e8}]}},L={args:{title:`Disk`,baseUrl:`/api/v1/metrics/`,unit:`bytes`,refreshMs:0,variant:`breakdown`,total:512e9,series:[{id:`disk.system`,label:`System`,color:`bg-sky-500`,current:64e9},{id:`disk.apps`,label:`Applications`,color:`bg-violet-500`,current:96e9},{id:`disk.data`,label:`Data`,color:`bg-emerald-500`,current:18e10},{id:`disk.logs`,label:`Logs`,color:`bg-amber-500`,current:48e9},{id:`disk.cache`,label:`Cache`,color:`bg-rose-500`,current:72e9}],fetcher:p([{match:`system`,scale:64e9,offset:1e10},{match:`apps`,scale:96e9,offset:2e10},{match:`data`,scale:18e10,offset:4e10},{match:`logs`,scale:48e9,offset:8e9},{match:`cache`,scale:72e9,offset:12e9}])}},R={args:{title:`Requests`,baseUrl:`/api/v1/metrics/`,unit:`short`,refreshMs:0,variant:`breakdown`,series:[{id:`http.2xx`,label:`2xx Success`,color:`bg-green-500`,current:8420},{id:`http.3xx`,label:`3xx Redirect`,color:`bg-blue-500`,current:640},{id:`http.4xx`,label:`4xx Client`,color:`bg-amber-500`,current:310},{id:`http.5xx`,label:`5xx Server`,color:`bg-red-500`,current:47}],fetcher:p([{match:`2xx`,scale:8420,offset:4e3},{match:`3xx`,scale:640,offset:200},{match:`4xx`,scale:310,offset:80},{match:`5xx`,scale:47,offset:5}])}},z={args:{title:`CPU`,url:`/api/v1/metrics/cpu`,refreshMs:0,fetcher:C}},B={args:{title:`CPU`,url:`/api/v1/metrics/cpu`,refreshMs:0,fetcher:w}},V={args:{title:`CPU`,url:`/api/v1/metrics/cpu`,refreshMs:0,fetcher:T}},H={args:{title:`Memory (vm-42)`,unit:`bytes`,refreshMs:0,series:[{id:`vm-42.memory.used`,label:`used`,load:m(`vm-42.memory.used`,4e9,2e9)},{id:`vm-42.memory.cache`,label:`cache`,load:m(`vm-42.memory.cache`,1e9,5e8)}],referenceLines:[{value:8*1024**3,label:`capacity`}]},play:async({canvasElement:e})=>{let t=y(e);await v(await t.findByText(`used`)).toBeInTheDocument(),await v(t.getByText(`cache`)).toBeInTheDocument(),await v(t.getByText(`capacity`)).toBeInTheDocument()}},U=[`Area`,`Line`,`WithIcon`,`Bytes`,`MultiSeries`,`Stacked`,`MixedUnits`,`MirroredReadWrite`,`Breakdown`,`BreakdownCssColors`,`BreakdownDiskUsage`,`BreakdownRequestStatus`,`Loading`,`ErrorState`,`CollectingData`,`LoaderSeries`],D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    url: "/api/v1/metrics/sqlserver.cpu",
    unit: "percent",
    refreshMs: 0,
    fetcher: makeFetcher([{
      match: "cpu",
      scale: 80,
      offset: 5
    }])
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    ...Area.args,
    variant: "line"
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    ...Area.args,
    icon: UiChip
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Memory",
    url: "/api/v1/metrics/sqlserver.memory",
    unit: "bytes",
    refreshMs: 0,
    fetcher: makeFetcher([{
      match: "memory",
      scale: 6_000_000_000,
      offset: 1_000_000_000
    }])
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Connections",
    baseUrl: "/api/v1/metrics/",
    unit: "short",
    refreshMs: 0,
    series: [{
      id: "conn.active",
      label: "active"
    }, {
      id: "conn.idle",
      label: "idle"
    }],
    fetcher: makeFetcher([{
      match: "active",
      scale: 400,
      offset: 50
    }, {
      match: "idle",
      scale: 150,
      offset: 20
    }])
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    ...MultiSeries.args,
    variant: "stacked"
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Pod resources",
    icon: UiChip,
    baseUrl: "/api/v1/metrics/",
    refreshMs: 0,
    series: [{
      id: "pod.cpu",
      label: "CPU",
      unit: "percent"
    }, {
      id: "pod.memory",
      label: "Working set",
      unit: "bytes"
    }],
    fetcher: makeFetcher([{
      match: "cpu",
      scale: 70,
      offset: 10
    }, {
      match: "memory",
      scale: 5_000_000_000,
      offset: 800_000_000
    }])
  }
}`,...N.parameters?.docs?.source},description:{story:`Series with different units: CPU (percent) drives the left axis, working-set
memory (bytes) the right. The legend wraps below the chart with each series'
color, label, and latest value so the header never overlaps the title/icon.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    title: "IOPS",
    baseUrl: "/api/v1/metrics/",
    unit: "short",
    refreshMs: 0,
    series: [{
      id: "iops.read",
      label: "reads"
    }, {
      id: "iops.write",
      label: "writes",
      transform: v => -v
    }],
    fetcher: makeFetcher([{
      match: "read",
      scale: 1200,
      offset: 100
    }, {
      match: "write",
      scale: 800,
      offset: 80
    }])
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Heap",
    baseUrl: "/api/v1/metrics/",
    unit: "bytes",
    refreshMs: 0,
    variant: "breakdown",
    total: 8_000_000_000,
    series: [{
      id: "heap.eden",
      label: "Eden Space",
      color: "bg-emerald-500",
      current: 2_400_000_000
    }, {
      id: "heap.survivor",
      label: "Survivor Space",
      color: "bg-amber-500",
      current: 300_000_000
    }, {
      id: "heap.old",
      label: "Old Gen",
      color: "bg-rose-500",
      current: 3_100_000_000
    }],
    fetcher: makeFetcher([{
      match: "eden",
      scale: 2_400_000_000,
      offset: 500_000_000
    }, {
      match: "survivor",
      scale: 300_000_000,
      offset: 50_000_000
    }, {
      match: "old",
      scale: 3_100_000_000,
      offset: 1_000_000_000
    }])
  }
}`,...F.parameters?.docs?.source},description:{story:`Instantaneous stacked bar + legend (e.g. a JVM heap memory breakdown). The
bar segments and legend reflect each series' \`current\` value; the expand
button opens the polled time-series history as an area chart.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    ...Breakdown.args,
    series: [{
      id: "heap.eden",
      label: "Eden Space",
      color: "#10b981",
      current: 2_400_000_000
    }, {
      id: "heap.survivor",
      label: "Survivor Space",
      color: "#f59e0b",
      current: 300_000_000
    }, {
      id: "heap.old",
      label: "Old Gen",
      color: "var(--chart-2, #ef4444)",
      current: 3_100_000_000
    }]
  }
}`,...I.parameters?.docs?.source},description:{story:"Same breakdown, but series colors are given as CSS values (hex / `var()`)\ninstead of Tailwind classes. Both the inline bar/legend and the expand chart\npick up the color identically — series `color` accepts either form.",...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Disk",
    baseUrl: "/api/v1/metrics/",
    unit: "bytes",
    refreshMs: 0,
    variant: "breakdown",
    total: 512_000_000_000,
    series: [{
      id: "disk.system",
      label: "System",
      color: "bg-sky-500",
      current: 64_000_000_000
    }, {
      id: "disk.apps",
      label: "Applications",
      color: "bg-violet-500",
      current: 96_000_000_000
    }, {
      id: "disk.data",
      label: "Data",
      color: "bg-emerald-500",
      current: 180_000_000_000
    }, {
      id: "disk.logs",
      label: "Logs",
      color: "bg-amber-500",
      current: 48_000_000_000
    }, {
      id: "disk.cache",
      label: "Cache",
      color: "bg-rose-500",
      current: 72_000_000_000
    }],
    fetcher: makeFetcher([{
      match: "system",
      scale: 64_000_000_000,
      offset: 10_000_000_000
    }, {
      match: "apps",
      scale: 96_000_000_000,
      offset: 20_000_000_000
    }, {
      match: "data",
      scale: 180_000_000_000,
      offset: 40_000_000_000
    }, {
      match: "logs",
      scale: 48_000_000_000,
      offset: 8_000_000_000
    }, {
      match: "cache",
      scale: 72_000_000_000,
      offset: 12_000_000_000
    }])
  }
}`,...L.parameters?.docs?.source},description:{story:`Disk usage breakdown with many Tailwind-colored segments filling most of the
bar — exercises a near-full breakdown and a longer legend list.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Requests",
    baseUrl: "/api/v1/metrics/",
    unit: "short",
    refreshMs: 0,
    variant: "breakdown",
    series: [{
      id: "http.2xx",
      label: "2xx Success",
      color: "bg-green-500",
      current: 8420
    }, {
      id: "http.3xx",
      label: "3xx Redirect",
      color: "bg-blue-500",
      current: 640
    }, {
      id: "http.4xx",
      label: "4xx Client",
      color: "bg-amber-500",
      current: 310
    }, {
      id: "http.5xx",
      label: "5xx Server",
      color: "bg-red-500",
      current: 47
    }],
    fetcher: makeFetcher([{
      match: "2xx",
      scale: 8420,
      offset: 4000
    }, {
      match: "3xx",
      scale: 640,
      offset: 200
    }, {
      match: "4xx",
      scale: 310,
      offset: 80
    }, {
      match: "5xx",
      scale: 47,
      offset: 5
    }])
  }
}`,...R.parameters?.docs?.source},description:{story:`Request-status breakdown (short counts) with the canonical green/amber/red
Tailwind status palette and no explicit \`total\` — the denominator defaults to
the sum of the segment values, so the bar is fully filled.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    url: "/api/v1/metrics/cpu",
    refreshMs: 0,
    fetcher: loadingForever
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    url: "/api/v1/metrics/cpu",
    refreshMs: 0,
    fetcher: alwaysErrors
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    url: "/api/v1/metrics/cpu",
    refreshMs: 0,
    fetcher: emptyResponse
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Memory (vm-42)",
    unit: "bytes",
    refreshMs: 0,
    series: [{
      id: "vm-42.memory.used",
      label: "used",
      load: makeLoader("vm-42.memory.used", 4_000_000_000, 2_000_000_000)
    }, {
      id: "vm-42.memory.cache",
      label: "cache",
      load: makeLoader("vm-42.memory.cache", 1_000_000_000, 500_000_000)
    }],
    referenceLines: [{
      value: 8 * 1024 ** 3,
      label: "capacity"
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("used")).toBeInTheDocument();
    await expect(canvas.getByText("cache")).toBeInTheDocument();
    await expect(canvas.getByText("capacity")).toBeInTheDocument();
  }
}`,...H.parameters?.docs?.source},description:{story:"Function-backed series: each entry supplies `load({ range, signal })` instead\nof a URL, so no `baseUrl`/`fetcher` is needed. The `id` is then the cache\nidentity and must be unique per data source. `referenceLines` draws a fixed\nvalue (here a static capacity) as a dashed line with its own legend entry.",...H.parameters?.docs?.description}}}})))()}W();export{D as Area,F as Breakdown,I as BreakdownCssColors,L as BreakdownDiskUsage,R as BreakdownRequestStatus,A as Bytes,V as CollectingData,B as ErrorState,O as Line,H as LoaderSeries,z as Loading,P as MirroredReadWrite,N as MixedUnits,j as MultiSeries,M as Stacked,k as WithIcon,U as __namedExportsOrder,E as default};