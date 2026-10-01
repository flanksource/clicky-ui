import{j as e,r as l}from"./iframe-CBNX-dQr.js";import{Q as d}from"./queryClient-DizekrUZ.js";import{Q as f}from"./suspense-BSd7Gt8d.js";import{F as c}from"./FilterForm-DfNHgdSx.js";import{F as g}from"./rpc-story.fixtures-DBO_KIW3.js";import"./preload-helper-DmsBQNJi.js";import"./useQuery-BqJAYGZ5.js";import"./button-66Jqw29m.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-I_MdTxAY.js";import"./FilterBar-BNP5Tns6.js";import"./floating-ui.react-DfgK1207.js";import"./index-DwHWx2SL.js";import"./index-DwW3fdnJ.js";import"./FilterPill-CC2kjuRK.js";import"./Icon-Bl13VMM_.js";import"./Combobox-ivMDoGSw.js";import"./modalStack-B758Y7Je.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-DSvZqgbd.js";import"./DateTimePicker-BFylyvG4.js";import"./MultiSelect-_MLhRryG.js";import"./RangeSlider-DONvkWfw.js";import"./TimeRange-BhjfXqGF.js";import"./select-B29bNbT8.js";import"./WorkloadPicker-ClYBbRFx.js";import"./NamespacePicker-CkucAGrR.js";import"./index-B1gmceDA.js";import"./formMetadata-CmNQDgZn.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
