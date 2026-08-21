import{r as i,j as e,ad as g,a6 as w,a5 as f}from"./iframe-BDLF7TO0.js";import{T as o}from"./Tabs-BXcMxx3X.js";import"./preload-helper-BF_8wlrL.js";import"./utils-DW-IJACk.js";import"./TabButton-yn2Op9UL.js";import"./Icon-BDal7uxE.js";const T={title:"Layout/Tabs",component:o,parameters:{docs:{description:{component:"Controlled tab strip built on TabButton. Defaults to the `underline` variant (the row carries a bottom border and the active tab's underline overlaps it). Render the matching panel yourself from `value`."}}}},l=[{id:"overview",label:"Overview"},{id:"checks",label:"Checks",icon:g,count:6},{id:"bench",label:"Bench",icon:w},{id:"issues",label:"Issues",icon:f,count:2,countColor:"bg-rose-500"}],t={render:()=>{const[s,a]=i.useState("overview");return e.jsxs("div",{className:"w-[480px]",children:[e.jsx(o,{tabs:l,value:s,onChange:a}),e.jsxs("div",{className:"p-density-3 text-sm text-muted-foreground",children:["Active: ",s]})]})}},r={render:()=>{const[s,a]=i.useState("overview");return e.jsxs("div",{className:"w-[480px]",children:[e.jsx(o,{tabs:l,value:s,onChange:a,variant:"pill"}),e.jsxs("div",{className:"p-density-3 text-sm text-muted-foreground",children:["Active: ",s]})]})}},n={render:()=>{const[s,a]=i.useState("overview");return e.jsx("div",{className:"w-[480px]",children:e.jsx(o,{tabs:[...l.slice(0,2),{id:"locked",label:"Locked",disabled:!0}],value:s,onChange:a})})}};var d,c,u;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("overview");
    return <div className="w-[480px]">
        <Tabs tabs={items} value={value} onChange={setValue} />
        <div className="p-density-3 text-sm text-muted-foreground">Active: {value}</div>
      </div>;
  }
}`,...(u=(c=t.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var v,m,p;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("overview");
    return <div className="w-[480px]">
        <Tabs tabs={items} value={value} onChange={setValue} variant="pill" />
        <div className="p-density-3 text-sm text-muted-foreground">Active: {value}</div>
      </div>;
  }
}`,...(p=(m=r.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var b,x,h;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("overview");
    return <div className="w-[480px]">
        <Tabs tabs={[...items.slice(0, 2), {
        id: "locked",
        label: "Locked",
        disabled: true
      }]} value={value} onChange={setValue} />
      </div>;
  }
}`,...(h=(x=n.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};const y=["Underline","Pill","WithDisabled"];export{r as Pill,t as Underline,n as WithDisabled,y as __namedExportsOrder,T as default};
