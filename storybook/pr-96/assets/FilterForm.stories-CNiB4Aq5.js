import{j as e,r as l}from"./iframe-DFqoVmES.js";import{Q as d}from"./queryClient-CKGRbbdd.js";import{Q as f}from"./suspense-Bk7KMvFA.js";import{F as c}from"./FilterForm-C51HZccD.js";import{F as g}from"./rpc-story.fixtures-DCH4TquI.js";import"./preload-helper-Btgbu5YQ.js";import"./useQuery-CTPWykCk.js";import"./button-CousEx7c.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-a0chOUxC.js";import"./FilterBar-BdW58AUV.js";import"./floating-ui.react-F5U4WUZ1.js";import"./index-SNQUh-rf.js";import"./index-aojGc9A7.js";import"./FilterPill-ZHEqr9b-.js";import"./Icon-C2VnWBhA.js";import"./Combobox-DOasJ9T3.js";import"./modalStack-D8oWGv-3.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-DyLthMq_.js";import"./DateTimePicker-B7P2O0KF.js";import"./MultiSelect-DhqxlvOC.js";import"./RangeSlider-CwKZMA91.js";import"./TimeRange-CiUP6QBK.js";import"./select-DLCEgKD7.js";import"./WorkloadPicker-9tlmfqwQ.js";import"./NamespacePicker-D6_hq0Rq.js";import"./index-f-QiBoYb.js";import"./formMetadata-BcBzK_NS.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
