import{j as e,r as l}from"./iframe-DAGeDdmW.js";import{Q as d}from"./queryClient-NtwOMX7T.js";import{Q as f}from"./suspense-BgUQddI1.js";import{F as c}from"./FilterForm-POe5elQQ.js";import{F as g}from"./rpc-story.fixtures-C-a5U51p.js";import"./preload-helper-CcRYDqr-.js";import"./useQuery-DPrJDEgq.js";import"./button-B7rSq3cQ.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-bJuzykOR.js";import"./FilterBar-6Q0dYKcM.js";import"./floating-ui.react-BkCnCGeJ.js";import"./index-DLrg9pPu.js";import"./index-DIhTiILn.js";import"./FilterPill-DV-iQbbS.js";import"./Icon-IzT7REGK.js";import"./Combobox-HGgQ0fO7.js";import"./modalStack-Cb0rES9i.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-D6taPS5_.js";import"./DateTimePicker-Bwg-aphn.js";import"./MultiSelect-BlqhYQ5i.js";import"./RangeSlider-BgtPntN_.js";import"./TimeRange-DDd7oDN_.js";import"./select-Bi98GQIF.js";import"./WorkloadPicker-DDYK6JQf.js";import"./NamespacePicker-DRk60EPo.js";import"./index-WFHNvFaJ.js";import"./formMetadata-BOWeUsV9.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
