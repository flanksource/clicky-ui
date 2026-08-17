import{j as r,r as l}from"./iframe-BOqGPkjA.js";import{Q as d}from"./queryClient-B1MiNYUL.js";import{Q as f}from"./suspense-CinY47uC.js";import{F as c}from"./FilterForm-JeoR5Lql.js";import{F as g}from"./rpc-story.fixtures-DJtxED-v.js";import"./preload-helper-BHaa9cja.js";import"./useQuery-_geVgqFs.js";import"./button-o3q0Bgz-.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-CuZVbQUO.js";import"./TimeRange-DXbk3lMx.js";import"./floating-ui.react-D9PnPcwb.js";import"./index-4azl-_NY.js";import"./index-B9J3eB3Z.js";import"./Icon-DmMP-gqZ.js";import"./modalStack-Cy5N7MXo.js";import"./zIndex-BGbNBNA8.js";import"./select-DB_eefDo.js";import"./FilterPill-BSzTJgOd.js";import"./formMetadata-GFKmkflX.js";import"./data-table-filter-values-DUyokwAE.js";import"./types-BHfRQr8X.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const B={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn()
  }
}`,...(a=(s=e.parameters)==null?void 0:s.docs)==null?void 0:a.source}}};var m,n,p;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    autoSubmit: true
  }
}`,...(p=(n=t.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};const U=["Default","AutoSubmit"];export{t as AutoSubmit,e as Default,U as __namedExportsOrder,B as default};
