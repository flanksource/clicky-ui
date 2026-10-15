import{j as e,r as l}from"./iframe-DNj_zNZU.js";import{Q as d}from"./queryClient-BlK4N60K.js";import{Q as f}from"./suspense-SFgT3Gx8.js";import{F as c}from"./FilterForm-BnDgi7e7.js";import{F as g}from"./rpc-story.fixtures-Cbdl3KLv.js";import"./preload-helper-LCYGeQwd.js";import"./useQuery-B3TknHuT.js";import"./button-l9qmO7rt.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CmRQFweU.js";import"./FilterBar-Cqk7Uv4P.js";import"./floating-ui.react-CUsd8blK.js";import"./index-C78OGtU2.js";import"./index-BaPlC8a_.js";import"./FilterPill-BCljltSy.js";import"./Icon-D173D1Xm.js";import"./filter-bar-multi-wUCtNmvd.js";import"./Combobox-BpxNrIrE.js";import"./modalStack-qck1gI8h.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-BTkFnERZ.js";import"./DateTimePicker-Xu3Kqtaq.js";import"./MultiSelect-mGO55RQY.js";import"./RangeSlider-BSWUgAY4.js";import"./TimeRange-CjsLXTSh.js";import"./select-C4MKv3sD.js";import"./WorkloadPicker-BnsVO9gp.js";import"./NamespacePicker-aUlbk4RW.js";import"./index-BC4x0cR9.js";import"./formMetadata-SG0pCc5F.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const tt={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
