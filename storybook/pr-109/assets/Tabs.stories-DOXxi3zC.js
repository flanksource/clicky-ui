import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Ks as r,Nr as i,Wo as a,n as o}from"./icons-N6BqLuiz.js";import{n as s,t as c}from"./Tabs-CnhKrBVO.js";var l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{l=t(),o(),s(),u=n(),d={title:`Layout/Tabs`,component:c,parameters:{docs:{description:{component:"Controlled tab strip built on TabButton. Defaults to the `underline` variant (the row carries a bottom border and the active tab's underline overlaps it). Render the matching panel yourself from `value`."}}}},f=[{id:`overview`,label:`Overview`},{id:`checks`,label:`Checks`,icon:i,count:6},{id:`bench`,label:`Bench`,icon:a},{id:`issues`,label:`Issues`,icon:r,count:2,countColor:`bg-rose-500`}],p={render:()=>{let[e,t]=(0,l.useState)(`overview`);return(0,u.jsxs)(`div`,{className:`w-[480px]`,children:[(0,u.jsx)(c,{tabs:f,value:e,onChange:t}),(0,u.jsxs)(`div`,{className:`p-density-3 text-sm text-muted-foreground`,children:[`Active: `,e]})]})}},m={render:()=>{let[e,t]=(0,l.useState)(`overview`);return(0,u.jsxs)(`div`,{className:`w-[480px]`,children:[(0,u.jsx)(c,{tabs:f,value:e,onChange:t,variant:`pill`}),(0,u.jsxs)(`div`,{className:`p-density-3 text-sm text-muted-foreground`,children:[`Active: `,e]})]})}},h={render:()=>{let[e,t]=(0,l.useState)(`overview`);return(0,u.jsx)(`div`,{className:`w-[480px]`,children:(0,u.jsx)(c,{tabs:[...f.slice(0,2),{id:`locked`,label:`Locked`,disabled:!0}],value:e,onChange:t})})}},g=[`Underline`,`Pill`,`WithDisabled`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("overview");
    return <div className="w-[480px]">
        <Tabs tabs={items} value={value} onChange={setValue} />
        <div className="p-density-3 text-sm text-muted-foreground">Active: {value}</div>
      </div>;
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("overview");
    return <div className="w-[480px]">
        <Tabs tabs={items} value={value} onChange={setValue} variant="pill" />
        <div className="p-density-3 text-sm text-muted-foreground">Active: {value}</div>
      </div>;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}}})))()}_();export{m as Pill,p as Underline,h as WithDisabled,g as __namedExportsOrder,d as default};