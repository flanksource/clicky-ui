import{j as e,r as l}from"./iframe-DfHdXEmJ.js";import{Q as d}from"./queryClient-yociQLVn.js";import{Q as f}from"./suspense-6Rof5HGQ.js";import{F as c}from"./FilterForm-5O2IM910.js";import{F as g}from"./rpc-story.fixtures-CuqPkN-M.js";import"./preload-helper-CGPPAlEp.js";import"./useQuery-DKNhdFnK.js";import"./button-C-BhJjDF.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-tTKTeWsM.js";import"./FilterBar-DOD-6frZ.js";import"./floating-ui.react-2Kyn_0pS.js";import"./index-E_kflO6L.js";import"./index-BA0XQxfj.js";import"./FilterPill-DXILgODl.js";import"./Icon-B-z_boLM.js";import"./Combobox-BmWRDzCm.js";import"./modalStack-D7AkghjI.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-DNcElLvB.js";import"./DateTimePicker-BmufCekC.js";import"./MultiSelect-DtOt2ra3.js";import"./RangeSlider-BpUSUXyK.js";import"./TimeRange-d7kWq6Sx.js";import"./select-B03fjWLK.js";import"./WorkloadPicker-C4qsN9Rw.js";import"./NamespacePicker-CjIX1Vm-.js";import"./index-OZHjcUKL.js";import"./formMetadata-BaBKXxWN.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
