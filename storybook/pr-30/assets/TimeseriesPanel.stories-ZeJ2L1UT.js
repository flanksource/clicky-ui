import{j as x,r as Ue}from"./iframe-DLWo_D3a.js";import{Q as Pe,a as Ee}from"./suspense-BoRYuynD.js";import{T as Se}from"./TimeseriesPanel-CxWn_oCx.js";import{U as we}from"./UiChip-GSVoJzwT.js";import"./preload-helper-D5l2DbWZ.js";import"./useQueries-DZ7iZ4eo.js";import"./utils-BLSKlp9E.js";import"./ProgressBar-DkYU4832.js";import"./format-DUfROWi7.js";import"./Modal-DpAM32W9.js";import"./index-Cj_FqOis.js";import"./index-BkMjoCpf.js";import"./Icon-DgfT7ULk.js";import"./button-lAmiuTiA.js";import"./index-1evVQkiP.js";import"./loading-Cddz8UD2.js";import"./UiFullscreen-BtydxLmv.js";import"./UiClose-DQzbchdf.js";import"./index-CQNW4Yba.js";const Te=Date.parse("2026-06-02T12:00:00Z"),qe=3e4,Be=60;function De(e,s){let r=2166136261;for(const m of e)r=(r^m.charCodeAt(0))*16777619;return r=(r^s)>>>0,(r%1e3/1e3-.5)*2}function Re(e,s,r=0){return Array.from({length:Be},(m,k)=>{const Me=Math.sin(k/6+e.length)*.5+.5,Ce=r+s*(Me+De(e,k)*.15);return{at:new Date(Te+k*qe).toISOString(),value:Math.max(0,Ce)}})}function a(e){return async s=>{const r=e.find(m=>s.includes(m.match))??e[0];return{id:s,points:Re(s,r.scale,r.offset??0)}}}const Fe=()=>new Promise(()=>{}),Oe=async()=>{throw new Error("metrics request failed: 503")},Ae=async e=>({id:e,points:[]});function Ie(e){const s=Ue.useMemo(()=>new Pe({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return x.jsx(Ee,{client:s,children:x.jsx("div",{className:"w-[420px]",children:x.jsx(Se,{...e})})})}const tr={title:"Data/TimeseriesPanel",component:Se,parameters:{docs:{description:{component:"Polling time-series chart backed by TanStack Query. Stories pass a synthetic `fetcher` (no network) and `refreshMs={0}` to disable polling. Supports single- or multi-series, area/line/stacked variants, mirrored series, Grafana-style units, and an expand-to-modal action."}}},argTypes:{variant:{control:"select",options:["area","line","stacked","breakdown"]},height:{control:{type:"range",min:80,max:360,step:20}},expandable:{control:"boolean"},fetcher:{table:{disable:!0}},series:{table:{disable:!0}}},render:e=>x.jsx(Ie,{...e})},n={args:{title:"CPU",url:"/api/v1/metrics/sqlserver.cpu",unit:"percent",refreshMs:0,fetcher:a([{match:"cpu",scale:80,offset:5}])}},p={args:{...n.args,variant:"line"}},u={args:{...n.args,icon:we}},h={args:{title:"Memory",url:"/api/v1/metrics/sqlserver.memory",unit:"bytes",refreshMs:0,fetcher:a([{match:"memory",scale:6e9,offset:1e9}])}},d={args:{title:"Connections",baseUrl:"/api/v1/metrics/",unit:"short",refreshMs:0,series:[{id:"conn.active",label:"active"},{id:"conn.idle",label:"idle"}],fetcher:a([{match:"active",scale:400,offset:50},{match:"idle",scale:150,offset:20}])}},f={args:{...d.args,variant:"stacked"}},o={args:{title:"Pod resources",icon:we,baseUrl:"/api/v1/metrics/",refreshMs:0,series:[{id:"pod.cpu",label:"CPU",unit:"percent"},{id:"pod.memory",label:"Working set",unit:"bytes"}],fetcher:a([{match:"cpu",scale:70,offset:10},{match:"memory",scale:5e9,offset:8e8}])}},b={args:{title:"IOPS",baseUrl:"/api/v1/metrics/",unit:"short",refreshMs:0,series:[{id:"iops.read",label:"reads"},{id:"iops.write",label:"writes",transform:e=>-e}],fetcher:a([{match:"read",scale:1200,offset:100},{match:"write",scale:800,offset:80}])}},t={args:{title:"Heap",baseUrl:"/api/v1/metrics/",unit:"bytes",refreshMs:0,variant:"breakdown",total:8e9,series:[{id:"heap.eden",label:"Eden Space",color:"bg-emerald-500",current:24e8},{id:"heap.survivor",label:"Survivor Space",color:"bg-amber-500",current:3e8},{id:"heap.old",label:"Old Gen",color:"bg-rose-500",current:31e8}],fetcher:a([{match:"eden",scale:24e8,offset:5e8},{match:"survivor",scale:3e8,offset:5e7},{match:"old",scale:31e8,offset:1e9}])}},c={args:{...t.args,series:[{id:"heap.eden",label:"Eden Space",color:"#10b981",current:24e8},{id:"heap.survivor",label:"Survivor Space",color:"#f59e0b",current:3e8},{id:"heap.old",label:"Old Gen",color:"var(--chart-2, #ef4444)",current:31e8}]}},i={args:{title:"Disk",baseUrl:"/api/v1/metrics/",unit:"bytes",refreshMs:0,variant:"breakdown",total:512e9,series:[{id:"disk.system",label:"System",color:"bg-sky-500",current:64e9},{id:"disk.apps",label:"Applications",color:"bg-violet-500",current:96e9},{id:"disk.data",label:"Data",color:"bg-emerald-500",current:18e10},{id:"disk.logs",label:"Logs",color:"bg-amber-500",current:48e9},{id:"disk.cache",label:"Cache",color:"bg-rose-500",current:72e9}],fetcher:a([{match:"system",scale:64e9,offset:1e10},{match:"apps",scale:96e9,offset:2e10},{match:"data",scale:18e10,offset:4e10},{match:"logs",scale:48e9,offset:8e9},{match:"cache",scale:72e9,offset:12e9}])}},l={args:{title:"Requests",baseUrl:"/api/v1/metrics/",unit:"short",refreshMs:0,variant:"breakdown",series:[{id:"http.2xx",label:"2xx Success",color:"bg-green-500",current:8420},{id:"http.3xx",label:"3xx Redirect",color:"bg-blue-500",current:640},{id:"http.4xx",label:"4xx Client",color:"bg-amber-500",current:310},{id:"http.5xx",label:"5xx Server",color:"bg-red-500",current:47}],fetcher:a([{match:"2xx",scale:8420,offset:4e3},{match:"3xx",scale:640,offset:200},{match:"4xx",scale:310,offset:80},{match:"5xx",scale:47,offset:5}])}},g={args:{title:"CPU",url:"/api/v1/metrics/cpu",refreshMs:0,fetcher:Fe}},_={args:{title:"CPU",url:"/api/v1/metrics/cpu",refreshMs:0,fetcher:Oe}},v={args:{title:"CPU",url:"/api/v1/metrics/cpu",refreshMs:0,fetcher:Ae}};var y,S,w;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(w=(S=n.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};var M,C,U;p.parameters={...p.parameters,docs:{...(M=p.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    ...Area.args,
    variant: "line"
  }
}`,...(U=(C=p.parameters)==null?void 0:C.docs)==null?void 0:U.source}}};var P,E,T;u.parameters={...u.parameters,docs:{...(P=u.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    ...Area.args,
    icon: UiChip
  }
}`,...(T=(E=u.parameters)==null?void 0:E.docs)==null?void 0:T.source}}};var q,B,D;h.parameters={...h.parameters,docs:{...(q=h.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
}`,...(D=(B=h.parameters)==null?void 0:B.docs)==null?void 0:D.source}}};var R,F,O;d.parameters={...d.parameters,docs:{...(R=d.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(O=(F=d.parameters)==null?void 0:F.docs)==null?void 0:O.source}}};var A,I,j;f.parameters={...f.parameters,docs:{...(A=f.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    ...MultiSeries.args,
    variant: "stacked"
  }
}`,...(j=(I=f.parameters)==null?void 0:I.docs)==null?void 0:j.source}}};var L,W,G,Q,N;o.parameters={...o.parameters,docs:{...(L=o.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(G=(W=o.parameters)==null?void 0:W.docs)==null?void 0:G.source},description:{story:`Series with different units: CPU (percent) drives the left axis, working-set
memory (bytes) the right. The legend wraps below the chart with each series'
color, label, and latest value so the header never overlaps the title/icon.`,...(N=(Q=o.parameters)==null?void 0:Q.docs)==null?void 0:N.description}}};var H,J,V;b.parameters={...b.parameters,docs:{...(H=b.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(V=(J=b.parameters)==null?void 0:J.docs)==null?void 0:V.source}}};var Z,z,K,X,Y;t.parameters={...t.parameters,docs:{...(Z=t.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(K=(z=t.parameters)==null?void 0:z.docs)==null?void 0:K.source},description:{story:"Instantaneous stacked bar + legend (e.g. a JVM heap memory breakdown). The\nbar segments and legend reflect each series' `current` value; the expand\nbutton opens the polled time-series history as an area chart.",...(Y=(X=t.parameters)==null?void 0:X.docs)==null?void 0:Y.description}}};var $,ee,re,se,ae;c.parameters={...c.parameters,docs:{...($=c.parameters)==null?void 0:$.docs,source:{originalSource:`{
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
}`,...(re=(ee=c.parameters)==null?void 0:ee.docs)==null?void 0:re.source},description:{story:"Same breakdown, but series colors are given as CSS values (hex / `var()`)\ninstead of Tailwind classes. Both the inline bar/legend and the expand chart\npick up the color identically — series `color` accepts either form.",...(ae=(se=c.parameters)==null?void 0:se.docs)==null?void 0:ae.description}}};var te,ne,oe,ce,ie;i.parameters={...i.parameters,docs:{...(te=i.parameters)==null?void 0:te.docs,source:{originalSource:`{
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
}`,...(oe=(ne=i.parameters)==null?void 0:ne.docs)==null?void 0:oe.source},description:{story:`Disk usage breakdown with many Tailwind-colored segments filling most of the
bar — exercises a near-full breakdown and a longer legend list.`,...(ie=(ce=i.parameters)==null?void 0:ce.docs)==null?void 0:ie.description}}};var le,de,me,pe,ue;l.parameters={...l.parameters,docs:{...(le=l.parameters)==null?void 0:le.docs,source:{originalSource:`{
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
}`,...(me=(de=l.parameters)==null?void 0:de.docs)==null?void 0:me.source},description:{story:"Request-status breakdown (short counts) with the canonical green/amber/red\nTailwind status palette and no explicit `total` — the denominator defaults to\nthe sum of the segment values, so the bar is fully filled.",...(ue=(pe=l.parameters)==null?void 0:pe.docs)==null?void 0:ue.description}}};var he,fe,be;g.parameters={...g.parameters,docs:{...(he=g.parameters)==null?void 0:he.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    url: "/api/v1/metrics/cpu",
    refreshMs: 0,
    fetcher: loadingForever
  }
}`,...(be=(fe=g.parameters)==null?void 0:fe.docs)==null?void 0:be.source}}};var ge,_e,ve;_.parameters={..._.parameters,docs:{...(ge=_.parameters)==null?void 0:ge.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    url: "/api/v1/metrics/cpu",
    refreshMs: 0,
    fetcher: alwaysErrors
  }
}`,...(ve=(_e=_.parameters)==null?void 0:_e.docs)==null?void 0:ve.source}}};var xe,ke,ye;v.parameters={...v.parameters,docs:{...(xe=v.parameters)==null?void 0:xe.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    url: "/api/v1/metrics/cpu",
    refreshMs: 0,
    fetcher: emptyResponse
  }
}`,...(ye=(ke=v.parameters)==null?void 0:ke.docs)==null?void 0:ye.source}}};const nr=["Area","Line","WithIcon","Bytes","MultiSeries","Stacked","MixedUnits","MirroredReadWrite","Breakdown","BreakdownCssColors","BreakdownDiskUsage","BreakdownRequestStatus","Loading","ErrorState","CollectingData"];export{n as Area,t as Breakdown,c as BreakdownCssColors,i as BreakdownDiskUsage,l as BreakdownRequestStatus,h as Bytes,v as CollectingData,_ as ErrorState,p as Line,g as Loading,b as MirroredReadWrite,o as MixedUnits,d as MultiSeries,f as Stacked,u as WithIcon,nr as __namedExportsOrder,tr as default};
