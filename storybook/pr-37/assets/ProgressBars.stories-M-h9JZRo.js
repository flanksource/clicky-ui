import{j as e}from"./iframe-DQ9XXhpn.js";import{P as o}from"./ProgressBars-BjBogs24.js";import{U as n}from"./UiChip-B9TXRa-x.js";import"./preload-helper-B2wK-Kjy.js";import"./utils-BLSKlp9E.js";import"./Icon-OSD6-FvK.js";import"./GaugeHoverCard-DiXZXBP8.js";import"./HoverCard-nZZP1fzj.js";import"./index-BDYInp2-.js";import"./index-C6GOQB4V.js";import"./modalStack-BT1YNoec.js";import"./zIndex-CigQ76av.js";const r=1e3,m=1024**3,rr={title:"Charts/ProgressBars",component:o,parameters:{docs:{description:{component:"Quantised utilisation as a row of bars — one per unit of capacity (ceil of the limit) — filled by the usage, so the bar straddling the boundary is partially filled and trailing bars show headroom. Purely presentational: pass plain `usage`/`max` numbers (no data fetching). Defaults to CPU cores; pass `unit` (e.g. `{ perBar: 1 GiB, label: 'GB' }`) to render memory or any other capacity. `showValue` controls the caption, `orientation` switches the bars between vertical columns and horizontal rows, and an optional `stats` prop drives the hover card's min/max/avg rows. The pure `deriveProgressBars(usage, limit, perBar)` helper computes the model. (`TimeseriesCoreBars` wraps this with a live timeseries fetcher.)"}}},argTypes:{title:{control:"text"},usage:{control:{type:"number",min:0,step:100}},max:{control:{type:"number",min:0,step:100}},variant:{control:"inline-radio",options:["default","cell"]},orientation:{control:"inline-radio",options:["horizontal","vertical"]},showLabel:{control:"boolean"},showValue:{control:"boolean"},showCapacity:{control:"boolean"},thresholds:{table:{disable:!0}},icon:{table:{disable:!0}},unit:{table:{disable:!0}},stats:{table:{disable:!0}},className:{table:{disable:!0}}},render:k=>e.jsx("div",{className:"w-48",children:e.jsx(o,{...k})})},a={args:{title:"CPU",icon:n,usage:2.3*r,max:4*r,showValue:!0,orientation:"vertical"}},l={args:{...a.args,orientation:"horizontal"}},c={args:{...a.args,showValue:!1}},s={args:{...a.args,max:8*r,usage:7.6*r}},t={args:{...a.args,stats:{min:1e3,max:3e3,avg:2075},hoverFooter:"over last 1h"}},d={render:()=>e.jsxs("div",{className:"grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm",children:[e.jsx("div",{className:"border-b border-r border-border px-2 py-1.5",children:e.jsx(o,{variant:"cell",title:"CPU",icon:n,usage:2.3*r,max:4*r})}),e.jsx("div",{className:"border-b border-border px-2 py-1.5",children:e.jsx(o,{variant:"cell",showLabel:!1,title:"CPU",icon:n,usage:2.3*r,max:4*r})}),e.jsx("div",{className:"border-r border-border px-2 py-1.5",children:e.jsx(o,{variant:"cell",orientation:"horizontal",title:"Near limit",icon:n,usage:7.6*r,max:8*r})}),e.jsx("div",{className:"px-2 py-1.5",children:e.jsx(o,{variant:"cell",orientation:"horizontal",showLabel:!1,showValue:!1,title:"Near limit",icon:n,usage:7.6*r,max:8*r})})]})},i={args:{title:"Mem",usage:2.5*m,max:4*m,unit:{perBar:m,label:"GB",barLabel:"GB"}}};var p,u,b,g,h;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    icon: UiChip,
    usage: 2.3 * ONE_CORE,
    max: 4 * ONE_CORE,
    showValue: true,
    orientation: "vertical"
  }
}`,...(b=(u=a.parameters)==null?void 0:u.docs)==null?void 0:b.source},description:{story:"2.3 cores used of a 4-core limit.",...(h=(g=a.parameters)==null?void 0:g.docs)==null?void 0:h.description}}};var v,x,C;l.parameters={...l.parameters,docs:{...(v=l.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    orientation: "horizontal"
  }
}`,...(C=(x=l.parameters)==null?void 0:x.docs)==null?void 0:C.source}}};var y,N,w;c.parameters={...c.parameters,docs:{...(y=c.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    showValue: false
  }
}`,...(w=(N=c.parameters)==null?void 0:N.docs)==null?void 0:w.source}}};var E,O,f,B,P;s.parameters={...s.parameters,docs:{...(E=s.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    max: 8 * ONE_CORE,
    usage: 7.6 * ONE_CORE
  }
}`,...(f=(O=s.parameters)==null?void 0:O.docs)==null?void 0:f.source},description:{story:"Near-capacity: 7.6 of 8 cores → danger tone.",...(P=(B=s.parameters)==null?void 0:B.docs)==null?void 0:P.description}}};var G,_,R,U,j;t.parameters={...t.parameters,docs:{...(G=t.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    stats: {
      min: 1000,
      max: 3000,
      avg: 2075
    },
    hoverFooter: "over last 1h"
  }
}`,...(R=(_=t.parameters)==null?void 0:_.docs)==null?void 0:R.source},description:{story:"Summary stats drive the hover card's Min/Max/Avg rows.",...(j=(U=t.parameters)==null?void 0:U.docs)==null?void 0:j.description}}};var V,z,S;d.parameters={...d.parameters,docs:{...(V=d.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => <div className="grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm">
      <div className="border-b border-r border-border px-2 py-1.5">
        <ProgressBars variant="cell" title="CPU" icon={UiChip} usage={2.3 * ONE_CORE} max={4 * ONE_CORE} />
      </div>
      <div className="border-b border-border px-2 py-1.5">
        <ProgressBars variant="cell" showLabel={false} title="CPU" icon={UiChip} usage={2.3 * ONE_CORE} max={4 * ONE_CORE} />
      </div>
      <div className="border-r border-border px-2 py-1.5">
        <ProgressBars variant="cell" orientation="horizontal" title="Near limit" icon={UiChip} usage={7.6 * ONE_CORE} max={8 * ONE_CORE} />
      </div>
      <div className="px-2 py-1.5">
        <ProgressBars variant="cell" orientation="horizontal" showLabel={false} showValue={false} title="Near limit" icon={UiChip} usage={7.6 * ONE_CORE} max={8 * ONE_CORE} />
      </div>
    </div>
}`,...(S=(z=d.parameters)==null?void 0:z.docs)==null?void 0:S.source}}};var F,L,M,H,T;i.parameters={...i.parameters,docs:{...(F=i.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    title: "Mem",
    usage: 2.5 * GiB,
    max: 4 * GiB,
    unit: {
      perBar: GiB,
      label: "GB",
      barLabel: "GB"
    }
  }
}`,...(M=(L=i.parameters)==null?void 0:L.docs)==null?void 0:M.source},description:{story:"Memory as one bar per GB via the `unit` prop: 2.5 GB used of 4 GB.",...(T=(H=i.parameters)==null?void 0:H.docs)==null?void 0:T.description}}};const er=["FourCores","Horizontal","ValueHidden","NearCapacity","WithStatsHover","CellVariants","MemoryGigabytes"];export{d as CellVariants,a as FourCores,l as Horizontal,i as MemoryGigabytes,s as NearCapacity,c as ValueHidden,t as WithStatsHover,er as __namedExportsOrder,rr as default};
