import{j as e,r as l}from"./iframe-BTxADGbc.js";import{Q as d}from"./queryClient-mH0Kj2UO.js";import{Q as f}from"./suspense-R121YCY6.js";import{F as c}from"./FilterForm-vmPSk3e6.js";import{F as g}from"./rpc-story.fixtures-BsF85teU.js";import"./preload-helper-95TtevsV.js";import"./useQuery-Do8-jH8C.js";import"./button-uOKQbD2U.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-ZXW1-FyE.js";import"./FilterBar-yYKLUgrv.js";import"./floating-ui.react-s2gbsc2n.js";import"./index-RbZdIcw5.js";import"./index-Bz5-7ute.js";import"./FilterPill-BtWteifY.js";import"./Icon-DyQmy9zD.js";import"./Combobox-C3rdbpG1.js";import"./modalStack-CBI-I8Y5.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-BJSsoZSJ.js";import"./DateTimePicker-al_sBZQx.js";import"./MultiSelect-CFdHhfPl.js";import"./RangeSlider-jqxYk1GP.js";import"./TimeRange-CLUngLZP.js";import"./select-XLvWghXg.js";import"./WorkloadPicker-QJPIrp89.js";import"./NamespacePicker-D7Kg-gcT.js";import"./index-CXdr-XwC.js";import"./formMetadata-BDZzPW2I.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
