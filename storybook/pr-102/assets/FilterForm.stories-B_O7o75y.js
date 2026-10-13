import{j as e,r as l}from"./iframe-BItsxAjD.js";import{Q as d}from"./queryClient-Cym4Rb27.js";import{Q as f}from"./suspense-DFBOv1sW.js";import{F as c}from"./FilterForm-Cq_KAX_5.js";import{F as g}from"./rpc-story.fixtures-CfYy7yef.js";import"./preload-helper-BZq7nIkI.js";import"./useQuery-rGcR8PSI.js";import"./button-25dF40vQ.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BOeFbzh-.js";import"./FilterBar-B8SLkawx.js";import"./floating-ui.react-CNVnZXsN.js";import"./index-DVxbQ3kE.js";import"./index-CRQMcvkA.js";import"./FilterPill-DOPLjimn.js";import"./Icon-Dq8eEpLP.js";import"./filter-bar-multi-DKn2MepO.js";import"./Combobox-D5npeKNx.js";import"./modalStack-D_ClFrlM.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-D259elha.js";import"./DateTimePicker-DCNe0ZvV.js";import"./MultiSelect-23Lsfwm4.js";import"./RangeSlider-CUZZBmKD.js";import"./TimeRange-xAnMQgDf.js";import"./select-BNBwrLsc.js";import"./WorkloadPicker-C-TBIGI3.js";import"./NamespacePicker-D5-oB4gu.js";import"./index-JQhHWXK7.js";import"./formMetadata-DZJdePT_.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const tt={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
}`,...(n=(p=r.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};const rt=["Default","AutoSubmit"];export{r as AutoSubmit,t as Default,rt as __namedExportsOrder,tt as default};
