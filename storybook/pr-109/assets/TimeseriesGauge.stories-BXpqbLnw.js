import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{_l as r,n as i,tl as a,zr as o}from"./icons-N6BqLuiz.js";import{g as s,h as c}from"./suspense-Bcp9qyqt.js";import{n as l,t as u}from"./queryClient-BlbTeML9.js";import{n as d,t as f}from"./TimeseriesGauge-DkPEMx7J.js";function p(e){return async t=>{let n=e.find(e=>t.includes(e.match))??e[0];return{id:t,points:Array.from({length:12},(e,t)=>({at:new Date(y+t*3e4).toISOString(),value:n.latest*(.7+t/11*.3)}))}}}function m(e){let t=typeof e.max==`object`?e.max:void 0;return p([{match:e.value.id,latest:e.latestValue},...t?[{match:t.id,latest:e.maxLatestValue??e.latestValue}]:[]])}function h(e){let{latestValue:t,maxLatestValue:n,fetcher:r,...i}=e,a=(0,_.useMemo)(()=>new u({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[t,n]);return(0,v.jsx)(c,{client:a,children:(0,v.jsx)(`div`,{className:`w-40`,children:(0,v.jsx)(f,{...i,fetcher:r??m(e)})})})}function g(){let e=(0,_.useMemo)(()=>new u({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return(0,v.jsx)(c,{client:e,children:(0,v.jsxs)(`div`,{className:`grid w-[24rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm`,children:[(0,v.jsx)(`div`,{className:`border-b border-r border-border px-2 py-1.5`,children:(0,v.jsx)(f,{variant:`cell`,title:`CPU`,icon:o,unit:`percent`,centerDisplay:`percent`,value:{id:`cpu.cell.usage`},max:100,refreshMs:0,expandable:!1,fetcher:p([{match:`cpu.cell`,latest:42}])})}),(0,v.jsx)(`div`,{className:`border-b border-border px-2 py-1.5`,children:(0,v.jsx)(f,{variant:`cell`,showLabel:!1,title:`CPU`,icon:o,unit:`percent`,centerDisplay:`percent`,value:{id:`cpu.icon.usage`},max:100,refreshMs:0,expandable:!1,fetcher:p([{match:`cpu.icon`,latest:42}])})}),(0,v.jsx)(`div`,{className:`border-r border-border px-2 py-1.5`,children:(0,v.jsx)(f,{variant:`cell`,title:`Memory`,icon:a,unit:`bytes`,value:{id:`mem.cell.usage`},max:{id:`mem.cell.limit`},refreshMs:0,expandable:!1,fetcher:p([{match:`usage`,latest:32e8},{match:`limit`,latest:8e9}])})}),(0,v.jsx)(`div`,{className:`px-2 py-1.5`,children:(0,v.jsx)(f,{variant:`cell`,showLabel:!1,title:`Memory`,icon:a,unit:`bytes`,value:{id:`mem.icon.usage`},max:{id:`mem.icon.limit`},refreshMs:0,expandable:!1,fetcher:p([{match:`usage`,latest:32e8},{match:`limit`,latest:8e9}])})})]})})}var _,v,y,b,x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{_=t(),l(),s(),i(),d(),v=n(),y=Date.parse(`2026-06-02T12:00:00Z`),b={title:`Charts/TimeseriesGauge`,component:f,parameters:{docs:{description:{component:"Gauge whose fill is a metric's latest value over its maximum (a `.limit`-style metric or a fixed number), both read live from the timeseries store. `shape` switches between a half (180°) radial arc (default) and a horizontal linear progress bar; the fill crosses warning/danger thresholds and an expand button opens the full value/max chart in a modal. Hovering opens a card with the metric's current/min/max/avg/capacity over the window (`hoverCard`, default on). Stories pass a synthetic `fetcher` and `refreshMs={0}`."}}},argTypes:{title:{control:`text`},unit:{control:`select`,options:[`percent`,`bytes`,`short`,`ms`]},range:{control:`text`},refreshMs:{control:{type:`number`,min:0,step:1e3}},latestValue:{name:`value`,control:{type:`number`,min:0,step:1}},maxLatestValue:{name:`max value`,control:{type:`number`,min:0,step:1}},centerDisplay:{control:`inline-radio`,options:[`value`,`percent`]},variant:{control:`inline-radio`,options:[`default`,`cell`]},shape:{control:`inline-radio`,options:[`radial`,`linear`]},showLabel:{control:`boolean`},expandable:{control:`boolean`},baseUrl:{control:`text`},thresholds:{table:{disable:!0}},icon:{table:{disable:!0}},fetcher:{table:{disable:!0}},value:{table:{disable:!0}},max:{table:{disable:!0}},className:{table:{disable:!0}}},render:e=>(0,v.jsx)(h,{...e})},x={args:{title:`CPU`,icon:o,unit:`percent`,centerDisplay:`percent`,value:{id:`cpu.usage`},max:100,latestValue:42,maxLatestValue:100,refreshMs:0}},S={args:{...x.args,latestValue:82}},C={args:{...x.args,latestValue:95}},w={args:{title:`Memory`,icon:a,unit:`bytes`,centerDisplay:`value`,value:{id:`mem.usage`},max:{id:`mem.limit`},latestValue:32e8,maxLatestValue:8e9,refreshMs:0}},T={args:{...w.args}},E={args:{title:`Disk`,icon:r,unit:`bytes`,centerDisplay:`percent`,shape:`linear`,value:{id:`disk.usage`},max:{id:`disk.limit`},latestValue:18e9,maxLatestValue:64e9,refreshMs:0}},D={args:{...x.args},render:()=>(0,v.jsx)(g,{})},O={args:{...x.args,title:`CPU (vm-42)`,value:{id:`vm-42.cpu.percent`,load:async({signal:e})=>(e.throwIfAborted(),{id:`vm-42.cpu.percent`,points:Array.from({length:12},(e,t)=>({at:new Date(y+t*3e4).toISOString(),value:55+t*1.5}))})}}},k=[`Healthy`,`Warning`,`Danger`,`Memory`,`MetricMax`,`Linear`,`CellVariants`,`LoaderSeries`],x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ...Healthy.args,
    latestValue: 82
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    ...Healthy.args,
    latestValue: 95
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    ...Memory.args
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source},description:{story:'Disk usage rendered as a horizontal progress bar via `shape="linear"`.',...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    ...Healthy.args
  },
  render: () => <GaugeCellVariants />
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source},description:{story:"The value series is loaded by a function (`value.load`) rather than\nrequested as `baseUrl + id`; the id becomes the series' cache key.",...O.parameters?.docs?.description}}}})))()}A();export{D as CellVariants,C as Danger,x as Healthy,E as Linear,O as LoaderSeries,w as Memory,T as MetricMax,S as Warning,k as __namedExportsOrder,b as default};