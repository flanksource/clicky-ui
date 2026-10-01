import{j as e,r as l}from"./iframe-Bu8__SiW.js";import{Q as d}from"./queryClient-7tQX_ikU.js";import{Q as f}from"./suspense-BZTLFXBD.js";import{F as c}from"./FilterForm-Cj9kNzDZ.js";import{F as g}from"./rpc-story.fixtures-DH6zFw2s.js";import"./preload-helper-DxStcPpW.js";import"./useQuery-DF8Qfhcd.js";import"./button-IQY09Old.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-G9JgtjzI.js";import"./FilterBar-DQLgjp52.js";import"./floating-ui.react-Dnwi4P86.js";import"./index-BjG998sX.js";import"./index-ZA4_G-zD.js";import"./FilterPill-B_GFjO3W.js";import"./Icon-Cn9xrMzj.js";import"./Combobox-C94DycZI.js";import"./modalStack-DAEU9LH6.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-D3Yozp4q.js";import"./DateTimePicker-DZDr_Uy7.js";import"./MultiSelect-Dq18RfF4.js";import"./RangeSlider-DSzGzC4V.js";import"./TimeRange-C1h-uTUr.js";import"./select-BCnAQ7QU.js";import"./WorkloadPicker-Cd0g4vcp.js";import"./NamespacePicker-C0eMJ9qd.js";import"./index-CLaO61pG.js";import"./formMetadata-DvIcyG7l.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn()
  }
}`,...(m=(s=t.parameters)==null?void 0:s.docs)==null?void 0:m.source}}};var a,p,n;r.parameters={...r.parameters,docs:{...(a=r.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    autoSubmit: true
  }
}`,...(n=(p=r.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};const tt=["Default","AutoSubmit"];export{r as AutoSubmit,t as Default,tt as __namedExportsOrder,$ as default};
