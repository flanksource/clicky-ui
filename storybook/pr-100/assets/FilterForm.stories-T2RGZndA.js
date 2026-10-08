import{j as e,r as l}from"./iframe-DiGWdYeS.js";import{Q as d}from"./queryClient-B9_uv8vX.js";import{Q as f}from"./suspense-D-800eSR.js";import{F as c}from"./FilterForm-BxYrTEm8.js";import{F as g}from"./rpc-story.fixtures-D5etiLTh.js";import"./preload-helper-CLP1olNy.js";import"./useQuery-xOtqdqeH.js";import"./button-B88NSOe0.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-do6Jc8dp.js";import"./FilterBar-DpBPYw_q.js";import"./floating-ui.react-B1LFNbTF.js";import"./index-Bs9RhWmJ.js";import"./index-3jltqwNg.js";import"./FilterPill-C9Y2AHds.js";import"./Icon-CXYnH2qb.js";import"./Combobox-DkBaY_Zh.js";import"./modalStack-D4VFZXfx.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-Lv5UDAp3.js";import"./DateTimePicker-Cj6dgW4z.js";import"./MultiSelect-CRVxfxy1.js";import"./RangeSlider-DcKpfXwF.js";import"./TimeRange-DmB3zEkS.js";import"./select-C3FKGKpO.js";import"./WorkloadPicker-CWHWM8zu.js";import"./NamespacePicker-qpUVkQSx.js";import"./index-C3MokWFe.js";import"./formMetadata-dUjuveR9.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
