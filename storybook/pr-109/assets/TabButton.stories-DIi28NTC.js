import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Ks as r,Nr as i,Wo as a,n as o}from"./icons-N6BqLuiz.js";import{n as s,t as c}from"./TabButton-DQheOXsd.js";var l,u,d,f,p;function m(){return(m=e((()=>{l=t(),s(),o(),u=n(),d={title:`Data/TabButton`,component:c,args:{active:!0,label:`Overview`,count:3,onClick:()=>void 0},parameters:{docs:{description:{component:'Compact tab button with optional icon and count badge. It renders `role="tab"` and keeps selection state controlled by the parent.'}}}},f={render:()=>{let[e,t]=(0,l.useState)(`tests`);return(0,u.jsxs)(`div`,{className:`flex gap-density-1`,children:[(0,u.jsx)(c,{active:e===`tests`,onClick:()=>t(`tests`),label:`Tests`,icon:i,count:120,countColor:`bg-blue-500`}),(0,u.jsx)(c,{active:e===`lint`,onClick:()=>t(`lint`),label:`Lint`,icon:r,count:4,countColor:`bg-yellow-500`}),(0,u.jsx)(c,{active:e===`bench`,onClick:()=>t(`bench`),label:`Benchmarks`,icon:a})]})}},p=[`TabsWithCounts`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [active, setActive] = useState("tests");
    return <div className="flex gap-density-1">
        <TabButton active={active === "tests"} onClick={() => setActive("tests")} label="Tests" icon={UiBeaker} count={120} countColor="bg-blue-500" />
        <TabButton active={active === "lint"} onClick={() => setActive("lint")} label="Lint" icon={UiWarningCircle} count={4} countColor="bg-yellow-500" />
        <TabButton active={active === "bench"} onClick={() => setActive("bench")} label="Benchmarks" icon={UiGraph} />
      </div>;
  }
}`,...f.parameters?.docs?.source}}}})))()}m();export{f as TabsWithCounts,p as __namedExportsOrder,d as default};