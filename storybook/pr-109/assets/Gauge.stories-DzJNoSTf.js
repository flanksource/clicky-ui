import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{Hs as n,Ks as r,Wo as i,n as a,ys as o}from"./icons-N6BqLuiz.js";import{n as s,t as c}from"./Gauge-BVIJnh1z.js";var l,u,d,f,p,m;function h(){return(h=e((()=>{s(),a(),l=t(),u={title:`Charts/Gauge`,component:c,args:{label:`Passed`,value:92,max:100,tone:`success`,suffix:`%`,subtitle:`110 / 120 tests`,meta:`fresh`,icon:o},argTypes:{label:{control:`text`},tone:{control:`inline-radio`,options:[`neutral`,`success`,`warning`,`danger`,`info`]},variant:{control:`inline-radio`,options:[`default`,`cell`]},showLabel:{control:`boolean`},value:{control:{type:`number`,min:0,max:200,step:1}},max:{control:{type:`number`,min:1,max:200,step:1}},suffix:{control:`text`},subtitle:{control:`text`},meta:{control:`text`},icon:{table:{disable:!0}},className:{table:{disable:!0}}},parameters:{docs:{description:{component:`Compact metric tile for summaries and test/run dashboards. It displays a label, normalized value, optional icon, subtitle, and right-aligned metadata.`}}}},d={},f={render:()=>(0,l.jsxs)(`div`,{className:`flex flex-wrap gap-density-3`,children:[(0,l.jsx)(c,{icon:o,label:`Passed`,value:92,tone:`success`,subtitle:`110 / 120 tests`,meta:`fresh`}),(0,l.jsx)(c,{icon:n,label:`Failed`,value:3,tone:`danger`,subtitle:`requires attention`,meta:`3m`}),(0,l.jsx)(c,{icon:r,label:`Skipped`,value:5,tone:`warning`,subtitle:`intentionally skipped`,meta:`cached`})]})},p={render:()=>(0,l.jsxs)(`div`,{className:`grid w-[22rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm`,children:[(0,l.jsx)(`div`,{className:`border-b border-r border-border px-2 py-1.5`,children:(0,l.jsx)(c,{variant:`cell`,icon:o,label:`Passed`,value:92,tone:`success`,meta:`fresh`})}),(0,l.jsx)(`div`,{className:`border-b border-border px-2 py-1.5`,children:(0,l.jsx)(c,{variant:`cell`,showLabel:!1,icon:o,label:`Passed`,value:92,tone:`success`,meta:`fresh`})}),(0,l.jsx)(`div`,{className:`border-r border-border px-2 py-1.5`,children:(0,l.jsx)(c,{variant:`cell`,icon:r,label:`Skipped`,value:5,tone:`warning`})}),(0,l.jsx)(`div`,{className:`px-2 py-1.5`,children:(0,l.jsx)(c,{variant:`cell`,showLabel:!1,icon:i,label:`Coverage`,value:78,tone:`info`})})]})},m=[`Default`,`StatusSet`,`CellVariants`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-3">
      <Gauge icon={UiPass} label="Passed" value={92} tone="success" subtitle="110 / 120 tests" meta="fresh" />
      <Gauge icon={UiError} label="Failed" value={3} tone="danger" subtitle="requires attention" meta="3m" />
      <Gauge icon={UiWarningCircle} label="Skipped" value={5} tone="warning" subtitle="intentionally skipped" meta="cached" />
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-[22rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm">
      <div className="border-b border-r border-border px-2 py-1.5">
        <Gauge variant="cell" icon={UiPass} label="Passed" value={92} tone="success" meta="fresh" />
      </div>
      <div className="border-b border-border px-2 py-1.5">
        <Gauge variant="cell" showLabel={false} icon={UiPass} label="Passed" value={92} tone="success" meta="fresh" />
      </div>
      <div className="border-r border-border px-2 py-1.5">
        <Gauge variant="cell" icon={UiWarningCircle} label="Skipped" value={5} tone="warning" />
      </div>
      <div className="px-2 py-1.5">
        <Gauge variant="cell" showLabel={false} icon={UiGraph} label="Coverage" value={78} tone="info" />
      </div>
    </div>
}`,...p.parameters?.docs?.source}}}})))()}h();export{p as CellVariants,d as Default,f as StatusSet,m as __namedExportsOrder,u as default};