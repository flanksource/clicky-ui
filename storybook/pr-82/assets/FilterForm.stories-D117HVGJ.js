import{j as e,r as l}from"./iframe-ODiXRaeD.js";import{Q as d}from"./queryClient-6YFIuJXN.js";import{Q as f}from"./suspense-DZo8rYoC.js";import{F as c}from"./FilterForm-BHsLVt18.js";import{F as g}from"./rpc-story.fixtures-BERb9Xbj.js";import"./preload-helper-DUVrmzNZ.js";import"./useQuery-Cz6IKwBd.js";import"./button-vfp9rbvl.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BGUot--s.js";import"./FilterBar-BWfbRqTp.js";import"./floating-ui.react-DXashjmJ.js";import"./index-DoPuVbTh.js";import"./index-DUxqcZ0I.js";import"./FilterPill-DCe4YYsD.js";import"./Icon-CulP8OOJ.js";import"./Combobox-bl4stDBW.js";import"./modalStack-CqgS2p7j.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-LKsOOO6Y.js";import"./DateTimePicker-fMg4dziS.js";import"./MultiSelect-Dqzi9BW_.js";import"./RangeSlider-BumHhnr7.js";import"./TimeRange-Ds4BKog5.js";import"./select-DyHJLQMz.js";import"./WorkloadPicker-BCAeYQLA.js";import"./NamespacePicker-Bexcruy9.js";import"./index-7xTk_PNV.js";import"./formMetadata-C8mAb-87.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
