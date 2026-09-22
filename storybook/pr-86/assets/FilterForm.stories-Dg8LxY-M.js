import{j as e,r as l}from"./iframe-Ds09J1dT.js";import{Q as d}from"./queryClient-D0XdAngT.js";import{Q as f}from"./suspense-CBChakp4.js";import{F as c}from"./FilterForm-CSSjieuG.js";import{F as g}from"./rpc-story.fixtures-BeJE64ai.js";import"./preload-helper-CcRYDqr-.js";import"./useQuery-CPVsDo1k.js";import"./button-BqYgRAWV.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-qMao84VB.js";import"./FilterBar-BcZetDVh.js";import"./floating-ui.react-CgcPjn0G.js";import"./index-FPTpXdcx.js";import"./index-CF4fvYH8.js";import"./FilterPill-DgRXGxvV.js";import"./Icon-CjZb5Sv7.js";import"./Combobox-Duu-Ek4U.js";import"./modalStack-CthqJ_T7.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-CAEMgpU8.js";import"./DateTimePicker-B390JZZP.js";import"./MultiSelect-Dx1CrEXI.js";import"./RangeSlider-C0wNxNRM.js";import"./TimeRange-CRrUHGK5.js";import"./select-jpD87SnG.js";import"./WorkloadPicker-cf1urnzI.js";import"./NamespacePicker-EeYAegtK.js";import"./index-Ds33FuJz.js";import"./formMetadata-77x7zV4u.js";import"./data-table-filter-values-B85q5-NK.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
}`,...(n=(p=r.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};const $=["Default","AutoSubmit"];export{r as AutoSubmit,t as Default,$ as __namedExportsOrder,Z as default};
