import{r as i,j as e}from"./iframe-DQ9XXhpn.js";import{T as o}from"./Tabs-oW7L66Po.js";import{U as g}from"./UiBeaker-BG9H9hzX.js";import{U as w}from"./UiGraph-BZ6tZ1oQ.js";import{U as f}from"./UiWarningCircle-DAyzTH8X.js";import"./preload-helper-B2wK-Kjy.js";import"./utils-BLSKlp9E.js";import"./TabButton-B0OlgRB5.js";import"./Icon-OSD6-FvK.js";const A={title:"Layout/Tabs",component:o,parameters:{docs:{description:{component:"Controlled tab strip built on TabButton. Defaults to the `underline` variant (the row carries a bottom border and the active tab's underline overlaps it). Render the matching panel yourself from `value`."}}}},l=[{id:"overview",label:"Overview"},{id:"checks",label:"Checks",icon:g,count:6},{id:"bench",label:"Bench",icon:w},{id:"issues",label:"Issues",icon:f,count:2,countColor:"bg-rose-500"}],a={render:()=>{const[s,t]=i.useState("overview");return e.jsxs("div",{className:"w-[480px]",children:[e.jsx(o,{tabs:l,value:s,onChange:t}),e.jsxs("div",{className:"p-density-3 text-sm text-muted-foreground",children:["Active: ",s]})]})}},r={render:()=>{const[s,t]=i.useState("overview");return e.jsxs("div",{className:"w-[480px]",children:[e.jsx(o,{tabs:l,value:s,onChange:t,variant:"pill"}),e.jsxs("div",{className:"p-density-3 text-sm text-muted-foreground",children:["Active: ",s]})]})}},n={render:()=>{const[s,t]=i.useState("overview");return e.jsx("div",{className:"w-[480px]",children:e.jsx(o,{tabs:[...l.slice(0,2),{id:"locked",label:"Locked",disabled:!0}],value:s,onChange:t})})}};var d,c,u;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("overview");
    return <div className="w-[480px]">
        <Tabs tabs={items} value={value} onChange={setValue} />
        <div className="p-density-3 text-sm text-muted-foreground">Active: {value}</div>
      </div>;
  }
}`,...(u=(c=a.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var m,v,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("overview");
    return <div className="w-[480px]">
        <Tabs tabs={items} value={value} onChange={setValue} variant="pill" />
        <div className="p-density-3 text-sm text-muted-foreground">Active: {value}</div>
      </div>;
  }
}`,...(p=(v=r.parameters)==null?void 0:v.docs)==null?void 0:p.source}}};var b,x,h;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...(h=(x=n.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};const B=["Underline","Pill","WithDisabled"];export{r as Pill,a as Underline,n as WithDisabled,B as __namedExportsOrder,A as default};
