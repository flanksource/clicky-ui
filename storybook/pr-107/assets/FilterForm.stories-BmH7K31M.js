import{j as e,r as l}from"./iframe-BsAqiW63.js";import{Q as d}from"./queryClient-CGaE9-tu.js";import{Q as f}from"./suspense-yabXK1kN.js";import{F as c}from"./FilterForm-DhcqLpb7.js";import{F as g}from"./rpc-story.fixtures-BYn_LGxv.js";import"./preload-helper-Drww7zV3.js";import"./useQuery-6zyjkH1I.js";import"./button-BtSAOAKJ.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BJEbCWIe.js";import"./FilterBar-BRWLo9rk.js";import"./floating-ui.react-C__wji9y.js";import"./index-DEP2UBhX.js";import"./index-DuXfw_hg.js";import"./FilterPill-Bzw0s4Xn.js";import"./Icon-Dyy6aaqa.js";import"./filter-bar-multi-UjrkZIQp.js";import"./Combobox-BKuWHLhN.js";import"./modalStack-DSQeidlD.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-qlF4Wnfg.js";import"./DateTimePicker-Bx8fiptj.js";import"./MultiSelect-C8zfQc50.js";import"./RangeSlider-DPi11dKG.js";import"./TimeRange-BYkBh0gt.js";import"./select-Dx3dTqXz.js";import"./WorkloadPicker-Bi9tT_P3.js";import"./NamespacePicker-my8PKnLF.js";import"./index-CMSqFLvx.js";import"./formMetadata-CpnEts6N.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const tt={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
}`,...(n=(p=r.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};const rt=["Default","AutoSubmit"];export{r as AutoSubmit,t as Default,rt as __namedExportsOrder,tt as default};
