import{j as e,r as l}from"./iframe-Dxfrw1Ky.js";import{Q as d}from"./queryClient-CPpX_vd7.js";import{Q as f}from"./suspense-D1Bcd_NK.js";import{F as c}from"./FilterForm-CAN1dgDl.js";import{F as g}from"./rpc-story.fixtures-CQMnOQkP.js";import"./preload-helper-BBRSUrHX.js";import"./useQuery-nhd9EeT_.js";import"./button-Cd-gFBA2.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-DdWtU95m.js";import"./FilterBar-CRB8Fu3i.js";import"./floating-ui.react-CnFTnPO5.js";import"./index-Di5WmKv6.js";import"./index-OnsKW3gm.js";import"./FilterPill-DPJ4_JlW.js";import"./Icon-uVU5xHJk.js";import"./filter-bar-multi-B5teDMbU.js";import"./Combobox-CkPoK2Rk.js";import"./modalStack-DQoL9jC8.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-D6Y2Y0Td.js";import"./DateTimePicker-Do5gRvQn.js";import"./MultiSelect-UaYFpP5m.js";import"./RangeSlider-DswKR2c-.js";import"./TimeRange-DViFc0-X.js";import"./select-C8OQW2cZ.js";import"./WorkloadPicker-BMOl_vHV.js";import"./NamespacePicker-Bacf9vZs.js";import"./index-BUwwOD0W.js";import"./formMetadata-BdgDHWr9.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const tt={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
