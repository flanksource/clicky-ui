import{j as e}from"./iframe-BbITQAD0.js";import{G as a}from"./Gauge-BS9lkr3r.js";import{U as t}from"./UiPass-C2kr_Yq2.js";import{U as v}from"./UiWarningCircle-CgxiulWR.js";import{U as x}from"./UiGraph-B71eA3HZ.js";import{U as g}from"./UiError-CoIZd9H0.js";import"./preload-helper-C67fKNjI.js";import"./utils-BLSKlp9E.js";import"./Icon-BV_HrUof.js";const S={title:"Charts/Gauge",component:a,args:{label:"Passed",value:92,max:100,tone:"success",suffix:"%",subtitle:"110 / 120 tests",meta:"fresh",icon:t},argTypes:{label:{control:"text"},tone:{control:"inline-radio",options:["neutral","success","warning","danger","info"]},variant:{control:"inline-radio",options:["default","cell"]},showLabel:{control:"boolean"},value:{control:{type:"number",min:0,max:200,step:1}},max:{control:{type:"number",min:1,max:200,step:1}},suffix:{control:"text"},subtitle:{control:"text"},meta:{control:"text"},icon:{table:{disable:!0}},className:{table:{disable:!0}}},parameters:{docs:{description:{component:"Compact metric tile for summaries and test/run dashboards. It displays a label, normalized value, optional icon, subtitle, and right-aligned metadata."}}}},r={},s={render:()=>e.jsxs("div",{className:"flex flex-wrap gap-density-3",children:[e.jsx(a,{icon:t,label:"Passed",value:92,tone:"success",subtitle:"110 / 120 tests",meta:"fresh"}),e.jsx(a,{icon:g,label:"Failed",value:3,tone:"danger",subtitle:"requires attention",meta:"3m"}),e.jsx(a,{icon:v,label:"Skipped",value:5,tone:"warning",subtitle:"intentionally skipped",meta:"cached"})]})},o={render:()=>e.jsxs("div",{className:"grid w-[22rem] grid-cols-2 overflow-hidden rounded-md border border-border bg-background text-sm",children:[e.jsx("div",{className:"border-b border-r border-border px-2 py-1.5",children:e.jsx(a,{variant:"cell",icon:t,label:"Passed",value:92,tone:"success",meta:"fresh"})}),e.jsx("div",{className:"border-b border-border px-2 py-1.5",children:e.jsx(a,{variant:"cell",showLabel:!1,icon:t,label:"Passed",value:92,tone:"success",meta:"fresh"})}),e.jsx("div",{className:"border-r border-border px-2 py-1.5",children:e.jsx(a,{variant:"cell",icon:v,label:"Skipped",value:5,tone:"warning"})}),e.jsx("div",{className:"px-2 py-1.5",children:e.jsx(a,{variant:"cell",showLabel:!1,icon:x,label:"Coverage",value:78,tone:"info"})})]})};var l,n,i;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:"{}",...(i=(n=r.parameters)==null?void 0:n.docs)==null?void 0:i.source}}};var d,c,m;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-density-3">
      <Gauge icon={UiPass} label="Passed" value={92} tone="success" subtitle="110 / 120 tests" meta="fresh" />
      <Gauge icon={UiError} label="Failed" value={3} tone="danger" subtitle="requires attention" meta="3m" />
      <Gauge icon={UiWarningCircle} label="Skipped" value={5} tone="warning" subtitle="intentionally skipped" meta="cached" />
    </div>
}`,...(m=(c=s.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var u,b,p;o.parameters={...o.parameters,docs:{...(u=o.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(p=(b=o.parameters)==null?void 0:b.docs)==null?void 0:p.source}}};const C=["Default","StatusSet","CellVariants"];export{o as CellVariants,r as Default,s as StatusSet,C as __namedExportsOrder,S as default};
