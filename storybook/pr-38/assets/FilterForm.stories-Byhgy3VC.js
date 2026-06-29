import{j as r,r as l}from"./iframe-Ck5OBNy_.js";import{Q as d,a as f}from"./suspense-Cpimcb2Z.js";import{F as c}from"./FilterForm-2l7R8G-t.js";import{F as g}from"./rpc-story.fixtures-iO4jkB3S.js";import"./preload-helper-C4wV90-x.js";import"./useQuery-CBZtXchz.js";import"./button-xP_Jm0t5.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-D5ySMDtv.js";import"./TimeRange-BVwitJ4w.js";import"./floating-ui.react--Dqofk4r.js";import"./index-Dkbn_kvr.js";import"./index-BAA7PKOe.js";import"./Icon-BzT4mhZP.js";import"./modalStack-CJY7IwIQ.js";import"./zIndex-CigQ76av.js";import"./select-CF7B8oGv.js";import"./UiChevronDown-CirG0okf.js";import"./UiWatch-DXk9y4g8.js";import"./UiCalendar-BCkjjOtj.js";import"./UiArrowRight-CnCneouz.js";import"./UiClose-DqLdg852.js";import"./FilterPill-BG9DeJk_.js";import"./UiAdd-DbOX821o.js";import"./UiRemove-BXKLlTRF.js";import"./UiCheck-Dr2gRPmf.js";import"./types-BHfRQr8X.js";import"./UiSearch-7CnN3vu1.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
