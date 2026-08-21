import{j as r,r as l}from"./iframe-scM6jv7l.js";import{Q as d}from"./queryClient-MxvyLHUF.js";import{Q as f}from"./suspense-BUcFuxZk.js";import{F as c}from"./FilterForm-j03csS8B.js";import{F as g}from"./rpc-story.fixtures-03KAJIAo.js";import"./preload-helper-BZ6gUoWu.js";import"./useQuery-B8xT-nNw.js";import"./button-DaoW-x1g.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CoSFZPt_.js";import"./Combobox-CoXsdk2a.js";import"./Icon-D1Qa4F67.js";import"./modalStack-Brf0cgOc.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-CvQmW-YX.js";import"./index-Dg88cS0S.js";import"./index-BHYuFw_a.js";import"./TimeRange-Z1HTj6vd.js";import"./floating-ui.react-CtGrG4Ss.js";import"./select-sc2EPqZV.js";import"./formMetadata-DHWWC6Lw.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const U={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
}`,...(p=(n=t.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};const W=["Default","AutoSubmit"];export{t as AutoSubmit,e as Default,W as __namedExportsOrder,U as default};
