import{j as e,r as l}from"./iframe-DjmuE4jL.js";import{Q as d}from"./queryClient-CT8tLKEt.js";import{Q as f}from"./suspense-TU5RWD39.js";import{F as c}from"./FilterForm-BE6In58g.js";import{F as g}from"./rpc-story.fixtures-Cpnm3tY_.js";import"./preload-helper-CcRYDqr-.js";import"./useQuery-D8ri18i3.js";import"./button-CwDkfInQ.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CIXZB-Vg.js";import"./FilterBar-ChNFoE52.js";import"./floating-ui.react-zKcHaoGq.js";import"./index-DZmA724K.js";import"./index-Bf_L3Tie.js";import"./FilterPill-CDqCSexL.js";import"./Icon-C3mJVtxE.js";import"./Combobox-DRIkcNZT.js";import"./modalStack-gNmWCtk4.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-DPVG7uwk.js";import"./DateTimePicker-bL30AuWP.js";import"./MultiSelect-h7Bnf5jm.js";import"./RangeSlider-Wl4HWB35.js";import"./TimeRange-BZQfu9em.js";import"./select-B4Xau9Ne.js";import"./WorkloadPicker-Drz_yXZ8.js";import"./NamespacePicker-B-63LWhI.js";import"./index-Ity8I7Gl.js";import"./formMetadata-DHBDnzZ7.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
