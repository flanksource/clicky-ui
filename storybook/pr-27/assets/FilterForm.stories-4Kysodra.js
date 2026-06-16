import{j as r,r as l}from"./iframe-CgiBotGO.js";import{Q as d,a as f}from"./suspense-BGsmxbs2.js";import{F as c}from"./FilterForm-BRQiEdJv.js";import{F as g}from"./rpc-story.fixtures-5F2DK17S.js";import"./preload-helper-BZuLNX-z.js";import"./useQuery-25WMY6Ou.js";import"./button-rIJ5OB24.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-BR3T_nuk.js";import"./TimeRange-XR3G3pmL.js";import"./Icon-rg52Hzgd.js";import"./select-DrGf-CJB.js";import"./UiChevronDown-DJekZ8Au.js";import"./UiWatch-DI1gX6jm.js";import"./UiCalendar-8Icz-oxm.js";import"./UiArrowRight-CD_NQck7.js";import"./UiClose-DvAKF63o.js";import"./FilterPill-BIQ7n3ie.js";import"./UiAdd-esXMW-YU.js";import"./UiRemove-Dc79S_lX.js";import"./UiCheck-BcPqyTZE.js";import"./types-BHfRQr8X.js";import"./UiSearch-Cp2B0hwu.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const U={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
