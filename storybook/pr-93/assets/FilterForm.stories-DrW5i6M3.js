import{j as e,r as l}from"./iframe-DuizKdUp.js";import{Q as d}from"./queryClient-H33qPlL2.js";import{Q as f}from"./suspense-DD_FByqE.js";import{F as c}from"./FilterForm-DR151zEV.js";import{F as g}from"./rpc-story.fixtures-DznQfhiG.js";import"./preload-helper-DmsBQNJi.js";import"./useQuery-DDx2G0cE.js";import"./button-EYN6PCXm.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-C8ciqA58.js";import"./FilterBar-Dq8bM008.js";import"./floating-ui.react-BJgrq0bL.js";import"./index-CWqaA8lc.js";import"./index-I9h17460.js";import"./FilterPill-zpYFv9g6.js";import"./Icon-B5qN7-mW.js";import"./Combobox-B_sNXcFv.js";import"./modalStack-CICKsGRF.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-DntpEIq8.js";import"./DateTimePicker-Dk93s1OM.js";import"./MultiSelect-CNmQbm4f.js";import"./RangeSlider-90JJ9Ykc.js";import"./TimeRange-CW0wp00K.js";import"./select-ZjgKcU-R.js";import"./WorkloadPicker-VWRr1sA4.js";import"./NamespacePicker-BHcTPBss.js";import"./index-D7c_i4BZ.js";import"./formMetadata-BaMULHcu.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
