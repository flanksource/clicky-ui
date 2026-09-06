import{j as e,r as l}from"./iframe-psk4-kN7.js";import{Q as d}from"./queryClient-BRem-Spp.js";import{Q as f}from"./suspense-CTQZLh5T.js";import{F as c}from"./FilterForm-sz-aFGM5.js";import{F as g}from"./rpc-story.fixtures-Dt58kDRs.js";import"./preload-helper-DUVrmzNZ.js";import"./useQuery-DZQopt6K.js";import"./button-CPGxxxwO.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-D0L0VhvC.js";import"./FilterBar-DNhgPy1r.js";import"./floating-ui.react-BIHz11iz.js";import"./index-DdkbI2pk.js";import"./index-Q2ctqHt2.js";import"./FilterPill-VYWKOgBB.js";import"./Icon-CGpuyfCp.js";import"./Combobox-CcosoLNL.js";import"./modalStack-BlX58fkl.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-DAN5RH3G.js";import"./DateTimePicker-Bjum2p3t.js";import"./MultiSelect-DS9XvU5V.js";import"./RangeSlider-DovUWp52.js";import"./TimeRange-B8QBymtq.js";import"./select-CycYSFvd.js";import"./WorkloadPicker-D8qZOb9h.js";import"./NamespacePicker-BUiSk4Ph.js";import"./index-DPRIgtOH.js";import"./formMetadata-iJKzMo8W.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
