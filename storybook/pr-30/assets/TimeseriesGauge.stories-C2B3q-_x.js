import{r as g,j as s}from"./iframe-DLWo_D3a.js";import{Q as se,a as te}from"./suspense-BoRYuynD.js";import{u as re}from"./useQueries-DZ7iZ4eo.js";import{c as ie}from"./utils-BLSKlp9E.js";import{c as ne}from"./format-DUfROWi7.js";import{M as oe}from"./Modal-DpAM32W9.js";import{I as b}from"./Icon-DgfT7ULk.js";import{T as ce}from"./TimeseriesPanel-CxWn_oCx.js";import{a as le}from"./UiFullscreen-BtydxLmv.js";import{U as ue}from"./UiChip-GSVoJzwT.js";import"./preload-helper-D5l2DbWZ.js";import"./index-Cj_FqOis.js";import"./index-BkMjoCpf.js";import"./button-lAmiuTiA.js";import"./index-1evVQkiP.js";import"./loading-Cddz8UD2.js";import"./UiClose-DQzbchdf.js";import"./ProgressBar-DkYU4832.js";import"./index-CQNW4Yba.js";const me=async a=>{const e=await fetch(a);if(!e.ok)throw new Error(`metrics request failed: ${e.status}`);return e.json()},w=40,U=Math.PI*w,V=`M 10 50 A ${w} ${w} 0 0 1 90 50`;function de(a,[e,t]){return a>=t?"text-red-500":a>=e?"text-amber-500":"text-emerald-500"}function E(a){var t;const e=a==null?void 0:a.points;if(!(!e||e.length===0))return(t=e[e.length-1])==null?void 0:t.value}function pe({icon:a}){return typeof a=="string"?s.jsx(b,{name:a,width:14,height:14,className:"text-muted-foreground"}):s.jsx(b,{icon:a,width:14,height:14,className:"text-muted-foreground"})}function f({baseUrl:a="",value:e,max:t,title:l,icon:n,unit:o,range:x="1h",refreshMs:y=5e3,expandable:N=!0,thresholds:K=[75,90],centerDisplay:Z="value",fetcher:P=me,className:J}){var C,S;const[X,j]=g.useState(!1),r=typeof t=="object"?t:void 0,Y=g.useMemo(()=>{const i=[e.id];return r&&i.push(r.id),i},[e.id,r]),q=re({queries:Y.map(i=>{const v=new URL(a+i,window.location.origin);x&&v.searchParams.set("since",x);const D=v.pathname+v.search;return{queryKey:["timeseries",D],queryFn:()=>P(D),refetchInterval:y>0?y:!1,staleTime:0,retry:0}})}),k=E((C=q[0])==null?void 0:C.data),T=k!==void 0,M=e.transform?e.transform(k??0):k??0;let u;if(typeof t=="number")u=t;else if(r){const i=E((S=q[1])==null?void 0:S.data);u=i===void 0?void 0:r.transform?r.transform(i):i}const _=T&&u!==void 0&&u>0,G=_?Math.min(100,Math.round(M/u*100)):0,ee=de(G,K),ae=g.useMemo(()=>{const i=[{id:e.id,label:"value",...e.transform?{transform:e.transform}:{}}];return r&&i.push({id:r.id,label:"max",...r.transform?{transform:r.transform}:{}}),i},[e.id,e.transform,r]);return s.jsxs("div",{className:ie("flex flex-col items-center gap-1",J),children:[s.jsxs("div",{className:"relative h-10 w-20",children:[s.jsxs("svg",{viewBox:"0 0 100 50",className:"h-full w-full overflow-visible",children:[s.jsx("path",{d:V,fill:"none",stroke:"currentColor",strokeWidth:9,strokeLinecap:"round",className:"text-muted"}),s.jsx("path",{d:V,fill:"none",stroke:"currentColor",strokeWidth:9,strokeLinecap:"round",className:ee,strokeDasharray:U,strokeDashoffset:U*(1-G/100)})]}),s.jsx("span",{className:"absolute inset-x-0 bottom-0 text-center text-sm font-semibold text-foreground",children:Z==="percent"?_?`${G}%`:T?"n/a":"—":T?ne(M,o):"—"}),N&&s.jsx("button",{type:"button","aria-label":"Expand chart",onClick:()=>j(!0),className:"absolute right-0 top-0 text-muted-foreground hover:text-foreground",children:s.jsx(b,{icon:le,width:12,height:12})})]}),s.jsxs("div",{className:"flex items-center gap-1 text-xs text-muted-foreground",children:[n?s.jsx(pe,{icon:n}):null,s.jsx("span",{children:l})]}),N&&s.jsx(oe,{open:X,onClose:()=>j(!1),title:l,size:"xl",children:s.jsx(ce,{title:l,...n?{icon:n}:{},...o?{unit:o}:{},baseUrl:a,series:ae,range:x,refreshMs:y,expandable:!1,fetcher:P})})]})}try{f.displayName="TimeseriesGauge",f.__docgenInfo={description:`TimeseriesGauge renders a half (180°) radial gauge whose fill is the latest
value of a metric over its maximum (a \`.limit\`-style metric or a fixed number),
both read live from the timeseries store. The centre shows the utilisation
percentage, with the value/max caption below; the arc colour crosses warning
and danger thresholds. An expand button opens the full value/max time-series
chart in a modal (a \`TimeseriesPanel\`), so the gauge gives the at-a-glance
reading and the chart the trend.`,displayName:"TimeseriesGauge",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",methods:[],props:{baseUrl:{defaultValue:{value:""},declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:"Common prefix; the value/max requests are `baseUrl + id`.",name:"baseUrl",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!1,tags:{},type:{name:"string"}},value:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:"The metric whose latest value fills the gauge.",name:"value",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!0,tags:{},type:{name:"GaugeSeries"}},max:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:"The gauge maximum. Either a metric series (its latest value, e.g. a `.limit`\nmetric) or a fixed number. When omitted, or when the resolved max is 0, the\ngauge shows the raw value with no fill (an unbounded reading).",name:"max",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!1,tags:{},type:{name:"number | GaugeSeries"}},title:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:"",name:"title",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!0,tags:{},type:{name:"string"}},icon:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:"Iconify name or static icon component shown beside the label.",name:"icon",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!1,tags:{},type:{name:"string | ComponentClass<any, any> | FunctionComponent<any>"}},unit:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:'Grafana-style unit key for the readout (e.g. "bytes", "percent", "short", "ms").',name:"unit",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!1,tags:{},type:{name:"string"}},range:{defaultValue:{value:"1h"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:'Look-back window for the expand chart, passed as ?since=; defaults to "1h".',name:"range",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!1,tags:{},type:{name:"string"}},refreshMs:{defaultValue:{value:"5000"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:"Poll interval in ms; defaults to 5000. Pass 0 to disable polling.",name:"refreshMs",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!1,tags:{},type:{name:"number"}},expandable:{defaultValue:{value:"true"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:"Show an expand button that opens the value/max time-series chart in a modal. Default true.",name:"expandable",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!1,tags:{},type:{name:"boolean"}},thresholds:{defaultValue:{value:"[75, 90]"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:`Utilisation thresholds (percent of max) at which the arc turns amber then
red. Defaults to [75, 90].`,name:"thresholds",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!1,tags:{},type:{name:"[warning: number, danger: number]"}},centerDisplay:{defaultValue:{value:"value"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:`What to print in the centre: the formatted value (default) or the
utilisation percentage of max (e.g. CPU usage out of its millicore limit).`,name:"centerDisplay",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!1,tags:{},type:{name:"enum",raw:'"value" | "percent"',value:[{value:'"value"'},{value:'"percent"'}]}},fetcher:{defaultValue:{value:`async (url: string): Promise<TimeseriesResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`metrics request failed: \${res.status}\`);
  return res.json();
}`},declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:"Override the default fetch (e.g. to route through an app's API client).",name:"fetcher",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!1,tags:{},type:{name:"(url: string) => Promise<TimeseriesResponse>"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"}],description:"",name:"className",parent:{fileName:"clicky-ui/packages/ui/src/data/TimeseriesGauge.tsx",name:"TimeseriesGaugeProps"},required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const ge=Date.parse("2026-06-02T12:00:00Z");function h(a){return async e=>{const t=a.find(n=>e.includes(n.match))??a[0],l=Array.from({length:12},(n,o)=>({at:new Date(ge+o*3e4).toISOString(),value:t.latest*(.7+o/11*.3)}));return{id:e,points:l}}}function fe(a){const e=g.useMemo(()=>new se({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return s.jsx(te,{client:e,children:s.jsx("div",{className:"w-40",children:s.jsx(f,{...a})})})}const Ee={title:"Data/TimeseriesGauge",component:f,parameters:{docs:{description:{component:"Half (180°) radial gauge whose fill is a metric's latest value over its maximum (a `.limit`-style metric or a fixed number), both read live from the timeseries store. The arc crosses warning/danger thresholds; an expand button opens the full value/max chart in a modal. Stories pass a synthetic `fetcher` and `refreshMs={0}`."}}},argTypes:{centerDisplay:{control:"inline-radio",options:["value","percent"]},expandable:{control:"boolean"},fetcher:{table:{disable:!0}},value:{table:{disable:!0}},max:{table:{disable:!0}}},render:a=>s.jsx(fe,{...a})},c={args:{title:"CPU",icon:ue,unit:"percent",centerDisplay:"percent",value:{id:"cpu.usage"},max:100,refreshMs:0,fetcher:h([{match:"cpu",latest:42}])}},m={args:{...c.args,fetcher:h([{match:"cpu",latest:82}])}},d={args:{...c.args,fetcher:h([{match:"cpu",latest:95}])}},p={args:{title:"Memory",unit:"bytes",centerDisplay:"value",value:{id:"mem.usage"},max:{id:"mem.limit"},refreshMs:0,fetcher:h([{match:"usage",latest:32e8},{match:"limit",latest:8e9}])}};var I,A,F;c.parameters={...c.parameters,docs:{...(I=c.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    icon: UiChip,
    unit: "percent",
    centerDisplay: "percent",
    value: {
      id: "cpu.usage"
    },
    max: 100,
    refreshMs: 0,
    fetcher: makeFetcher([{
      match: "cpu",
      latest: 42
    }])
  }
}`,...(F=(A=c.parameters)==null?void 0:A.docs)==null?void 0:F.source}}};var H,R,W;m.parameters={...m.parameters,docs:{...(H=m.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    ...Healthy.args,
    fetcher: makeFetcher([{
      match: "cpu",
      latest: 82
    }])
  }
}`,...(W=(R=m.parameters)==null?void 0:R.docs)==null?void 0:W.source}}};var $,L,O;d.parameters={...d.parameters,docs:{...($=d.parameters)==null?void 0:$.docs,source:{originalSource:`{
  args: {
    ...Healthy.args,
    fetcher: makeFetcher([{
      match: "cpu",
      latest: 95
    }])
  }
}`,...(O=(L=d.parameters)==null?void 0:L.docs)==null?void 0:O.source}}};var Q,z,B;p.parameters={...p.parameters,docs:{...(Q=p.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    title: "Memory",
    unit: "bytes",
    centerDisplay: "value",
    value: {
      id: "mem.usage"
    },
    max: {
      id: "mem.limit"
    },
    refreshMs: 0,
    fetcher: makeFetcher([{
      match: "usage",
      latest: 3_200_000_000
    }, {
      match: "limit",
      latest: 8_000_000_000
    }])
  }
}`,...(B=(z=p.parameters)==null?void 0:z.docs)==null?void 0:B.source}}};const Ie=["Healthy","Warning","Danger","MetricMax"];export{d as Danger,c as Healthy,p as MetricMax,m as Warning,Ie as __namedExportsOrder,Ee as default};
