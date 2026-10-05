import{j as e,r as l}from"./iframe-yuMqpJhb.js";import{Q as d}from"./queryClient-FhgaZrfW.js";import{Q as f}from"./suspense-BawmdS-P.js";import{F as c}from"./FilterForm-DZKTct8-.js";import{F as g}from"./rpc-story.fixtures-DsDRx-br.js";import"./preload-helper-DxStcPpW.js";import"./useQuery-B77b418i.js";import"./button-FFEDo1GN.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-C6QaURdm.js";import"./FilterBar-C0zU87ot.js";import"./floating-ui.react-DiVVYB8B.js";import"./index-CKljaMc-.js";import"./index-Ca38k3Ve.js";import"./FilterPill-D01PQpRY.js";import"./Icon-DbERJsbC.js";import"./Combobox-BWMTt1c4.js";import"./modalStack-CC6_3ego.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-CvmmoTwj.js";import"./DateTimePicker-D6erpvXq.js";import"./MultiSelect-CWHNK50W.js";import"./RangeSlider-iJULwvbw.js";import"./TimeRange-Cahel21p.js";import"./select-C6IyLzeu.js";import"./WorkloadPicker-B77oOyGf.js";import"./NamespacePicker-BCrELL6P.js";import"./index-DZYJBkUd.js";import"./formMetadata-Bj8XScqz.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
