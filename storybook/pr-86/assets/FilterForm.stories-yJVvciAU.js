import{j as e,r as l}from"./iframe-DyL4RmGG.js";import{Q as d}from"./queryClient-Xt9RVV6X.js";import{Q as f}from"./suspense-jN3_x6dp.js";import{F as c}from"./FilterForm-Ddj2N-Do.js";import{F as g}from"./rpc-story.fixtures-JPf8WlwB.js";import"./preload-helper-CcRYDqr-.js";import"./useQuery-CCeNnrIr.js";import"./button-BTOItCTV.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BIPMexql.js";import"./FilterBar-D3TyIYlq.js";import"./floating-ui.react-D_VnvmSA.js";import"./index-MomY5yw3.js";import"./index-BKFNVha0.js";import"./FilterPill-Dc-XIIV5.js";import"./Icon-COVZwsWL.js";import"./Combobox-BG0Xf9lH.js";import"./modalStack-CzjsIGEp.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-D7h-gNLF.js";import"./DateTimePicker-BYL8bwfW.js";import"./MultiSelect-DUX4HHkw.js";import"./RangeSlider-CmrMRIzO.js";import"./TimeRange-DiFGKwdF.js";import"./select-Ccdp56zq.js";import"./WorkloadPicker-RqDiaXWc.js";import"./NamespacePicker-DSdKRtWc.js";import"./index-CZuWoAov.js";import"./formMetadata-CR-9BXXl.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
