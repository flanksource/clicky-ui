import{j as r,r as E}from"./iframe-CmW1bXIL.js";import{Q as G,a as P}from"./suspense-BvtEJzrj.js";import{T as s}from"./TimeseriesGauge-CZFI32JY.js";import{U as x}from"./UiChip-CZyKjtXS.js";import{U as g}from"./UiMemoryStick-puhn4z_0.js";import"./preload-helper-ByUaG9M2.js";import"./useQueries-BEXfAW1X.js";import"./utils-BLSKlp9E.js";import"./format-2niohfpq.js";import"./Modal-DxeyfFt4.js";import"./index-CvvFywp4.js";import"./index-CwG-8UeD.js";import"./Icon-DgKWNfUH.js";import"./button-Cbf2D1Lj.js";import"./index-1evVQkiP.js";import"./loading-BzXaTpRU.js";import"./modalStack-CihdweRn.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-C6Iis6jt.js";import"./UiClose-BWsNrAoC.js";import"./TimeseriesPanel-CN10x1Yb.js";import"./ProgressBar-C3zYgfjQ.js";import"./index-CRrniWZO.js";const q=Date.parse("2026-06-02T12:00:00Z");function n(e){return async a=>{const d=e.find(l=>a.includes(l.match))??e[0],h=Array.from({length:12},(l,o)=>({at:new Date(q+o*3e4).toISOString(),value:d.latest*(.7+o/11*.3)}));return{id:a,points:h}}}function O(e){const a=typeof e.max=="object"?e.max:void 0;return n([{match:e.value.id,latest:e.latestValue},...a?[{match:a.id,latest:e.maxLatestValue??e.latestValue}]:[]])}function A(e){const{latestValue:a,maxLatestValue:d,fetcher:h,...l}=e,o=E.useMemo(()=>new G({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[a,d]);return r.jsx(P,{client:o,children:r.jsx("div",{className:"w-40",children:r.jsx(s,{...l,fetcher:h??O(e)})})})}function Q(){const e=E.useMemo(()=>new G({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(P,{client:e,children:r.jsxs("div",{className:"grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm",children:[r.jsx("div",{className:"border-b border-r border-border px-2 py-1.5",children:r.jsx(s,{variant:"cell",title:"CPU",icon:x,unit:"percent",centerDisplay:"percent",value:{id:"cpu.cell.usage"},max:100,refreshMs:0,expandable:!1,fetcher:n([{match:"cpu.cell",latest:42}])})}),r.jsx("div",{className:"border-b border-border px-2 py-1.5",children:r.jsx(s,{variant:"cell",showLabel:!1,title:"CPU",icon:x,unit:"percent",centerDisplay:"percent",value:{id:"cpu.icon.usage"},max:100,refreshMs:0,expandable:!1,fetcher:n([{match:"cpu.icon",latest:42}])})}),r.jsx("div",{className:"border-r border-border px-2 py-1.5",children:r.jsx(s,{variant:"cell",title:"Memory",icon:g,unit:"bytes",value:{id:"mem.cell.usage"},max:{id:"mem.cell.limit"},refreshMs:0,expandable:!1,fetcher:n([{match:"usage",latest:32e8},{match:"limit",latest:8e9}])})}),r.jsx("div",{className:"px-2 py-1.5",children:r.jsx(s,{variant:"cell",showLabel:!1,title:"Memory",icon:g,unit:"bytes",value:{id:"mem.icon.usage"},max:{id:"mem.icon.limit"},refreshMs:0,expandable:!1,fetcher:n([{match:"usage",latest:32e8},{match:"limit",latest:8e9}])})})]})})}const ue={title:"Charts/TimeseriesGauge",component:s,parameters:{docs:{description:{component:"Half (180°) radial gauge whose fill is a metric's latest value over its maximum (a `.limit`-style metric or a fixed number), both read live from the timeseries store. The arc crosses warning/danger thresholds; an expand button opens the full value/max chart in a modal. Stories pass a synthetic `fetcher` and `refreshMs={0}`."}}},argTypes:{title:{control:"text"},unit:{control:"select",options:["percent","bytes","short","ms"]},range:{control:"text"},refreshMs:{control:{type:"number",min:0,step:1e3}},latestValue:{name:"value",control:{type:"number",min:0,step:1}},maxLatestValue:{name:"max value",control:{type:"number",min:0,step:1}},centerDisplay:{control:"inline-radio",options:["value","percent"]},variant:{control:"inline-radio",options:["default","cell"]},showLabel:{control:"boolean"},expandable:{control:"boolean"},baseUrl:{control:"text"},thresholds:{table:{disable:!0}},icon:{table:{disable:!0}},fetcher:{table:{disable:!0}},value:{table:{disable:!0}},max:{table:{disable:!0}},className:{table:{disable:!0}}},render:e=>r.jsx(A,{...e})},t={args:{title:"CPU",icon:x,unit:"percent",centerDisplay:"percent",value:{id:"cpu.usage"},max:100,latestValue:42,maxLatestValue:100,refreshMs:0}},c={args:{...t.args,latestValue:82}},m={args:{...t.args,latestValue:95}},i={args:{title:"Memory",icon:g,unit:"bytes",centerDisplay:"value",value:{id:"mem.usage"},max:{id:"mem.limit"},latestValue:32e8,maxLatestValue:8e9,refreshMs:0}},u={args:{...i.args}},p={args:{...t.args},render:()=>r.jsx(Q,{})};var b,f,y;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(y=(f=t.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};var v,M,V;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    ...Healthy.args,
    latestValue: 82
  }
}`,...(V=(M=c.parameters)==null?void 0:M.docs)==null?void 0:V.source}}};var j,C,S;m.parameters={...m.parameters,docs:{...(j=m.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    ...Healthy.args,
    latestValue: 95
  }
}`,...(S=(C=m.parameters)==null?void 0:C.docs)==null?void 0:S.source}}};var w,D,U;i.parameters={...i.parameters,docs:{...(w=i.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(U=(D=i.parameters)==null?void 0:D.docs)==null?void 0:U.source}}};var L,_,T;u.parameters={...u.parameters,docs:{...(L=u.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    ...Memory.args
  }
}`,...(T=(_=u.parameters)==null?void 0:_.docs)==null?void 0:T.source}}};var N,H,k;p.parameters={...p.parameters,docs:{...(N=p.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    ...Healthy.args
  },
  render: () => <GaugeCellVariants />
}`,...(k=(H=p.parameters)==null?void 0:H.docs)==null?void 0:k.source}}};const pe=["Healthy","Warning","Danger","Memory","MetricMax","CellVariants"];export{p as CellVariants,m as Danger,t as Healthy,i as Memory,u as MetricMax,c as Warning,pe as __namedExportsOrder,ue as default};
