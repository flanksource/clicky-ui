import{j as e,r as l}from"./iframe-DXCHqMT7.js";import{Q as d}from"./queryClient-Dqt5jCSI.js";import{Q as f}from"./suspense-B8X58D_n.js";import{F as c}from"./FilterForm-DZvaNKYU.js";import{F as g}from"./rpc-story.fixtures-B8cWrK77.js";import"./preload-helper-DxStcPpW.js";import"./useQuery-DURn7wfC.js";import"./button-tbjJwnTf.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CFBgJ_my.js";import"./FilterBar-C0qdRizE.js";import"./floating-ui.react-BFoHRFAR.js";import"./index-nXD4GtBn.js";import"./index-h3UUAFeB.js";import"./FilterPill-kd8dcFZz.js";import"./Icon-CzqsX9Zi.js";import"./Combobox-DftKas2V.js";import"./modalStack-ZxYyB433.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-DuOJllmE.js";import"./DateTimePicker-CaIRSwlz.js";import"./MultiSelect-HKrSw_53.js";import"./RangeSlider-B8q2faFd.js";import"./TimeRange-D0EjkUCW.js";import"./select-CUXTJRVv.js";import"./WorkloadPicker-S3aLZAFo.js";import"./NamespacePicker-DATdNae9.js";import"./index-Br80NOr9.js";import"./formMetadata-DTdBWd0z.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
