import{j as e,r as l}from"./iframe-3q0eS6ZH.js";import{Q as d}from"./queryClient-V_iBFRyl.js";import{Q as f}from"./suspense-CZp-v64C.js";import{F as c}from"./FilterForm-bDi7oZpi.js";import{F as g}from"./rpc-story.fixtures-Dx5fUbe9.js";import"./preload-helper-CcRYDqr-.js";import"./useQuery-DEgDy4BK.js";import"./button-DHxo9U3A.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-gEVgRnUM.js";import"./FilterBar-r2C4EPnh.js";import"./floating-ui.react-CG8cv30D.js";import"./index-Egog0RqP.js";import"./index-CiPsLEp7.js";import"./FilterPill-Buz30ZM7.js";import"./Icon-CT7GZEqx.js";import"./Combobox-Drlj6fxl.js";import"./modalStack-CW-tpCu1.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-COLLltVY.js";import"./DateTimePicker-CBjgGBDE.js";import"./MultiSelect-BFnXCmPi.js";import"./RangeSlider-jgvL7cG5.js";import"./TimeRange-BlYgpnwQ.js";import"./select-FPmIGvxj.js";import"./WorkloadPicker-j1YhB5_z.js";import"./NamespacePicker-DNi2hhrW.js";import"./index-21HwTrJv.js";import"./formMetadata-SHp1Fk98.js";import"./data-table-filter-values-CSqhQ9CN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
