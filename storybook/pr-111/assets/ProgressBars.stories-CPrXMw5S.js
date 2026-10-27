import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,zr as r}from"./icons-Dd_HwYAK.js";import{n as i,t as a}from"./ProgressBars-NWxIhL_5.js";var o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{n(),i(),o=t(),s=1e3,c=1024**3,l={title:`Charts/ProgressBars`,component:a,parameters:{docs:{description:{component:"Quantised utilisation as a row of bars — one per unit of capacity (ceil of the limit) — filled by the usage, so the bar straddling the boundary is partially filled and trailing bars show headroom. Purely presentational: pass plain `usage`/`max` numbers (no data fetching). Defaults to CPU cores; pass `unit` (e.g. `{ perBar: 1 GiB, label: 'GB' }`) to render memory or any other capacity. `showValue` controls the caption, `orientation` switches the bars between vertical columns and horizontal rows, and an optional `stats` prop drives the hover card's min/max/avg rows. The pure `deriveProgressBars(usage, limit, perBar)` helper computes the model. (`TimeseriesCoreBars` wraps this with a live timeseries fetcher.)"}}},argTypes:{title:{control:`text`},usage:{control:{type:`number`,min:0,step:100}},max:{control:{type:`number`,min:0,step:100}},variant:{control:`inline-radio`,options:[`default`,`cell`]},orientation:{control:`inline-radio`,options:[`horizontal`,`vertical`]},showLabel:{control:`boolean`},showValue:{control:`boolean`},showCapacity:{control:`boolean`},thresholds:{table:{disable:!0}},icon:{table:{disable:!0}},unit:{table:{disable:!0}},stats:{table:{disable:!0}},className:{table:{disable:!0}}},render:e=>(0,o.jsx)(`div`,{className:`w-48`,children:(0,o.jsx)(a,{...e})})},u={args:{title:`CPU`,icon:r,usage:2.3*s,max:4*s,showValue:!0,orientation:`vertical`}},d={args:{...u.args,orientation:`horizontal`}},f={args:{...u.args,showValue:!1}},p={args:{...u.args,max:8*s,usage:7.6*s}},m={args:{...u.args,stats:{min:1e3,max:3e3,avg:2075},hoverFooter:`over last 1h`}},h={render:()=>(0,o.jsxs)(`div`,{className:`grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm`,children:[(0,o.jsx)(`div`,{className:`border-b border-r border-border px-2 py-1.5`,children:(0,o.jsx)(a,{variant:`cell`,title:`CPU`,icon:r,usage:2.3*s,max:4*s})}),(0,o.jsx)(`div`,{className:`border-b border-border px-2 py-1.5`,children:(0,o.jsx)(a,{variant:`cell`,showLabel:!1,title:`CPU`,icon:r,usage:2.3*s,max:4*s})}),(0,o.jsx)(`div`,{className:`border-r border-border px-2 py-1.5`,children:(0,o.jsx)(a,{variant:`cell`,orientation:`horizontal`,title:`Near limit`,icon:r,usage:7.6*s,max:8*s})}),(0,o.jsx)(`div`,{className:`px-2 py-1.5`,children:(0,o.jsx)(a,{variant:`cell`,orientation:`horizontal`,showLabel:!1,showValue:!1,title:`Near limit`,icon:r,usage:7.6*s,max:8*s})})]})},g={args:{title:`Mem`,usage:2.5*c,max:4*c,unit:{perBar:c,label:`GB`,barLabel:`GB`}}},_=[`FourCores`,`Horizontal`,`ValueHidden`,`NearCapacity`,`WithStatsHover`,`CellVariants`,`MemoryGigabytes`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    title: "CPU",
    icon: UiChip,
    usage: 2.3 * ONE_CORE,
    max: 4 * ONE_CORE,
    showValue: true,
    orientation: "vertical"
  }
}`,...u.parameters?.docs?.source},description:{story:`2.3 cores used of a 4-core limit.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    orientation: "horizontal"
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    showValue: false
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    max: 8 * ONE_CORE,
    usage: 7.6 * ONE_CORE
  }
}`,...p.parameters?.docs?.source},description:{story:`Near-capacity: 7.6 of 8 cores → danger tone.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    stats: {
      min: 1000,
      max: 3000,
      avg: 2075
    },
    hoverFooter: "over last 1h"
  }
}`,...m.parameters?.docs?.source},description:{story:`Summary stats drive the hover card's Min/Max/Avg rows.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:"Memory as one bar per GB via the `unit` prop: 2.5 GB used of 4 GB.",...g.parameters?.docs?.description}}}})))()}v();export{h as CellVariants,u as FourCores,d as Horizontal,g as MemoryGigabytes,p as NearCapacity,f as ValueHidden,m as WithStatsHover,_ as __namedExportsOrder,l as default};