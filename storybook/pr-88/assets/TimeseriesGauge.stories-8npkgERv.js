import{ag as b,ai as X,aj as y,j as a,r as R}from"./iframe-DjmnUs_s.js";import{Q as Z}from"./queryClient-WWMP9yZo.js";import{Q as J}from"./suspense-Dj5pR5v4.js";import{T as n}from"./TimeseriesGauge-DbjJcIA4.js";import"./preload-helper-BlVIKJwt.js";import"./utils-DW-IJACk.js";import"./format-2niohfpq.js";import"./Modal-DJ5NvytA.js";import"./index-DsmV4W2z.js";import"./index-CouXz6mu.js";import"./Icon-CWJyCkxy.js";import"./button-DfMIapuu.js";import"./index-CPURVhFy.js";import"./loading-jlJ4TQvy.js";import"./modalStack-Bqy7OkQU.js";import"./zIndex-BGbNBNA8.js";import"./TimeseriesPanel-Cp9RL3RL.js";import"./ProgressBar-3WabhYda.js";import"./timeseries-query-_jVFbW6V.js";import"./index-BF8c1I0o.js";import"./index-DnL3XN75.js";import"./GaugeHoverCard-DfTHKnS1.js";import"./HoverCard-dWtrhYr9.js";import"./gauge-stats-BzAlBUFF.js";const K=Date.parse("2026-06-02T12:00:00Z");function l(e){return async r=>{const s=e.find(m=>r.includes(m.match))??e[0],x=Array.from({length:12},(m,u)=>({at:new Date(K+u*3e4).toISOString(),value:s.latest*(.7+u/11*.3)}));return{id:r,points:x}}}function Y(e){const r=typeof e.max=="object"?e.max:void 0;return l([{match:e.value.id,latest:e.latestValue},...r?[{match:r.id,latest:e.maxLatestValue??e.latestValue}]:[]])}function $(e){const{latestValue:r,maxLatestValue:s,fetcher:x,...m}=e,u=R.useMemo(()=>new Z({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[r,s]);return a.jsx(J,{client:u,children:a.jsx("div",{className:"w-40",children:a.jsx(n,{...m,fetcher:x??Y(e)})})})}function ee(){const e=R.useMemo(()=>new Z({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return a.jsx(J,{client:e,children:a.jsxs("div",{className:"grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm",children:[a.jsx("div",{className:"border-b border-r border-border px-2 py-1.5",children:a.jsx(n,{variant:"cell",title:"CPU",icon:b,unit:"percent",centerDisplay:"percent",value:{id:"cpu.cell.usage"},max:100,refreshMs:0,expandable:!1,fetcher:l([{match:"cpu.cell",latest:42}])})}),a.jsx("div",{className:"border-b border-border px-2 py-1.5",children:a.jsx(n,{variant:"cell",showLabel:!1,title:"CPU",icon:b,unit:"percent",centerDisplay:"percent",value:{id:"cpu.icon.usage"},max:100,refreshMs:0,expandable:!1,fetcher:l([{match:"cpu.icon",latest:42}])})}),a.jsx("div",{className:"border-r border-border px-2 py-1.5",children:a.jsx(n,{variant:"cell",title:"Memory",icon:y,unit:"bytes",value:{id:"mem.cell.usage"},max:{id:"mem.cell.limit"},refreshMs:0,expandable:!1,fetcher:l([{match:"usage",latest:32e8},{match:"limit",latest:8e9}])})}),a.jsx("div",{className:"px-2 py-1.5",children:a.jsx(n,{variant:"cell",showLabel:!1,title:"Memory",icon:y,unit:"bytes",value:{id:"mem.icon.usage"},max:{id:"mem.icon.limit"},refreshMs:0,expandable:!1,fetcher:l([{match:"usage",latest:32e8},{match:"limit",latest:8e9}])})})]})})}const De={title:"Charts/TimeseriesGauge",component:n,parameters:{docs:{description:{component:"Gauge whose fill is a metric's latest value over its maximum (a `.limit`-style metric or a fixed number), both read live from the timeseries store. `shape` switches between a half (180°) radial arc (default) and a horizontal linear progress bar; the fill crosses warning/danger thresholds and an expand button opens the full value/max chart in a modal. Hovering opens a card with the metric's current/min/max/avg/capacity over the window (`hoverCard`, default on). Stories pass a synthetic `fetcher` and `refreshMs={0}`."}}},argTypes:{title:{control:"text"},unit:{control:"select",options:["percent","bytes","short","ms"]},range:{control:"text"},refreshMs:{control:{type:"number",min:0,step:1e3}},latestValue:{name:"value",control:{type:"number",min:0,step:1}},maxLatestValue:{name:"max value",control:{type:"number",min:0,step:1}},centerDisplay:{control:"inline-radio",options:["value","percent"]},variant:{control:"inline-radio",options:["default","cell"]},shape:{control:"inline-radio",options:["radial","linear"]},showLabel:{control:"boolean"},expandable:{control:"boolean"},baseUrl:{control:"text"},thresholds:{table:{disable:!0}},icon:{table:{disable:!0}},fetcher:{table:{disable:!0}},value:{table:{disable:!0}},max:{table:{disable:!0}},className:{table:{disable:!0}}},render:e=>a.jsx($,{...e})},t={args:{title:"CPU",icon:b,unit:"percent",centerDisplay:"percent",value:{id:"cpu.usage"},max:100,latestValue:42,maxLatestValue:100,refreshMs:0}},d={args:{...t.args,latestValue:82}},p={args:{...t.args,latestValue:95}},c={args:{title:"Memory",icon:y,unit:"bytes",centerDisplay:"value",value:{id:"mem.usage"},max:{id:"mem.limit"},latestValue:32e8,maxLatestValue:8e9,refreshMs:0}},h={args:{...c.args}},i={args:{title:"Disk",icon:X,unit:"bytes",centerDisplay:"percent",shape:"linear",value:{id:"disk.usage"},max:{id:"disk.limit"},latestValue:18e9,maxLatestValue:64e9,refreshMs:0}},g={args:{...t.args},render:()=>a.jsx(ee,{})},o={args:{...t.args,title:"CPU (vm-42)",value:{id:"vm-42.cpu.percent",load:async({signal:e})=>(e.throwIfAborted(),{id:"vm-42.cpu.percent",points:Array.from({length:12},(r,s)=>({at:new Date(K+s*3e4).toISOString(),value:55+s*1.5}))})}}};var f,v,M;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    icon: UiChip,
    unit: "percent",
    centerDisplay: "percent",
    value: {
      id: "cpu.usage"
    },
    max: 100,
    latestValue: 42,
    maxLatestValue: 100,
    refreshMs: 0
  }
}`,...(M=(v=t.parameters)==null?void 0:v.docs)==null?void 0:M.source}}};var V,S,w;d.parameters={...d.parameters,docs:{...(V=d.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    ...Healthy.args,
    latestValue: 82
  }
}`,...(w=(S=d.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};var D,_,j;p.parameters={...p.parameters,docs:{...(D=p.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    ...Healthy.args,
    latestValue: 95
  }
}`,...(j=(_=p.parameters)==null?void 0:_.docs)==null?void 0:j.source}}};var C,L,U;c.parameters={...c.parameters,docs:{...(C=c.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    title: "Memory",
    icon: UiMemoryStick,
    unit: "bytes",
    centerDisplay: "value",
    value: {
      id: "mem.usage"
    },
    max: {
      id: "mem.limit"
    },
    latestValue: 3_200_000_000,
    maxLatestValue: 8_000_000_000,
    refreshMs: 0
  }
}`,...(U=(L=c.parameters)==null?void 0:L.docs)==null?void 0:U.source}}};var k,T,H;h.parameters={...h.parameters,docs:{...(k=h.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    ...Memory.args
  }
}`,...(H=(T=h.parameters)==null?void 0:T.docs)==null?void 0:H.source}}};var A,E,I,N,P;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    title: "Disk",
    icon: UiHardDrive,
    unit: "bytes",
    centerDisplay: "percent",
    shape: "linear",
    value: {
      id: "disk.usage"
    },
    max: {
      id: "disk.limit"
    },
    latestValue: 18_000_000_000,
    maxLatestValue: 64_000_000_000,
    refreshMs: 0
  }
}`,...(I=(E=i.parameters)==null?void 0:E.docs)==null?void 0:I.source},description:{story:'Disk usage rendered as a horizontal progress bar via `shape="linear"`.',...(P=(N=i.parameters)==null?void 0:N.docs)==null?void 0:P.description}}};var G,O,q;g.parameters={...g.parameters,docs:{...(G=g.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    ...Healthy.args
  },
  render: () => <GaugeCellVariants />
}`,...(q=(O=g.parameters)==null?void 0:O.docs)==null?void 0:q.source}}};var Q,z,F,W,B;o.parameters={...o.parameters,docs:{...(Q=o.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    ...Healthy.args,
    title: "CPU (vm-42)",
    value: {
      id: "vm-42.cpu.percent",
      load: async ({
        signal
      }) => {
        signal.throwIfAborted();
        return {
          id: "vm-42.cpu.percent",
          points: Array.from({
            length: 12
          }, (_, i) => ({
            at: new Date(BASE_TIME + i * 30_000).toISOString(),
            value: 55 + i * 1.5
          }))
        };
      }
    }
  }
}`,...(F=(z=o.parameters)==null?void 0:z.docs)==null?void 0:F.source},description:{story:"The value series is loaded by a function (`value.load`) rather than\nrequested as `baseUrl + id`; the id becomes the series' cache key.",...(B=(W=o.parameters)==null?void 0:W.docs)==null?void 0:B.description}}};const _e=["Healthy","Warning","Danger","Memory","MetricMax","Linear","CellVariants","LoaderSeries"];export{g as CellVariants,p as Danger,t as Healthy,i as Linear,o as LoaderSeries,c as Memory,h as MetricMax,d as Warning,_e as __namedExportsOrder,De as default};
