import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,zr as i}from"./icons-Dd_HwYAK.js";import{g as a,h as o}from"./suspense-Bcp9qyqt.js";import{n as s,t as c}from"./queryClient-BlbTeML9.js";import{n as l,t as u}from"./TimeseriesCoreBars-i777awZV.js";function d(e){return async t=>{let n=e.find(e=>t.includes(e.match))??e[0];return{id:t,points:[{at:new Date(g).toISOString(),value:n.latest}]}}}function f(e){let t=(0,m.useMemo)(()=>new c({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return(0,h.jsx)(o,{client:t,children:(0,h.jsx)(`div`,{className:`w-48`,children:(0,h.jsx)(u,{...e})})})}function p(){let e=(0,m.useMemo)(()=>new c({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return(0,h.jsx)(o,{client:e,children:(0,h.jsxs)(`div`,{className:`grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm`,children:[(0,h.jsx)(`div`,{className:`border-b border-r border-border px-2 py-1.5`,children:(0,h.jsx)(u,{variant:`cell`,title:`CPU`,icon:i,value:{id:`cpu.cell.usage`},max:4e3,refreshMs:0,fetcher:d([{match:`cpu.cell`,latest:2300}])})}),(0,h.jsx)(`div`,{className:`border-b border-border px-2 py-1.5`,children:(0,h.jsx)(u,{variant:`cell`,showLabel:!1,title:`CPU`,icon:i,value:{id:`cpu.icon.usage`},max:4e3,refreshMs:0,fetcher:d([{match:`cpu.icon`,latest:2300}])})}),(0,h.jsx)(`div`,{className:`border-r border-border px-2 py-1.5`,children:(0,h.jsx)(u,{variant:`cell`,orientation:`horizontal`,title:`Near limit`,icon:i,value:{id:`cpu.warning.usage`},max:8e3,refreshMs:0,fetcher:d([{match:`warning`,latest:7600}])})}),(0,h.jsx)(`div`,{className:`px-2 py-1.5`,children:(0,h.jsx)(u,{variant:`cell`,orientation:`horizontal`,showLabel:!1,showValue:!1,title:`Near limit`,icon:i,value:{id:`cpu.danger.usage`},max:8e3,refreshMs:0,fetcher:d([{match:`danger`,latest:7600}])})})]})})}var m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{m=t(),s(),a(),r(),l(),h=n(),g=Date.parse(`2026-06-02T12:00:00Z`),_={title:`Charts/TimeseriesCoreBars`,component:u,parameters:{docs:{description:{component:"Quantised utilisation as a row of bars — one per unit of capacity (ceil of the limit) — filled by the latest usage, so the bar straddling the boundary is partially filled and trailing bars show headroom. Defaults to CPU cores; pass `unit` (e.g. `{ perBar: 1 GiB, label: 'GB' }`) to render memory or any other capacity. Usage and limit are read live from the timeseries store. `showValue` controls the caption, and `orientation` switches the bars between vertical columns and horizontal rows. The pure `deriveProgressBars(usage, limit, perBar)` helper computes the model. Hovering a gauge opens a card with its current/min/max/avg/capacity over the window (`hoverCard`, default on). Stories pass a synthetic `fetcher` and `refreshMs={0}`."}}},argTypes:{title:{control:`text`},baseUrl:{control:`text`},range:{control:`text`},refreshMs:{control:{type:`number`,min:0,step:1e3}},variant:{control:`inline-radio`,options:[`default`,`cell`]},orientation:{control:`inline-radio`,options:[`horizontal`,`vertical`]},showLabel:{control:`boolean`},showValue:{control:`boolean`},thresholds:{table:{disable:!0}},icon:{table:{disable:!0}},fetcher:{table:{disable:!0}},value:{table:{disable:!0}},max:{table:{disable:!0}},className:{table:{disable:!0}}},render:e=>(0,h.jsx)(f,{...e})},v={args:{title:`CPU`,icon:i,value:{id:`cpu.usage`},max:4e3,refreshMs:0,showValue:!0,orientation:`vertical`,fetcher:d([{match:`cpu`,latest:2300}])}},y={args:{...v.args,orientation:`horizontal`}},b={args:{...v.args,showValue:!1}},x={args:{...v.args,max:8e3,fetcher:d([{match:`cpu`,latest:7600}])}},S={args:{title:`CPU`,value:{id:`cpu.usage`},max:{id:`cpu.limit`},refreshMs:0,fetcher:d([{match:`usage`,latest:1500},{match:`limit`,latest:2e3}])}},C={render:()=>(0,h.jsx)(p,{})},w={args:{title:`Mem`,value:{id:`mem.rss`},max:4*1024**3,unit:{perBar:1024**3,label:`GB`,barLabel:`GB`},refreshMs:0,fetcher:d([{match:`mem`,latest:2.5*1024**3}])}},T=[`FourCores`,`Horizontal`,`ValueHidden`,`NearCapacity`,`MetricLimit`,`CellVariants`,`MemoryGigabytes`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`2.3 cores used of a 4-core limit.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    orientation: "horizontal"
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    showValue: false
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    ...FourCores.args,
    max: 8000,
    fetcher: makeFetcher([{
      match: "cpu",
      latest: 7600
    }])
  }
}`,...x.parameters?.docs?.source},description:{story:`Near-capacity: 7.6 of 8 cores → danger tone.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source},description:{story:"Limit read from a `.limit` metric instead of a constant.",...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <CoreBarsCellVariants />
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source},description:{story:"Memory as one bar per GB via the `unit` prop: 2.5 GB used of 4 GB.",...w.parameters?.docs?.description}}}})))()}E();export{C as CellVariants,v as FourCores,y as Horizontal,w as MemoryGigabytes,S as MetricLimit,x as NearCapacity,b as ValueHidden,T as __namedExportsOrder,_ as default};