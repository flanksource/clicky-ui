import{j as e,r as l}from"./iframe-Cxdv9pi7.js";import{Q as d}from"./queryClient-BvfX_gQa.js";import{Q as f}from"./suspense-BBKIdfHr.js";import{F as c}from"./FilterForm-BjGff0cy.js";import{F as g}from"./rpc-story.fixtures-DeRznb4D.js";import"./preload-helper-DU1Q6aPJ.js";import"./useQuery-B2XDA36M.js";import"./button-CDUpBuy9.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BfmDh766.js";import"./FilterBar-Cvmpirj_.js";import"./floating-ui.react-mjp4aH0C.js";import"./index-BRY3IRA4.js";import"./index-CkkiTvvU.js";import"./FilterPill-4MdiEeIE.js";import"./Icon-TQmWXc2S.js";import"./Combobox-B0h9NCBj.js";import"./modalStack-C_WhG_d9.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-Kx8XoI2v.js";import"./DateTimePicker-BPSia-hN.js";import"./MultiSelect-CFMQ6ZtD.js";import"./RangeSlider-CVjotkm5.js";import"./TimeRange-CWALHETR.js";import"./select-DKBCBXRK.js";import"./WorkloadPicker-DC8WWEPi.js";import"./NamespacePicker-C_VymA-J.js";import"./index-BqC3x6pn.js";import"./formMetadata-D_gFXAbi.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
