import{j as e,r as l}from"./iframe-CyxCReIN.js";import{Q as d}from"./queryClient-oQx7fs2g.js";import{Q as f}from"./suspense-BFUvbtfZ.js";import{F as c}from"./FilterForm-_C1EPZH7.js";import{F as g}from"./rpc-story.fixtures-C2UEUBiE.js";import"./preload-helper-CcRYDqr-.js";import"./useQuery-DTueS3mB.js";import"./button-DJHVQAtF.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BjMuVtzF.js";import"./FilterBar-BlW3EBi1.js";import"./floating-ui.react-CRn3EQ6Q.js";import"./index-B_nLbyow.js";import"./index-D2DBLvBJ.js";import"./FilterPill-Wl0EfThz.js";import"./Icon-DjRCcNb6.js";import"./Combobox-BuZoOMU4.js";import"./modalStack-CVif_cxP.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-DmP5tSFH.js";import"./DateTimePicker-RJRT6Aov.js";import"./MultiSelect-XYzUrmey.js";import"./RangeSlider-Doy3eAUN.js";import"./TimeRange-NMlxqe7N.js";import"./select-BNxmB0s_.js";import"./WorkloadPicker-FcwurbaN.js";import"./NamespacePicker-Dj84hLOC.js";import"./index-oOn8ZiEy.js";import"./formMetadata-BD7aOhq_.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
