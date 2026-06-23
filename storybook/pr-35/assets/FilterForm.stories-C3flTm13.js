import{j as r,r as l}from"./iframe-BbITQAD0.js";import{Q as d,a as f}from"./suspense-tpZvsOY-.js";import{F as c}from"./FilterForm-DkVGmF6I.js";import{F as g}from"./rpc-story.fixtures-cljx7hNu.js";import"./preload-helper-C67fKNjI.js";import"./useQuery-DcFKviWQ.js";import"./button-Tq_nwknb.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-3eAvRO6U.js";import"./TimeRange-CkEpMXp_.js";import"./floating-ui.react-CvnH8rJ_.js";import"./index-DTeCgtpZ.js";import"./index-KB5QQAds.js";import"./Icon-BV_HrUof.js";import"./modalStack-B9-B99Xv.js";import"./zIndex-CigQ76av.js";import"./select-DRRJU6MQ.js";import"./UiChevronDown-B6dH09FW.js";import"./UiWatch-B2dL1GP7.js";import"./UiCalendar-Di_gX8EH.js";import"./UiArrowRight-yOyPIjzp.js";import"./UiClose-ChsFmnC8.js";import"./FilterPill-DNkaBjCB.js";import"./UiAdd-CG6_cPco.js";import"./UiRemove-CCRnh8gM.js";import"./UiCheck-Dc-rEWul.js";import"./types-BHfRQr8X.js";import"./UiSearch-B6ZPcCcQ.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
