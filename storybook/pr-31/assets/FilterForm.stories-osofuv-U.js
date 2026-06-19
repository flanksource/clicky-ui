import{j as r,r as l}from"./iframe-CCq80owj.js";import{Q as d,a as f}from"./suspense-BFxanCl4.js";import{F as c}from"./FilterForm-BTUledj3.js";import{F as g}from"./rpc-story.fixtures-BccuCruS.js";import"./preload-helper-ByUaG9M2.js";import"./useQuery-Dm_Yl0h3.js";import"./button-CRz4am1-.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-NPQ1cFHI.js";import"./TimeRange-T1kTRCiz.js";import"./floating-ui.react-B-mN0D-Z.js";import"./index-nIbAMNhx.js";import"./index-DW2b6Sux.js";import"./Icon-Cl3hQAjl.js";import"./modalStack-BctA1mPW.js";import"./zIndex-CigQ76av.js";import"./select-535YrmmH.js";import"./UiChevronDown-_xEbLx9w.js";import"./UiWatch-C6MxFZfU.js";import"./UiCalendar-DVXW9hia.js";import"./UiArrowRight-BHIOcfZr.js";import"./UiClose-CEfh_13W.js";import"./FilterPill-DbTcVJys.js";import"./UiAdd-CYeJCNQ2.js";import"./UiRemove-DnGwV74F.js";import"./UiCheck-CzE9SQC0.js";import"./types-BHfRQr8X.js";import"./UiSearch-iKyCJb1U.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
