import{r,j as t,ab as l,a3 as b,a4 as u}from"./iframe-BNCeWgcu.js";import{T as n}from"./TabButton-spiq8J-G.js";import"./preload-helper-bXXPlA_x.js";import"./utils-CR52uffu.js";import"./Icon-BG-3MSKK.js";const h={title:"Data/TabButton",component:n,args:{active:!0,label:"Overview",count:3,onClick:()=>{}},parameters:{docs:{description:{component:'Compact tab button with optional icon and count badge. It renders `role="tab"` and keeps selection state controlled by the parent.'}}}},e={render:()=>{const[a,o]=r.useState("tests");return t.jsxs("div",{className:"flex gap-density-1",children:[t.jsx(n,{active:a==="tests",onClick:()=>o("tests"),label:"Tests",icon:l,count:120,countColor:"bg-blue-500"}),t.jsx(n,{active:a==="lint",onClick:()=>o("lint"),label:"Lint",icon:b,count:4,countColor:"bg-yellow-500"}),t.jsx(n,{active:a==="bench",onClick:()=>o("bench"),label:"Benchmarks",icon:u})]})}};var s,c,i;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: () => {
    const [active, setActive] = useState("tests");
    return <div className="flex gap-density-1">
        <TabButton active={active === "tests"} onClick={() => setActive("tests")} label="Tests" icon={UiBeaker} count={120} countColor="bg-blue-500" />
        <TabButton active={active === "lint"} onClick={() => setActive("lint")} label="Lint" icon={UiWarningCircle} count={4} countColor="bg-yellow-500" />
        <TabButton active={active === "bench"} onClick={() => setActive("bench")} label="Benchmarks" icon={UiGraph} />
      </div>;
  }
}`,...(i=(c=e.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};const k=["TabsWithCounts"];export{e as TabsWithCounts,k as __namedExportsOrder,h as default};
