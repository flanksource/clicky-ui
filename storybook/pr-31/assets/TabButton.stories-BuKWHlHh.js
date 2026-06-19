import{r,j as t}from"./iframe-CmW1bXIL.js";import{T as o}from"./TabButton--YfF_f91.js";import{U as l}from"./UiBeaker-DWjQbsxl.js";import{U as u}from"./UiWarningCircle-CkhtVQx2.js";import{U as b}from"./UiGraph-CkIg1HxX.js";import"./preload-helper-ByUaG9M2.js";import"./utils-BLSKlp9E.js";import"./Icon-DgKWNfUH.js";const x={title:"Data/TabButton",component:o,args:{active:!0,label:"Overview",count:3,onClick:()=>{}},parameters:{docs:{description:{component:'Compact tab button with optional icon and count badge. It renders `role="tab"` and keeps selection state controlled by the parent.'}}}},e={render:()=>{const[n,a]=r.useState("tests");return t.jsxs("div",{className:"flex gap-density-1",children:[t.jsx(o,{active:n==="tests",onClick:()=>a("tests"),label:"Tests",icon:l,count:120,countColor:"bg-blue-500"}),t.jsx(o,{active:n==="lint",onClick:()=>a("lint"),label:"Lint",icon:u,count:4,countColor:"bg-yellow-500"}),t.jsx(o,{active:n==="bench",onClick:()=>a("bench"),label:"Benchmarks",icon:b})]})}};var i,s,c;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => {
    const [active, setActive] = useState("tests");
    return <div className="flex gap-density-1">
        <TabButton active={active === "tests"} onClick={() => setActive("tests")} label="Tests" icon={UiBeaker} count={120} countColor="bg-blue-500" />
        <TabButton active={active === "lint"} onClick={() => setActive("lint")} label="Lint" icon={UiWarningCircle} count={4} countColor="bg-yellow-500" />
        <TabButton active={active === "bench"} onClick={() => setActive("bench")} label="Benchmarks" icon={UiGraph} />
      </div>;
  }
}`,...(c=(s=e.parameters)==null?void 0:s.docs)==null?void 0:c.source}}};const T=["TabsWithCounts"];export{e as TabsWithCounts,T as __namedExportsOrder,x as default};
