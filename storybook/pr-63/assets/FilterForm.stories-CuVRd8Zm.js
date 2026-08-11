import{j as r,r as l}from"./iframe-CxzpxXnf.js";import{Q as d}from"./queryClient-BrKFu1tL.js";import{Q as f}from"./suspense-CalEbgp-.js";import{F as c}from"./FilterForm-BH1u_02Y.js";import{F as g}from"./rpc-story.fixtures-D0BGTng8.js";import"./preload-helper-Bz0j3TbD.js";import"./useQuery-BlW5tbIw.js";import"./button-Dv1c-HWl.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-BWXL-EJN.js";import"./TimeRange-BGyoGrKO.js";import"./floating-ui.react-DYQK7KlJ.js";import"./index-znxQrsYw.js";import"./index-BE6eQQjG.js";import"./Icon-G_P9Ael4.js";import"./modalStack-C0ppkTLD.js";import"./zIndex-BGbNBNA8.js";import"./select-D2hBC6sn.js";import"./FilterPill-CAf8OcYI.js";import"./formMetadata-C_zoVUF9.js";import"./data-table-filter-values-DUyokwAE.js";import"./types-BHfRQr8X.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const B={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
