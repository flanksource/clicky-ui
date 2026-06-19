import{j as r,r as l}from"./iframe-BiJjU2HO.js";import{Q as d,a as f}from"./suspense-CE1kbSpp.js";import{F as c}from"./FilterForm-Dkli9Q6H.js";import{F as g}from"./rpc-story.fixtures-BMUwWB5E.js";import"./preload-helper-2oGg8WnX.js";import"./useQuery-CWOEtHNe.js";import"./button-Bq6OtZ5-.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-ZWjVqhnr.js";import"./TimeRange-BTjpaOrP.js";import"./floating-ui.react-BtBEW8Wo.js";import"./index-Ct7BkFIG.js";import"./index-oISezv9l.js";import"./Icon-DO6qyvlM.js";import"./modalStack-CpXAXQz5.js";import"./zIndex-CigQ76av.js";import"./select-CURuYAt0.js";import"./UiChevronDown-e2uFe16b.js";import"./UiWatch-CUJ8td2M.js";import"./UiCalendar-B-73cpUU.js";import"./UiArrowRight-B1Ks5-q1.js";import"./UiClose-D1zGB7Oa.js";import"./FilterPill-DqddeDOo.js";import"./UiAdd-CJElNuxK.js";import"./UiRemove-mJbaqQH_.js";import"./UiCheck-r0P984Kc.js";import"./types-BHfRQr8X.js";import"./UiSearch-B6pKN-d6.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
