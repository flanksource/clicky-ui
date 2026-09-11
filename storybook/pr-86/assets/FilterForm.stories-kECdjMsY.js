import{j as e,r as l}from"./iframe-CFT3PPR7.js";import{Q as d}from"./queryClient-B3Ufww9f.js";import{Q as f}from"./suspense-CMYBzrC5.js";import{F as c}from"./FilterForm-DWYWKSPO.js";import{F as g}from"./rpc-story.fixtures-W5MCeKfG.js";import"./preload-helper-CcRYDqr-.js";import"./useQuery-DW63Njhy.js";import"./button-DVB_uS1L.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CZrrBIDI.js";import"./FilterBar-CW1EPL40.js";import"./floating-ui.react-BIMNxrra.js";import"./index-2WZ1FKdz.js";import"./index-Cuo_DFmu.js";import"./FilterPill-aZ9lMIbE.js";import"./Icon-BtbnjFB3.js";import"./Combobox-JcCkqfEl.js";import"./modalStack-CgLVCW7W.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-q-Oedu08.js";import"./DateTimePicker-BvZoFhZz.js";import"./MultiSelect-BA9DLaOZ.js";import"./RangeSlider-BAKm_4gN.js";import"./TimeRange-B1lx3b3C.js";import"./select-fgB8vsMD.js";import"./WorkloadPicker-4yZgarkk.js";import"./NamespacePicker-BHwStTgj.js";import"./index-U8fu4Fjz.js";import"./formMetadata-i8BfuHGp.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
