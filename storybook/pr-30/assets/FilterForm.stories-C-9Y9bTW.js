import{j as r,r as l}from"./iframe-DIPFVygJ.js";import{Q as d,a as f}from"./suspense-CAsMkeYs.js";import{F as c}from"./FilterForm-C2EjpMRL.js";import{F as g}from"./rpc-story.fixtures-Bh-7uhmQ.js";import"./preload-helper-D5l2DbWZ.js";import"./useQuery-Bboh0Hbj.js";import"./button-CQO1VsE8.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-CYQBqqDz.js";import"./TimeRange-nAOpuAQr.js";import"./Icon-GGxX1w_8.js";import"./select-DiUcr-h_.js";import"./UiChevronDown-DNTWC3NQ.js";import"./UiWatch-HDuuS_ia.js";import"./UiCalendar-DcjHnRWA.js";import"./UiArrowRight-D7MpGI-k.js";import"./UiClose-yIapmBvP.js";import"./FilterPill-XrT7Ydbt.js";import"./UiAdd-D18obnW5.js";import"./UiRemove-D53CleaQ.js";import"./UiCheck-b4szA2d9.js";import"./types-BHfRQr8X.js";import"./UiSearch-BpaOP-yN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const U={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
