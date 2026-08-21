import{j as r,r as l}from"./iframe-YETa_cG9.js";import{Q as d}from"./queryClient-C-UZ77Bi.js";import{Q as f}from"./suspense-HtsdzYnW.js";import{F as c}from"./FilterForm-BjJqxJtW.js";import{F as g}from"./rpc-story.fixtures-RmLus4H2.js";import"./preload-helper-BF_8wlrL.js";import"./useQuery-Bv_r98TO.js";import"./button-wvsJ1tMU.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BAKLzrcW.js";import"./Combobox-DwypI7by.js";import"./Icon-Ca6PCkd-.js";import"./modalStack-Dm7Q2W0x.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-BHlDdZuO.js";import"./index-OzyaF4V_.js";import"./index-CseixOkg.js";import"./TimeRange-DByITHG7.js";import"./floating-ui.react-5Xu4xio0.js";import"./select-XRAQCHRk.js";import"./formMetadata-1MuakVl7.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const U={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
