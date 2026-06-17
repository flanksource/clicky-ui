import{r as K,j as r}from"./iframe-DLWo_D3a.js";import{Q as J,a as X}from"./suspense-BoRYuynD.js";import{u as Y}from"./useQueries-DZ7iZ4eo.js";import{c as w}from"./utils-BLSKlp9E.js";import{I as U}from"./Icon-DgfT7ULk.js";import{U as ee}from"./UiChip-GSVoJzwT.js";import"./preload-helper-D5l2DbWZ.js";const se=e=>Math.min(1,Math.max(0,e));function re(e,s){const a=e!==void 0,i=(e??0)/1e3,c=s!==void 0&&s>0,o=c?s/1e3:void 0,p=Math.max(1,Math.ceil(c?o:i)),C=c?Math.min(100,Math.round(i/o*100)):0,y=Array.from({length:p},(b,B)=>({fill:se(i-B)}));return{hasUsage:a,usageCores:i,coreCount:p,pct:C,bars:y,...o!==void 0&&{limitCores:o}}}const ae=async e=>{const s=await fetch(e);if(!s.ok)throw new Error(`metrics request failed: ${s.status}`);return s.json()};function j(e){var a;const s=e==null?void 0:e.points;if(!(!s||s.length===0))return(a=s[s.length-1])==null?void 0:a.value}function te(e,[s,a]){return e>=a?"bg-red-500":e>=s?"bg-amber-500":"bg-emerald-500"}function ie({icon:e}){return typeof e=="string"?r.jsx(U,{name:e,width:14,height:14,className:"text-muted-foreground"}):r.jsx(U,{icon:e,width:14,height:14,className:"text-muted-foreground"})}function q(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function g({baseUrl:e="",value:s,max:a,title:i,icon:c,range:o="1h",refreshMs:p=5e3,thresholds:C=[75,90],fetcher:y=ae,className:b}){var P,N;const l=typeof a=="object"?a:void 0,W=K.useMemo(()=>{const t=[s.id];return l&&t.push(l.id),t},[s.id,l]),v=Y({queries:W.map(t=>{const n=new URL(e+t,window.location.origin);o&&n.searchParams.set("since",o);const u=n.pathname+n.search;return{queryKey:["timeseries",u],queryFn:()=>y(u),refetchInterval:p>0?p:!1,staleTime:0,retry:0}})}),x=j((P=v[0])==null?void 0:P.data),Z=x===void 0?void 0:s.transform?s.transform(x):x;let T;if(typeof a=="number")T=a;else if(l){const t=j((N=v[1])==null?void 0:N.data);T=t===void 0?void 0:l.transform?l.transform(t):t}const m=re(Z,T),z=te(m.pct,C),H=m.hasUsage?`${q(m.usageCores)} / ${m.limitCores!==void 0?q(m.limitCores):"?"} cores`:"—";return r.jsxs("div",{className:w("flex flex-col items-center gap-1",b),children:[r.jsx("div",{className:"flex h-10 items-end gap-0.5",children:m.bars.map((t,n)=>{const u=Math.round(t.fill*100);return r.jsx("div",{className:"relative h-full w-2 overflow-hidden rounded-sm bg-muted",title:`core ${n+1}: ${u}%`,"aria-label":`core ${n+1}: ${u}%`,"data-fill":t.fill,children:r.jsx("div",{className:w("absolute inset-x-0 bottom-0 transition-all duration-300",z),style:{height:`${u}%`}})},n)})}),r.jsx("span",{className:"text-xs font-semibold text-foreground",children:H}),r.jsxs("div",{className:"flex items-center gap-1 text-xs text-muted-foreground",children:[c?r.jsx(ie,{icon:c}):null,r.jsx("span",{children:i})]})]})}try{g.displayName="TimeseriesCoreBars",g.__docgenInfo={description:`TimeseriesCoreBars renders CPU utilisation as a row of vertical bars — one bar
per core (the ceiling of the CPU limit) — filled left to right by the latest
usage. The bar that straddles the usage boundary is partially filled ("blocked
out") to show the fractional core in use, and the trailing bars stay empty to
show headroom. Both usage and limit are read live from the timeseries store,
mirroring TimeseriesGauge's data plumbing; the bar colour crosses warning and
danger thresholds. A "<used> / <cores>" caption sits below with the icon+title.`,displayName:"TimeseriesCoreBars",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",methods:[],props:{baseUrl:{defaultValue:{value:""},declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"}],description:"Common prefix; the value/max requests are `baseUrl + id`.",name:"baseUrl",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"},required:!1,tags:{},type:{name:"string"}},value:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"}],description:"The metric whose latest value (CPU millicores) fills the bars.",name:"value",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"},required:!0,tags:{},type:{name:"GaugeSeries"}},max:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"}],description:`The CPU capacity. Either a \`.limit\`-style metric series (its latest value in
millicores) or a fixed number of millicores. Determines the number of bars
(one per core). When omitted or 0, the bar count falls back to the ceiling of
the usage in cores so an unbounded reading still renders.`,name:"max",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"},required:!1,tags:{},type:{name:"number | GaugeSeries"}},title:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"}],description:"",name:"title",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"},required:!0,tags:{},type:{name:"string"}},icon:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"}],description:"Iconify name or static icon component shown beside the label.",name:"icon",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"},required:!1,tags:{},type:{name:"string | ComponentClass<any, any> | FunctionComponent<any>"}},range:{defaultValue:{value:"1h"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"}],description:'Look-back window passed as ?since=; defaults to "1h".',name:"range",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"},required:!1,tags:{},type:{name:"string"}},refreshMs:{defaultValue:{value:"5000"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"}],description:"Poll interval in ms; defaults to 5000. Pass 0 to disable polling.",name:"refreshMs",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"},required:!1,tags:{},type:{name:"number"}},thresholds:{defaultValue:{value:"[75, 90]"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"}],description:`Utilisation thresholds (percent of capacity) at which the fill turns amber
then red. Defaults to [75, 90].`,name:"thresholds",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"},required:!1,tags:{},type:{name:"[warning: number, danger: number]"}},fetcher:{defaultValue:{value:`async (url: string): Promise<TimeseriesResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`metrics request failed: \${res.status}\`);
  return res.json();
}`},declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"}],description:"Override the default fetch (e.g. to route through an app's API client).",name:"fetcher",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"},required:!1,tags:{},type:{name:"(url: string) => Promise<TimeseriesResponse>"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"}],description:"",name:"className",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesCoreBars.tsx",name:"TimeseriesCoreBarsProps"},required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const oe=Date.parse("2026-06-02T12:00:00Z");function k(e){return async s=>{const a=e.find(i=>s.includes(i.match))??e[0];return{id:s,points:[{at:new Date(oe).toISOString(),value:a.latest}]}}}function ne(e){const s=K.useMemo(()=>new J({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(X,{client:s,children:r.jsx("div",{className:"w-48",children:r.jsx(g,{...e})})})}const he={title:"Data/TimeseriesCoreBars",component:g,parameters:{docs:{description:{component:"CPU utilisation as a row of vertical bars — one per core (ceil of the CPU limit) — filled left to right by the latest usage, so the bar straddling the boundary is partially filled and trailing bars show headroom. Usage and limit are read live from the timeseries store. The pure `deriveCoreBars(usageMilli, limitMilli)` helper computes the model. Stories pass a synthetic `fetcher` and `refreshMs={0}`."}}},argTypes:{fetcher:{table:{disable:!0}},value:{table:{disable:!0}},max:{table:{disable:!0}}},render:e=>r.jsx(ne,{...e})},d={args:{title:"CPU",icon:ee,value:{id:"cpu.usage"},max:4e3,refreshMs:0,fetcher:k([{match:"cpu",latest:2300}])}},f={args:{...d.args,max:8e3,fetcher:k([{match:"cpu",latest:7600}])}},h={args:{title:"CPU",value:{id:"cpu.usage"},max:{id:"cpu.limit"},refreshMs:0,fetcher:k([{match:"usage",latest:1500},{match:"limit",latest:2e3}])}};var M,S,I,V,_;d.parameters={...d.parameters,docs:{...(M=d.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    icon: UiChip,
    value: {
      id: "cpu.usage"
    },
    max: 4000,
    refreshMs: 0,
    fetcher: makeFetcher([{
      match: "cpu",
      latest: 2300
    }])
  }
}`,...(I=(S=d.parameters)==null?void 0:S.docs)==null?void 0:I.source},description:{story:"2.3 cores used of a 4-core limit.",...(_=(V=d.parameters)==null?void 0:V.docs)==null?void 0:_.description}}};var F,$,E,L,D;f.parameters={...f.parameters,docs:{...(F=f.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    max: 8000,
    fetcher: makeFetcher([{
      match: "cpu",
      latest: 7600
    }])
  }
}`,...(E=($=f.parameters)==null?void 0:$.docs)==null?void 0:E.source},description:{story:"Near-capacity: 7.6 of 8 cores → danger tone.",...(D=(L=f.parameters)==null?void 0:L.docs)==null?void 0:D.description}}};var A,O,Q,R,G;h.parameters={...h.parameters,docs:{...(A=h.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    value: {
      id: "cpu.usage"
    },
    max: {
      id: "cpu.limit"
    },
    refreshMs: 0,
    fetcher: makeFetcher([{
      match: "usage",
      latest: 1500
    }, {
      match: "limit",
      latest: 2000
    }])
  }
}`,...(Q=(O=h.parameters)==null?void 0:O.docs)==null?void 0:Q.source},description:{story:"Limit read from a `.limit` metric instead of a constant.",...(G=(R=h.parameters)==null?void 0:R.docs)==null?void 0:G.description}}};const ge=["FourCores","NearCapacity","MetricLimit"];export{d as FourCores,h as MetricLimit,f as NearCapacity,ge as __namedExportsOrder,he as default};
