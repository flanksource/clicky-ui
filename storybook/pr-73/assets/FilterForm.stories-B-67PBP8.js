import{j as e,r as l}from"./iframe-z_87u_i8.js";import{Q as d}from"./queryClient-Dy0p3Dqe.js";import{Q as f}from"./suspense-nTUcgQsj.js";import{F as c}from"./FilterForm-C8HmHISV.js";import{F as g}from"./rpc-story.fixtures-CJFJatTa.js";import"./preload-helper-CF8-vpnN.js";import"./useQuery-BHcAtdka.js";import"./button-CJTNZJ-T.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-Cm1g_EBX.js";import"./FilterBar-Di2LT9C1.js";import"./floating-ui.react-BejTFmOT.js";import"./index-ChBxwgT3.js";import"./index-DRRKWcil.js";import"./FilterPill-LwJBfj_W.js";import"./Icon-C9ocM_xh.js";import"./Combobox-DK8e0no7.js";import"./modalStack-CP4qI3Kt.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./Modal-BeIIxoJI.js";import"./DateTimePicker-DFCCVSCP.js";import"./MultiSelect-BrbcD_4O.js";import"./RangeSlider-DRSUXfC0.js";import"./TimeRange-uYzq3TS1.js";import"./select-9ddVKvGE.js";import"./WorkloadPicker-BYFLOH5c.js";import"./NamespacePicker-BBREDp39.js";import"./index-BohWVV1E.js";import"./formMetadata-Dx9LZ1KN.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
