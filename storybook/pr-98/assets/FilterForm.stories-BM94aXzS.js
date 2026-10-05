import{j as e,r as l}from"./iframe-CRAMrqdr.js";import{Q as d}from"./queryClient-BzIqeiR8.js";import{Q as f}from"./suspense-LpSg7tjn.js";import{F as c}from"./FilterForm-C3ljG9Dx.js";import{F as g}from"./rpc-story.fixtures-C7z6A7K8.js";import"./preload-helper-BpddQVpQ.js";import"./useQuery-CbHTW0oz.js";import"./button-DMzgHLRl.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-C6pXG8vv.js";import"./FilterBar-CN4V-jPS.js";import"./floating-ui.react-CfpWOLb9.js";import"./index-OBWOC1jm.js";import"./index-Dhhf_61s.js";import"./FilterPill-D2dqjYSS.js";import"./Icon-BMbq9_zN.js";import"./Combobox-BlOvR2S7.js";import"./modalStack-CwY5BXIM.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-oPG10GDr.js";import"./DateTimePicker-Qn5q0z3i.js";import"./MultiSelect-Djvz-tMb.js";import"./RangeSlider-NDy24q6w.js";import"./TimeRange-BQ0MqSd7.js";import"./select-VRx-e_Ni.js";import"./WorkloadPicker-DiWxfrCb.js";import"./NamespacePicker-Dow2X7GM.js";import"./formMetadata-CppcBPv0.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
