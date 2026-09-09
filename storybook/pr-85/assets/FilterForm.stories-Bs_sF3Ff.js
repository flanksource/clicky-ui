import{j as e,r as l}from"./iframe-BNefQpor.js";import{Q as d}from"./queryClient-5lwNYNzh.js";import{Q as f}from"./suspense-D6SmlCML.js";import{F as c}from"./FilterForm-DqkajNtC.js";import{F as g}from"./rpc-story.fixtures-BRQ7yhu5.js";import"./preload-helper-BvsCWBK3.js";import"./useQuery-Ck6TaFqU.js";import"./button-DzbDFHiG.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-C39MVSz-.js";import"./FilterBar-D8UKqCRR.js";import"./floating-ui.react-CAaUf1g-.js";import"./index-DPbJXMEv.js";import"./index-C0j4VFB1.js";import"./FilterPill-B-I7OT5q.js";import"./Icon-Wyal3cEo.js";import"./Combobox-DQBzXAlP.js";import"./modalStack-Ex--0n26.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-0C9g1z3t.js";import"./DateTimePicker-m-mQGuIY.js";import"./MultiSelect-Bu2fQyw8.js";import"./RangeSlider-C6VyblUQ.js";import"./TimeRange-DZTak6Yo.js";import"./select-C26WemBw.js";import"./WorkloadPicker-HSXtcOtU.js";import"./NamespacePicker-7bVQ8q6w.js";import"./index-DA3YuafW.js";import"./formMetadata-C7cZOP0j.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
