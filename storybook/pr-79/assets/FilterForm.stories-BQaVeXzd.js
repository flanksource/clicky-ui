import{j as e,r as l}from"./iframe-lrV_tcxP.js";import{Q as d}from"./queryClient-DvJYHpqL.js";import{Q as f}from"./suspense-DSn5RAak.js";import{F as c}from"./FilterForm-BBciUVuu.js";import{F as g}from"./rpc-story.fixtures-BrooiI_T.js";import"./preload-helper-C6Lb07j8.js";import"./useQuery-B56W-NMP.js";import"./button-BU3MdbYZ.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CtyMrwzj.js";import"./FilterBar-yqHcWIlk.js";import"./floating-ui.react-BjmYh6Tq.js";import"./index-BxMM_6lR.js";import"./index-7ZhegYQ4.js";import"./FilterPill-T1PjefyC.js";import"./Icon-CgtLhDD0.js";import"./Combobox-BpVdXaBr.js";import"./modalStack-CuObymKB.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./Modal-d3Ocuae-.js";import"./DateTimePicker-CNJQ5rSJ.js";import"./MultiSelect-YZf0uY0Q.js";import"./RangeSlider-C6iEQFcv.js";import"./TimeRange-BVDWHMkE.js";import"./select-D4Pxas8v.js";import"./WorkloadPicker-D-qW2wFt.js";import"./NamespacePicker-c6inuzP6.js";import"./index-C-iBM5hH.js";import"./formMetadata-yKgzwTex.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
