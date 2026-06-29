import{j as a,r as Q}from"./iframe-C9yFQwwi.js";import{Q as z,a as F}from"./suspense-C9ubH6Ad.js";import{T as s}from"./TimeseriesGauge-DuUJ9hRH.js";import{U as x}from"./UiChip-4GLDlwg6.js";import{U as I}from"./UiHardDrive-BOdNqK9v.js";import{U as b}from"./UiMemoryStick-tUyE0hRM.js";import"./preload-helper-C4wV90-x.js";import"./useQueries-KWtM5wSw.js";import"./utils-CR52uffu.js";import"./format-2niohfpq.js";import"./Modal-DfeEiwDA.js";import"./index-DV4EKk1L.js";import"./index-DNnTLrC-.js";import"./Icon-CPfok5dB.js";import"./button-BUPOCWxe.js";import"./index-0zBpNI7D.js";import"./loading-D91fUsXC.js";import"./modalStack-CeDZWai7.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-C2nfMBhc.js";import"./UiClose-CrCIES2T.js";import"./TimeseriesPanel-BU_j9VeQ.js";import"./ProgressBar-Bx4wpf2s.js";import"./index-BBCC1XV-.js";import"./index-DnL3XN75.js";import"./GaugeHoverCard-DC7ZV-WB.js";import"./HoverCard-DY5hSNgU.js";import"./gauge-stats-BzAlBUFF.js";const W=Date.parse("2026-06-02T12:00:00Z");function i(e){return async r=>{const h=e.find(l=>r.includes(l.match))??e[0],g=Array.from({length:12},(l,c)=>({at:new Date(W+c*3e4).toISOString(),value:h.latest*(.7+c/11*.3)}));return{id:r,points:g}}}function R(e){const r=typeof e.max=="object"?e.max:void 0;return i([{match:e.value.id,latest:e.latestValue},...r?[{match:r.id,latest:e.maxLatestValue??e.latestValue}]:[]])}function Z(e){const{latestValue:r,maxLatestValue:h,fetcher:g,...l}=e,c=Q.useMemo(()=>new z({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[r,h]);return a.jsx(F,{client:c,children:a.jsx("div",{className:"w-40",children:a.jsx(s,{...l,fetcher:g??R(e)})})})}function B(){const e=Q.useMemo(()=>new z({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return a.jsx(F,{client:e,children:a.jsxs("div",{className:"grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm",children:[a.jsx("div",{className:"border-b border-r border-border px-2 py-1.5",children:a.jsx(s,{variant:"cell",title:"CPU",icon:x,unit:"percent",centerDisplay:"percent",value:{id:"cpu.cell.usage"},max:100,refreshMs:0,expandable:!1,fetcher:i([{match:"cpu.cell",latest:42}])})}),a.jsx("div",{className:"border-b border-border px-2 py-1.5",children:a.jsx(s,{variant:"cell",showLabel:!1,title:"CPU",icon:x,unit:"percent",centerDisplay:"percent",value:{id:"cpu.icon.usage"},max:100,refreshMs:0,expandable:!1,fetcher:i([{match:"cpu.icon",latest:42}])})}),a.jsx("div",{className:"border-r border-border px-2 py-1.5",children:a.jsx(s,{variant:"cell",title:"Memory",icon:b,unit:"bytes",value:{id:"mem.cell.usage"},max:{id:"mem.cell.limit"},refreshMs:0,expandable:!1,fetcher:i([{match:"usage",latest:32e8},{match:"limit",latest:8e9}])})}),a.jsx("div",{className:"px-2 py-1.5",children:a.jsx(s,{variant:"cell",showLabel:!1,title:"Memory",icon:b,unit:"bytes",value:{id:"mem.icon.usage"},max:{id:"mem.icon.limit"},refreshMs:0,expandable:!1,fetcher:i([{match:"usage",latest:32e8},{match:"limit",latest:8e9}])})})]})})}const je={title:"Charts/TimeseriesGauge",component:s,parameters:{docs:{description:{component:"Gauge whose fill is a metric's latest value over its maximum (a `.limit`-style metric or a fixed number), both read live from the timeseries store. `shape` switches between a half (180°) radial arc (default) and a horizontal linear progress bar; the fill crosses warning/danger thresholds and an expand button opens the full value/max chart in a modal. Hovering opens a card with the metric's current/min/max/avg/capacity over the window (`hoverCard`, default on). Stories pass a synthetic `fetcher` and `refreshMs={0}`."}}},argTypes:{title:{control:"text"},unit:{control:"select",options:["percent","bytes","short","ms"]},range:{control:"text"},refreshMs:{control:{type:"number",min:0,step:1e3}},latestValue:{name:"value",control:{type:"number",min:0,step:1}},maxLatestValue:{name:"max value",control:{type:"number",min:0,step:1}},centerDisplay:{control:"inline-radio",options:["value","percent"]},variant:{control:"inline-radio",options:["default","cell"]},shape:{control:"inline-radio",options:["radial","linear"]},showLabel:{control:"boolean"},expandable:{control:"boolean"},baseUrl:{control:"text"},thresholds:{table:{disable:!0}},icon:{table:{disable:!0}},fetcher:{table:{disable:!0}},value:{table:{disable:!0}},max:{table:{disable:!0}},className:{table:{disable:!0}}},render:e=>a.jsx(Z,{...e})},t={args:{title:"CPU",icon:x,unit:"percent",centerDisplay:"percent",value:{id:"cpu.usage"},max:100,latestValue:42,maxLatestValue:100,refreshMs:0}},m={args:{...t.args,latestValue:82}},u={args:{...t.args,latestValue:95}},o={args:{title:"Memory",icon:b,unit:"bytes",centerDisplay:"value",value:{id:"mem.usage"},max:{id:"mem.limit"},latestValue:32e8,maxLatestValue:8e9,refreshMs:0}},p={args:{...o.args}},n={args:{title:"Disk",icon:I,unit:"bytes",centerDisplay:"percent",shape:"linear",value:{id:"disk.usage"},max:{id:"disk.limit"},latestValue:18e9,maxLatestValue:64e9,refreshMs:0}},d={args:{...t.args},render:()=>a.jsx(B,{})};var f,y,v;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(v=(y=t.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var M,V,j;m.parameters={...m.parameters,docs:{...(M=m.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    ...Healthy.args,
    latestValue: 82
  }
}`,...(j=(V=m.parameters)==null?void 0:V.docs)==null?void 0:j.source}}};var D,w,C;u.parameters={...u.parameters,docs:{...(D=u.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    ...Healthy.args,
    latestValue: 95
  }
}`,...(C=(w=u.parameters)==null?void 0:w.docs)==null?void 0:C.source}}};var S,_,L;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(L=(_=o.parameters)==null?void 0:_.docs)==null?void 0:L.source}}};var U,k,H;p.parameters={...p.parameters,docs:{...(U=p.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    ...Memory.args
  }
}`,...(H=(k=p.parameters)==null?void 0:k.docs)==null?void 0:H.source}}};var T,N,G,E,P;n.parameters={...n.parameters,docs:{...(T=n.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(G=(N=n.parameters)==null?void 0:N.docs)==null?void 0:G.source},description:{story:'Disk usage rendered as a horizontal progress bar via `shape="linear"`.',...(P=(E=n.parameters)==null?void 0:E.docs)==null?void 0:P.description}}};var q,O,A;d.parameters={...d.parameters,docs:{...(q=d.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    ...Healthy.args
  },
  render: () => <GaugeCellVariants />
}`,...(A=(O=d.parameters)==null?void 0:O.docs)==null?void 0:A.source}}};const De=["Healthy","Warning","Danger","Memory","MetricMax","Linear","CellVariants"];export{d as CellVariants,u as Danger,t as Healthy,n as Linear,o as Memory,p as MetricMax,m as Warning,De as __namedExportsOrder,je as default};
