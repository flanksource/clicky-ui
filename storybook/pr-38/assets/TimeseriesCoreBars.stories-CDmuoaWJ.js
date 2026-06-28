import{j as e,r as D}from"./iframe-BxLPOr6M.js";import{Q as _,a as I}from"./suspense-DJ3MBEGN.js";import{T as s}from"./TimeseriesCoreBars-CUa0cRjC.js";import{U as c}from"./UiChip-CxcHv84l.js";import"./preload-helper-C4wV90-x.js";import"./useQueries-GgCTN-Ta.js";import"./ProgressBars-CW6nzrCh.js";import"./utils-CR52uffu.js";import"./Icon-DGql8Ler.js";import"./GaugeHoverCard-4JXaKd-a.js";import"./HoverCard-BHwQ2VLC.js";import"./index-DOlc9q0f.js";import"./index-CXpH9Yf8.js";import"./modalStack-BJc3ZvRY.js";import"./zIndex-CigQ76av.js";import"./gauge-stats-BzAlBUFF.js";const Z=Date.parse("2026-06-02T12:00:00Z");function t(r){return async l=>{const A=r.find(R=>l.includes(R.match))??r[0];return{id:l,points:[{at:new Date(Z).toISOString(),value:A.latest}]}}}function J(r){const l=D.useMemo(()=>new _({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(I,{client:l,children:e.jsx("div",{className:"w-48",children:e.jsx(s,{...r})})})}function K(){const r=D.useMemo(()=>new _({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(I,{client:r,children:e.jsxs("div",{className:"grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm",children:[e.jsx("div",{className:"border-b border-r border-border px-2 py-1.5",children:e.jsx(s,{variant:"cell",title:"CPU",icon:c,value:{id:"cpu.cell.usage"},max:4e3,refreshMs:0,fetcher:t([{match:"cpu.cell",latest:2300}])})}),e.jsx("div",{className:"border-b border-border px-2 py-1.5",children:e.jsx(s,{variant:"cell",showLabel:!1,title:"CPU",icon:c,value:{id:"cpu.icon.usage"},max:4e3,refreshMs:0,fetcher:t([{match:"cpu.icon",latest:2300}])})}),e.jsx("div",{className:"border-r border-border px-2 py-1.5",children:e.jsx(s,{variant:"cell",orientation:"horizontal",title:"Near limit",icon:c,value:{id:"cpu.warning.usage"},max:8e3,refreshMs:0,fetcher:t([{match:"warning",latest:7600}])})}),e.jsx("div",{className:"px-2 py-1.5",children:e.jsx(s,{variant:"cell",orientation:"horizontal",showLabel:!1,showValue:!1,title:"Near limit",icon:c,value:{id:"cpu.danger.usage"},max:8e3,refreshMs:0,fetcher:t([{match:"danger",latest:7600}])})})]})})}const ue={title:"Charts/TimeseriesCoreBars",component:s,parameters:{docs:{description:{component:"Quantised utilisation as a row of bars — one per unit of capacity (ceil of the limit) — filled by the latest usage, so the bar straddling the boundary is partially filled and trailing bars show headroom. Defaults to CPU cores; pass `unit` (e.g. `{ perBar: 1 GiB, label: 'GB' }`) to render memory or any other capacity. Usage and limit are read live from the timeseries store. `showValue` controls the caption, and `orientation` switches the bars between vertical columns and horizontal rows. The pure `deriveProgressBars(usage, limit, perBar)` helper computes the model. Hovering a gauge opens a card with its current/min/max/avg/capacity over the window (`hoverCard`, default on). Stories pass a synthetic `fetcher` and `refreshMs={0}`."}}},argTypes:{title:{control:"text"},baseUrl:{control:"text"},range:{control:"text"},refreshMs:{control:{type:"number",min:0,step:1e3}},variant:{control:"inline-radio",options:["default","cell"]},orientation:{control:"inline-radio",options:["horizontal","vertical"]},showLabel:{control:"boolean"},showValue:{control:"boolean"},thresholds:{table:{disable:!0}},icon:{table:{disable:!0}},fetcher:{table:{disable:!0}},value:{table:{disable:!0}},max:{table:{disable:!0}},className:{table:{disable:!0}}},render:r=>e.jsx(J,{...r})},a={args:{title:"CPU",icon:c,value:{id:"cpu.usage"},max:4e3,refreshMs:0,showValue:!0,orientation:"vertical",fetcher:t([{match:"cpu",latest:2300}])}},m={args:{...a.args,orientation:"horizontal"}},d={args:{...a.args,showValue:!1}},o={args:{...a.args,max:8e3,fetcher:t([{match:"cpu",latest:7600}])}},i={args:{title:"CPU",value:{id:"cpu.usage"},max:{id:"cpu.limit"},refreshMs:0,fetcher:t([{match:"usage",latest:1500},{match:"limit",latest:2e3}])}},u={render:()=>e.jsx(K,{})},n={args:{title:"Mem",value:{id:"mem.rss"},max:4*1024**3,unit:{perBar:1024**3,label:"GB",barLabel:"GB"},refreshMs:0,fetcher:t([{match:"mem",latest:2.5*1024**3}])}};var p,h,g,f,b;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    icon: UiChip,
    value: {
      id: "cpu.usage"
    },
    max: 4000,
    refreshMs: 0,
    showValue: true,
    orientation: "vertical",
    fetcher: makeFetcher([{
      match: "cpu",
      latest: 2300
    }])
  }
}`,...(g=(h=a.parameters)==null?void 0:h.docs)==null?void 0:g.source},description:{story:"2.3 cores used of a 4-core limit.",...(b=(f=a.parameters)==null?void 0:f.docs)==null?void 0:b.description}}};var x,v,y;m.parameters={...m.parameters,docs:{...(x=m.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    orientation: "horizontal"
  }
}`,...(y=(v=m.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};var C,w,M;d.parameters={...d.parameters,docs:{...(C=d.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    showValue: false
  }
}`,...(M=(w=d.parameters)==null?void 0:w.docs)==null?void 0:M.source}}};var B,j,V,N,S;o.parameters={...o.parameters,docs:{...(B=o.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    max: 8000,
    fetcher: makeFetcher([{
      match: "cpu",
      latest: 7600
    }])
  }
}`,...(V=(j=o.parameters)==null?void 0:j.docs)==null?void 0:V.source},description:{story:"Near-capacity: 7.6 of 8 cores → danger tone.",...(S=(N=o.parameters)==null?void 0:N.docs)==null?void 0:S.description}}};var U,G,F,P,T;i.parameters={...i.parameters,docs:{...(U=i.parameters)==null?void 0:U.docs,source:{originalSource:`{
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
}`,...(F=(G=i.parameters)==null?void 0:G.docs)==null?void 0:F.source},description:{story:"Limit read from a `.limit` metric instead of a constant.",...(T=(P=i.parameters)==null?void 0:P.docs)==null?void 0:T.description}}};var z,L,k;u.parameters={...u.parameters,docs:{...(z=u.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <CoreBarsCellVariants />
}`,...(k=(L=u.parameters)==null?void 0:L.docs)==null?void 0:k.source}}};var E,H,q,O,Q;n.parameters={...n.parameters,docs:{...(E=n.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    title: "Mem",
    value: {
      id: "mem.rss"
    },
    max: 4 * 1024 ** 3,
    unit: {
      perBar: 1024 ** 3,
      label: "GB",
      barLabel: "GB"
    },
    refreshMs: 0,
    fetcher: makeFetcher([{
      match: "mem",
      latest: 2.5 * 1024 ** 3
    }])
  }
}`,...(q=(H=n.parameters)==null?void 0:H.docs)==null?void 0:q.source},description:{story:"Memory as one bar per GB via the `unit` prop: 2.5 GB used of 4 GB.",...(Q=(O=n.parameters)==null?void 0:O.docs)==null?void 0:Q.description}}};const pe=["FourCores","Horizontal","ValueHidden","NearCapacity","MetricLimit","CellVariants","MemoryGigabytes"];export{u as CellVariants,a as FourCores,m as Horizontal,n as MemoryGigabytes,i as MetricLimit,o as NearCapacity,d as ValueHidden,pe as __namedExportsOrder,ue as default};
