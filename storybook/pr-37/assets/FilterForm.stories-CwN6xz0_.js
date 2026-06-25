import{j as r,r as l}from"./iframe-BZbOQtFx.js";import{Q as d,a as f}from"./suspense-D9cWIg8n.js";import{F as c}from"./FilterForm-ATf07m7O.js";import{F as g}from"./rpc-story.fixtures-MfGocfRi.js";import"./preload-helper-B2wK-Kjy.js";import"./useQuery-DWK1wCF2.js";import"./button-w4wxkRvZ.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-CHO2ZS0P.js";import"./TimeRange-mOFal-Qb.js";import"./floating-ui.react-o04l4swZ.js";import"./index-DqaOm_H7.js";import"./index-C9I8SpvD.js";import"./Icon-rviauDIl.js";import"./modalStack-DmLqMJfC.js";import"./zIndex-CigQ76av.js";import"./select-BnxjSEer.js";import"./UiChevronDown-H5W8lwGu.js";import"./UiWatch-BA-WoygE.js";import"./UiCalendar-CstoJPkC.js";import"./UiArrowRight-B20j05dv.js";import"./UiClose-LtPFrzPQ.js";import"./FilterPill-9auBVspy.js";import"./UiAdd-TnC9JzlR.js";import"./UiRemove-QYF9JrB2.js";import"./UiCheck-C1P9WR7d.js";import"./types-BHfRQr8X.js";import"./UiSearch-Y4qZ2L2s.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn()
  }
}`,...(a=(s=t.parameters)==null?void 0:s.docs)==null?void 0:a.source}}};var m,n,p;e.parameters={...e.parameters,docs:{...(m=e.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    autoSubmit: true
  }
}`,...(p=(n=e.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};const J=["Default","AutoSubmit"];export{e as AutoSubmit,t as Default,J as __namedExportsOrder,H as default};
