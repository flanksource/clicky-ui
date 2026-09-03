import{j as e,r as l}from"./iframe-Bh7XXvys.js";import{Q as d}from"./queryClient-CRgoK6JI.js";import{Q as f}from"./suspense-tWEA6GW6.js";import{F as c}from"./FilterForm-C-qHvORC.js";import{F as g}from"./rpc-story.fixtures-Cv0kVsHd.js";import"./preload-helper-DzyrSNK7.js";import"./useQuery-pBlclIxx.js";import"./button-1zr2H7Tt.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BeWAmKFr.js";import"./FilterBar-3lMFXQQv.js";import"./floating-ui.react-Xu8Hg7vD.js";import"./index-C-nyn1b0.js";import"./index-C0HwEZFo.js";import"./FilterPill-CIiFdzIb.js";import"./Icon-HQuVCsfR.js";import"./Combobox-Dqy4m-io.js";import"./modalStack-DDawoPWy.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-VGGZ0I7U.js";import"./DateTimePicker-BJMa9STX.js";import"./MultiSelect-BqC7o387.js";import"./RangeSlider-C28wew7s.js";import"./TimeRange-C2Z1N2l8.js";import"./select-hUFPpv4L.js";import"./WorkloadPicker-Cj6P2Klu.js";import"./NamespacePicker-DYx6ydHc.js";import"./index-B4y0mzWG.js";import"./formMetadata-D7cj57KT.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
