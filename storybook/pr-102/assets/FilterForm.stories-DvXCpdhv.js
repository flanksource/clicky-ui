import{j as e,r as l}from"./iframe-CcPM-cPW.js";import{Q as d}from"./queryClient-DJf7qxGH.js";import{Q as f}from"./suspense-jk_myeOr.js";import{F as c}from"./FilterForm-xsUOcw9Y.js";import{F as g}from"./rpc-story.fixtures-Coe2RX_c.js";import"./preload-helper-BZq7nIkI.js";import"./useQuery-DPUdJ1iR.js";import"./button-DdaTwSNy.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-pjmE4eTk.js";import"./FilterBar-ghwHc7D0.js";import"./floating-ui.react-GwnkJcwj.js";import"./index-xfq7uwHx.js";import"./index-BVhCjt6c.js";import"./FilterPill-D8pQ_BuF.js";import"./Icon-D84fH81s.js";import"./filter-bar-multi-CvK92PIL.js";import"./Combobox-C_e4HsYa.js";import"./modalStack-C4aKQWQ1.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-DrkQQzUz.js";import"./DateTimePicker-BMsoOg_C.js";import"./MultiSelect-LzxeXiya.js";import"./RangeSlider-CpPYdDgK.js";import"./TimeRange-B6CsjMiq.js";import"./select-BnIy5PYa.js";import"./WorkloadPicker-BVtLwdzA.js";import"./NamespacePicker-A0D_Lg32.js";import"./index-BBGaLmv4.js";import"./formMetadata-Co5NnZOZ.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const tt={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
