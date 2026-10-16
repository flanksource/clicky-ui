import{j as e,r as l}from"./iframe-bSdY4VSM.js";import{Q as d}from"./queryClient-BKmMGTFQ.js";import{Q as f}from"./suspense-CBcPC1aY.js";import{F as c}from"./FilterForm-BsMlYQxX.js";import{F as g}from"./rpc-story.fixtures-Dh5yMOAa.js";import"./preload-helper-BBRSUrHX.js";import"./useQuery-GQB-e-Ic.js";import"./button-Cxa_VEHI.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-DatIFuv1.js";import"./FilterBar-CLDtmKI0.js";import"./floating-ui.react-BVimmY-p.js";import"./index-qiGgzLbL.js";import"./index-C1RppemT.js";import"./FilterPill-BcIZlN36.js";import"./Icon-a8_JJTRy.js";import"./filter-bar-multi-uGRcbfGS.js";import"./Combobox-B2s9FN2-.js";import"./modalStack-BcOP8sXO.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-j0TiIO3T.js";import"./DateTimePicker-BbaRDASk.js";import"./MultiSelect-BjbqR_PC.js";import"./RangeSlider-B6Z_Mmj_.js";import"./TimeRange-DSRiiLnj.js";import"./select-BSuI-P7O.js";import"./WorkloadPicker-Dt88fymP.js";import"./NamespacePicker-CZPwmVmx.js";import"./index-B028GE4s.js";import"./formMetadata-BCyssbsw.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const tt={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
