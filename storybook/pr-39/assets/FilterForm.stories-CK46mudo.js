import{j as r,r as l}from"./iframe-C96xZIdp.js";import{Q as d,a as f}from"./suspense-B-vOHugz.js";import{F as c}from"./FilterForm-I4CDQyTt.js";import{F as g}from"./rpc-story.fixtures-S62gZnA8.js";import"./preload-helper-Bg6xcDEu.js";import"./useQuery-Cq4XkiUA.js";import"./button-CQ2Ni0n1.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-2G2O_q61.js";import"./TimeRange-DrLpWg9p.js";import"./floating-ui.react-CKpawvp6.js";import"./index-Dpw8D6A4.js";import"./index-DiVyEuZt.js";import"./Icon-DVJMtl2F.js";import"./modalStack-DCQR24ar.js";import"./zIndex-CigQ76av.js";import"./select-CTCjKWyJ.js";import"./UiChevronDown-C4iQdycK.js";import"./UiWatch-fRmiXjE0.js";import"./UiCalendar-CIg23P-h.js";import"./UiArrowRight-B7VvmpXD.js";import"./UiClose-BGwIaMb7.js";import"./FilterPill-DIeK5K75.js";import"./UiAdd-C83DU42e.js";import"./UiRemove-BuRvyt0f.js";import"./UiCheck-CIVB-pM_.js";import"./types-BHfRQr8X.js";import"./UiSearch-BZaaHyu5.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
