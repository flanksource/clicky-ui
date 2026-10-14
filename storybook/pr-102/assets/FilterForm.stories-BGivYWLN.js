import{j as e,r as l}from"./iframe-4S_rqkhx.js";import{Q as d}from"./queryClient-Cfutf4sP.js";import{Q as f}from"./suspense-BZhIoav8.js";import{F as c}from"./FilterForm-DdAE_kcR.js";import{F as g}from"./rpc-story.fixtures-DkBPajDb.js";import"./preload-helper-BZq7nIkI.js";import"./useQuery-trViol_f.js";import"./button-BpUyE0O_.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-1HgYxxJ4.js";import"./FilterBar-Dp77h1kI.js";import"./floating-ui.react-OaSgb022.js";import"./index-Cvd_Abow.js";import"./index-BMI4_Cei.js";import"./FilterPill-DIfiwld4.js";import"./Icon-D5QCb7Dz.js";import"./filter-bar-multi-5qNdCbbr.js";import"./Combobox-B0ZmjhD8.js";import"./modalStack-C75NiPFe.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-D6s3gqO4.js";import"./DateTimePicker-DN47MwkR.js";import"./MultiSelect-49R8ZV-3.js";import"./RangeSlider-DlTQImZt.js";import"./TimeRange-m0Eg84ef.js";import"./select-D1G4I_RS.js";import"./WorkloadPicker-BLB9-4rF.js";import"./NamespacePicker-DxTH5Z-F.js";import"./index-CbBMnxt9.js";import"./formMetadata-DafXBGkO.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const tt={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
