import{j as e,r as l}from"./iframe-DzQtIbNE.js";import{Q as d}from"./queryClient-DkhuAh8I.js";import{Q as f}from"./suspense-ZzCCY4xd.js";import{F as c}from"./FilterForm-Ck1bcaRn.js";import{F as g}from"./rpc-story.fixtures-BmzMn7JR.js";import"./preload-helper-BCNcasCO.js";import"./useQuery-DC_XHA8r.js";import"./button-BtjJwS_P.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CMaS212t.js";import"./FilterBar-Bz0gxTiA.js";import"./floating-ui.react-BiyoKmlr.js";import"./index-BqViEYwi.js";import"./index-CxOWF1GZ.js";import"./FilterPill-OKDi7TqT.js";import"./Icon-D3avtD1A.js";import"./Combobox-DnmK8yIe.js";import"./modalStack-CV8pkEDx.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-BvPI2Llq.js";import"./DateTimePicker-B0B7J2o-.js";import"./MultiSelect-ERMV7t7Y.js";import"./RangeSlider-BZ-7aHri.js";import"./TimeRange-De2mzwCs.js";import"./select-CKipRPgT.js";import"./WorkloadPicker-BNqXsBgH.js";import"./NamespacePicker-B-EVUmLL.js";import"./index-JHlX3ULY.js";import"./formMetadata-zB71tr1l.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
