import{r,j as t,ad as l,a5 as u,a6 as b}from"./iframe-BDLF7TO0.js";import{T as n}from"./TabButton-yn2Op9UL.js";import"./preload-helper-BF_8wlrL.js";import"./utils-DW-IJACk.js";import"./Icon-BDal7uxE.js";const h={title:"Data/TabButton",component:n,args:{active:!0,label:"Overview",count:3,onClick:()=>{}},parameters:{docs:{description:{component:'Compact tab button with optional icon and count badge. It renders `role="tab"` and keeps selection state controlled by the parent.'}}}},e={render:()=>{const[a,o]=r.useState("tests");return t.jsxs("div",{className:"flex gap-density-1",children:[t.jsx(n,{active:a==="tests",onClick:()=>o("tests"),label:"Tests",icon:l,count:120,countColor:"bg-blue-500"}),t.jsx(n,{active:a==="lint",onClick:()=>o("lint"),label:"Lint",icon:u,count:4,countColor:"bg-yellow-500"}),t.jsx(n,{active:a==="bench",onClick:()=>o("bench"),label:"Benchmarks",icon:b})]})}};var s,c,i;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: () => {
    const [active, setActive] = useState("tests");
    return <div className="flex gap-density-1">
        <TabButton active={active === "tests"} onClick={() => setActive("tests")} label="Tests" icon={UiBeaker} count={120} countColor="bg-blue-500" />
        <TabButton active={active === "lint"} onClick={() => setActive("lint")} label="Lint" icon={UiWarningCircle} count={4} countColor="bg-yellow-500" />
        <TabButton active={active === "bench"} onClick={() => setActive("bench")} label="Benchmarks" icon={UiGraph} />
      </div>;
  }
}`,...(i=(c=e.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};const k=["TabsWithCounts"];export{e as TabsWithCounts,k as __namedExportsOrder,h as default};
