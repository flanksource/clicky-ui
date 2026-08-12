import{j as r,r as l}from"./iframe-Cr-FkDEs.js";import{Q as d}from"./queryClient-CO3Sniy5.js";import{Q as f}from"./suspense-oavUJO1E.js";import{F as c}from"./FilterForm-D-bbAVCY.js";import{F as g}from"./rpc-story.fixtures-wzdlwWAk.js";import"./preload-helper-Bz0j3TbD.js";import"./useQuery-D0Kp4SmY.js";import"./button-BIMW_edl.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-CKGAX9p1.js";import"./TimeRange-4864UDs-.js";import"./floating-ui.react-D2O3t5CC.js";import"./index-CZGmL05H.js";import"./index-DE_cDvZT.js";import"./Icon-D4-4O73G.js";import"./modalStack-CxrbjVR6.js";import"./zIndex-BGbNBNA8.js";import"./select-D6Nf1EHd.js";import"./FilterPill-mf-mv3ck.js";import"./formMetadata-BxuziiM3.js";import"./data-table-filter-values-DUyokwAE.js";import"./types-BHfRQr8X.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const B={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
