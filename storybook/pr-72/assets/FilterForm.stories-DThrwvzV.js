import{j as e,r as l}from"./iframe-B_zRd-Wy.js";import{Q as d}from"./queryClient-BFpS-xoJ.js";import{Q as f}from"./suspense-bxjB9gZj.js";import{F as c}from"./FilterForm-Cg1o1FfQ.js";import{F as g}from"./rpc-story.fixtures-CV4uV7jI.js";import"./preload-helper-Dy2teTf6.js";import"./useQuery-CCtr9H10.js";import"./button-DQyvef4I.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CRKXYVmY.js";import"./FilterBar-Bgmi_b2N.js";import"./floating-ui.react-CKuAmzYZ.js";import"./index-5BdIEgAK.js";import"./index-H37-8Ifz.js";import"./FilterPill-DOFYB3hq.js";import"./Icon-CL04iPIR.js";import"./Combobox-DDpl6Soq.js";import"./modalStack-FiA0edkU.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-JwFk0mZw.js";import"./MultiSelect-C1NwdKN8.js";import"./RangeSlider-BqFtwBfK.js";import"./TimeRange-B2g9ujpz.js";import"./select-CG68ntFP.js";import"./WorkloadPicker-Cqn2It_N.js";import"./NamespacePicker-BkFtxwGp.js";import"./index-BJ90KxdW.js";import"./formMetadata-DoFixh3h.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const X={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn()
  }
}`,...(m=(s=t.parameters)==null?void 0:s.docs)==null?void 0:m.source}}};var a,n,p;r.parameters={...r.parameters,docs:{...(a=r.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    autoSubmit: true
  }
}`,...(p=(n=r.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};const Z=["Default","AutoSubmit"];export{r as AutoSubmit,t as Default,Z as __namedExportsOrder,X as default};
