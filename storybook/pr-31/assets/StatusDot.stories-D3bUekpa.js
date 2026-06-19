import{j as s}from"./iframe-CmW1bXIL.js";import{S as e}from"./StatusDot-BEKTAprD.js";import"./preload-helper-ByUaG9M2.js";import"./utils-BLSKlp9E.js";const b={title:"Data/Cells/StatusDot",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"A small colored status dot with an optional inline label, for table cells and dense lists. Color maps from the shared `BadgeStatus` palette (success/error/warning/info). The dot carries an accessible name via `aria-label`."}}},argTypes:{status:{control:"inline-radio",options:["success","error","warning","info"]},size:{control:"inline-radio",options:["xs","sm","md"]},label:{control:"text"}},args:{status:"success",size:"sm",label:"Healthy"}},t={},a={render:()=>s.jsxs("div",{className:"flex flex-col gap-2",children:[s.jsx(e,{status:"success",label:"Healthy"}),s.jsx(e,{status:"warning",label:"Degraded"}),s.jsx(e,{status:"error",label:"Down"}),s.jsx(e,{status:"info",label:"Provisioning"})]})},r={args:{label:void 0},render:()=>s.jsxs("div",{className:"flex items-center gap-3",children:[s.jsx(e,{status:"success",size:"xs"}),s.jsx(e,{status:"warning",size:"sm"}),s.jsx(e,{status:"error",size:"md"})]})};var o,n,l;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:"{}",...(l=(n=t.parameters)==null?void 0:n.docs)==null?void 0:l.source}}};var i,c,u;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-2">
      <StatusDot status="success" label="Healthy" />
      <StatusDot status="warning" label="Degraded" />
      <StatusDot status="error" label="Down" />
      <StatusDot status="info" label="Provisioning" />
    </div>
}`,...(u=(c=a.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var d,m,p;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    label: undefined
  },
  render: () => <div className="flex items-center gap-3">
      <StatusDot status="success" size="xs" />
      <StatusDot status="warning" size="sm" />
      <StatusDot status="error" size="md" />
    </div>
}`,...(p=(m=r.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};const S=["Default","AllStatuses","DotOnly"];export{a as AllStatuses,t as Default,r as DotOnly,S as __namedExportsOrder,b as default};
