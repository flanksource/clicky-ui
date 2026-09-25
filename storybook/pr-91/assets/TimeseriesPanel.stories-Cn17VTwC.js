import{ag as Ee,j as x,r as Re}from"./iframe-DxH86FBA.js";import{Q as qe}from"./queryClient-bxPR4XMB.js";import{Q as Fe}from"./suspense-Ds0fW1nV.js";import{T as De}from"./TimeseriesPanel-DZCSNi6M.js";import"./preload-helper-CwXsRPHT.js";import"./utils-DW-IJACk.js";import"./ProgressBar-B6t282Ad.js";import"./format-2niohfpq.js";import"./Modal-i45K_l92.js";import"./index-L0gHVN2T.js";import"./index-CZl4QIDy.js";import"./Icon-w2YOVKhv.js";import"./button-O6d4Fxrc.js";import"./index-CPURVhFy.js";import"./loading-DCaPMG1Q.js";import"./modalStack-DuyRP-Gh.js";import"./zIndex-BGbNBNA8.js";import"./timeseries-query-DJ03AYt_.js";import"./index-C3gA6vb6.js";import"./index-DnL3XN75.js";const{expect:S,within:Ae}=__STORYBOOK_MODULE_TEST__,je=Date.parse("2026-06-02T12:00:00Z"),We=3e4,Ge=60;function Qe(e,r){let s=2166136261;for(const t of e)s=(s^t.charCodeAt(0))*16777619;return s=(s^r)>>>0,(s%1e3/1e3-.5)*2}function Le(e,r,s=0){return Array.from({length:Ge},(t,k)=>{const Ie=Math.sin(k/6+e.length)*.5+.5,Oe=s+r*(Ie+Qe(e,k)*.15);return{at:new Date(je+k*We).toISOString(),value:Math.max(0,Oe)}})}function a(e){return async r=>{const s=e.find(t=>r.includes(t.match))??e[0];return{id:r,points:Le(r,s.scale,s.offset??0)}}}function w(e,r,s=0){return async({signal:t})=>(t.throwIfAborted(),{id:e,points:Le(e,r,s)})}const Ne=()=>new Promise(()=>{}),He=async()=>{throw new Error("metrics request failed: 503")},Ve=async e=>({id:e,points:[]});function Je(e){const r=Re.useMemo(()=>new qe({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return x.jsx(Fe,{client:r,children:x.jsx("div",{className:"w-[420px]",children:x.jsx(De,{...e})})})}const hr={title:"Charts/TimeseriesPanel",component:De,parameters:{docs:{description:{component:"Polling time-series chart backed by TanStack Query. Stories pass a synthetic `fetcher` (no network) and `refreshMs={0}` to disable polling. Supports single- or multi-series, area/line/stacked variants, mirrored series, Grafana-style units, and an expand-to-modal action."}}},argTypes:{title:{control:"text"},url:{control:"text"},baseUrl:{control:"text"},unit:{control:"select",options:["percent","bytes","short","ms"]},range:{control:"text"},refreshMs:{control:{type:"number",min:0,step:1e3}},variant:{control:"select",options:["area","line","stacked","breakdown"]},expandVariant:{control:"inline-radio",options:["area","line","stacked"]},height:{control:{type:"range",min:80,max:360,step:20}},total:{control:{type:"number",min:0,step:1e3}},expandable:{control:"boolean"},icon:{table:{disable:!0}},fetcher:{table:{disable:!0}},series:{table:{disable:!0}},referenceLines:{table:{disable:!0}},className:{table:{disable:!0}}},render:e=>x.jsx(Je,{...e})},o={args:{title:"CPU",url:"/api/v1/metrics/sqlserver.cpu",unit:"percent",refreshMs:0,fetcher:a([{match:"cpu",scale:80,offset:5}])}},u={args:{...o.args,variant:"line"}},h={args:{...o.args,icon:Ee}},f={args:{title:"Memory",url:"/api/v1/metrics/sqlserver.memory",unit:"bytes",refreshMs:0,fetcher:a([{match:"memory",scale:6e9,offset:1e9}])}},p={args:{title:"Connections",baseUrl:"/api/v1/metrics/",unit:"short",refreshMs:0,series:[{id:"conn.active",label:"active"},{id:"conn.idle",label:"idle"}],fetcher:a([{match:"active",scale:400,offset:50},{match:"idle",scale:150,offset:20}])}},b={args:{...p.args,variant:"stacked"}},c={args:{title:"Pod resources",icon:Ee,baseUrl:"/api/v1/metrics/",refreshMs:0,series:[{id:"pod.cpu",label:"CPU",unit:"percent"},{id:"pod.memory",label:"Working set",unit:"bytes"}],fetcher:a([{match:"cpu",scale:70,offset:10},{match:"memory",scale:5e9,offset:8e8}])}},g={args:{title:"IOPS",baseUrl:"/api/v1/metrics/",unit:"short",refreshMs:0,series:[{id:"iops.read",label:"reads"},{id:"iops.write",label:"writes",transform:e=>-e}],fetcher:a([{match:"read",scale:1200,offset:100},{match:"write",scale:800,offset:80}])}},n={args:{title:"Heap",baseUrl:"/api/v1/metrics/",unit:"bytes",refreshMs:0,variant:"breakdown",total:8e9,series:[{id:"heap.eden",label:"Eden Space",color:"bg-emerald-500",current:24e8},{id:"heap.survivor",label:"Survivor Space",color:"bg-amber-500",current:3e8},{id:"heap.old",label:"Old Gen",color:"bg-rose-500",current:31e8}],fetcher:a([{match:"eden",scale:24e8,offset:5e8},{match:"survivor",scale:3e8,offset:5e7},{match:"old",scale:31e8,offset:1e9}])}},i={args:{...n.args,series:[{id:"heap.eden",label:"Eden Space",color:"#10b981",current:24e8},{id:"heap.survivor",label:"Survivor Space",color:"#f59e0b",current:3e8},{id:"heap.old",label:"Old Gen",color:"var(--chart-2, #ef4444)",current:31e8}]}},l={args:{title:"Disk",baseUrl:"/api/v1/metrics/",unit:"bytes",refreshMs:0,variant:"breakdown",total:512e9,series:[{id:"disk.system",label:"System",color:"bg-sky-500",current:64e9},{id:"disk.apps",label:"Applications",color:"bg-violet-500",current:96e9},{id:"disk.data",label:"Data",color:"bg-emerald-500",current:18e10},{id:"disk.logs",label:"Logs",color:"bg-amber-500",current:48e9},{id:"disk.cache",label:"Cache",color:"bg-rose-500",current:72e9}],fetcher:a([{match:"system",scale:64e9,offset:1e10},{match:"apps",scale:96e9,offset:2e10},{match:"data",scale:18e10,offset:4e10},{match:"logs",scale:48e9,offset:8e9},{match:"cache",scale:72e9,offset:12e9}])}},d={args:{title:"Requests",baseUrl:"/api/v1/metrics/",unit:"short",refreshMs:0,variant:"breakdown",series:[{id:"http.2xx",label:"2xx Success",color:"bg-green-500",current:8420},{id:"http.3xx",label:"3xx Redirect",color:"bg-blue-500",current:640},{id:"http.4xx",label:"4xx Client",color:"bg-amber-500",current:310},{id:"http.5xx",label:"5xx Server",color:"bg-red-500",current:47}],fetcher:a([{match:"2xx",scale:8420,offset:4e3},{match:"3xx",scale:640,offset:200},{match:"4xx",scale:310,offset:80},{match:"5xx",scale:47,offset:5}])}},_={args:{title:"CPU",url:"/api/v1/metrics/cpu",refreshMs:0,fetcher:Ne}},v={args:{title:"CPU",url:"/api/v1/metrics/cpu",refreshMs:0,fetcher:He}},y={args:{title:"CPU",url:"/api/v1/metrics/cpu",refreshMs:0,fetcher:Ve}},m={args:{title:"Memory (vm-42)",unit:"bytes",refreshMs:0,series:[{id:"vm-42.memory.used",label:"used",load:w("vm-42.memory.used",4e9,2e9)},{id:"vm-42.memory.cache",label:"cache",load:w("vm-42.memory.cache",1e9,5e8)}],referenceLines:[{value:8*1024**3,label:"capacity"}]},play:async({canvasElement:e})=>{const r=Ae(e);await S(await r.findByText("used")).toBeInTheDocument(),await S(r.getByText("cache")).toBeInTheDocument(),await S(r.getByText("capacity")).toBeInTheDocument()}};var M,U,C;o.parameters={...o.parameters,docs:{...(M=o.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(C=(U=o.parameters)==null?void 0:U.docs)==null?void 0:C.source}}};var T,B,P;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    ...Area.args,
    variant: "line"
  }
}`,...(P=(B=u.parameters)==null?void 0:B.docs)==null?void 0:P.source}}};var E,D,L;h.parameters={...h.parameters,docs:{...(E=h.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    ...Area.args,
    icon: UiChip
  }
}`,...(L=(D=h.parameters)==null?void 0:D.docs)==null?void 0:L.source}}};var I,O,R;f.parameters={...f.parameters,docs:{...(I=f.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(R=(O=f.parameters)==null?void 0:O.docs)==null?void 0:R.source}}};var q,F,A;p.parameters={...p.parameters,docs:{...(q=p.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
}`,...(A=(F=p.parameters)==null?void 0:F.docs)==null?void 0:A.source}}};var j,W,G;b.parameters={...b.parameters,docs:{...(j=b.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    ...MultiSeries.args,
    variant: "stacked"
  }
}`,...(G=(W=b.parameters)==null?void 0:W.docs)==null?void 0:G.source}}};var Q,N,H,V,J;c.parameters={...c.parameters,docs:{...(Q=c.parameters)==null?void 0:Q.docs,source:{originalSource:`{
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
}`,...(H=(N=c.parameters)==null?void 0:N.docs)==null?void 0:H.source},description:{story:`Series with different units: CPU (percent) drives the left axis, working-set
memory (bytes) the right. The legend wraps below the chart with each series'
color, label, and latest value so the header never overlaps the title/icon.`,...(J=(V=c.parameters)==null?void 0:V.docs)==null?void 0:J.description}}};var K,Y,Z;g.parameters={...g.parameters,docs:{...(K=g.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
}`,...(Z=(Y=g.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var z,X,$,ee,re;n.parameters={...n.parameters,docs:{...(z=n.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
}`,...($=(X=n.parameters)==null?void 0:X.docs)==null?void 0:$.source},description:{story:"Instantaneous stacked bar + legend (e.g. a JVM heap memory breakdown). The\nbar segments and legend reflect each series' `current` value; the expand\nbutton opens the polled time-series history as an area chart.",...(re=(ee=n.parameters)==null?void 0:ee.docs)==null?void 0:re.description}}};var se,ae,te,ne,oe;i.parameters={...i.parameters,docs:{...(se=i.parameters)==null?void 0:se.docs,source:{originalSource:`{
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
}`,...(te=(ae=i.parameters)==null?void 0:ae.docs)==null?void 0:te.source},description:{story:"Same breakdown, but series colors are given as CSS values (hex / `var()`)\ninstead of Tailwind classes. Both the inline bar/legend and the expand chart\npick up the color identically — series `color` accepts either form.",...(oe=(ne=i.parameters)==null?void 0:ne.docs)==null?void 0:oe.description}}};var ce,ie,le,de,me;l.parameters={...l.parameters,docs:{...(ce=l.parameters)==null?void 0:ce.docs,source:{originalSource:`{
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
}`,...(le=(ie=l.parameters)==null?void 0:ie.docs)==null?void 0:le.source},description:{story:`Disk usage breakdown with many Tailwind-colored segments filling most of the
bar — exercises a near-full breakdown and a longer legend list.`,...(me=(de=l.parameters)==null?void 0:de.docs)==null?void 0:me.description}}};var pe,ue,he,fe,be;d.parameters={...d.parameters,docs:{...(pe=d.parameters)==null?void 0:pe.docs,source:{originalSource:`{
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
}`,...(he=(ue=d.parameters)==null?void 0:ue.docs)==null?void 0:he.source},description:{story:"Request-status breakdown (short counts) with the canonical green/amber/red\nTailwind status palette and no explicit `total` — the denominator defaults to\nthe sum of the segment values, so the bar is fully filled.",...(be=(fe=d.parameters)==null?void 0:fe.docs)==null?void 0:be.description}}};var ge,_e,ve;_.parameters={..._.parameters,docs:{...(ge=_.parameters)==null?void 0:ge.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    url: "/api/v1/metrics/cpu",
    refreshMs: 0,
    fetcher: loadingForever
  }
}`,...(ve=(_e=_.parameters)==null?void 0:_e.docs)==null?void 0:ve.source}}};var ye,xe,ke;v.parameters={...v.parameters,docs:{...(ye=v.parameters)==null?void 0:ye.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    url: "/api/v1/metrics/cpu",
    refreshMs: 0,
    fetcher: alwaysErrors
  }
}`,...(ke=(xe=v.parameters)==null?void 0:xe.docs)==null?void 0:ke.source}}};var Se,we,Me;y.parameters={...y.parameters,docs:{...(Se=y.parameters)==null?void 0:Se.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    url: "/api/v1/metrics/cpu",
    refreshMs: 0,
    fetcher: emptyResponse
  }
}`,...(Me=(we=y.parameters)==null?void 0:we.docs)==null?void 0:Me.source}}};var Ue,Ce,Te,Be,Pe;m.parameters={...m.parameters,docs:{...(Ue=m.parameters)==null?void 0:Ue.docs,source:{originalSource:`{
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
}`,...(Te=(Ce=m.parameters)==null?void 0:Ce.docs)==null?void 0:Te.source},description:{story:"Function-backed series: each entry supplies `load({ range, signal })` instead\nof a URL, so no `baseUrl`/`fetcher` is needed. The `id` is then the cache\nidentity and must be unique per data source. `referenceLines` draws a fixed\nvalue (here a static capacity) as a dashed line with its own legend entry.",...(Pe=(Be=m.parameters)==null?void 0:Be.docs)==null?void 0:Pe.description}}};const fr=["Area","Line","WithIcon","Bytes","MultiSeries","Stacked","MixedUnits","MirroredReadWrite","Breakdown","BreakdownCssColors","BreakdownDiskUsage","BreakdownRequestStatus","Loading","ErrorState","CollectingData","LoaderSeries"];export{o as Area,n as Breakdown,i as BreakdownCssColors,l as BreakdownDiskUsage,d as BreakdownRequestStatus,f as Bytes,y as CollectingData,v as ErrorState,u as Line,m as LoaderSeries,_ as Loading,g as MirroredReadWrite,c as MixedUnits,p as MultiSeries,b as Stacked,h as WithIcon,fr as __namedExportsOrder,hr as default};
