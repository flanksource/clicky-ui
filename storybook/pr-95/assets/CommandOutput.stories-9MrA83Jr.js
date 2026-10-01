import{j as r}from"./iframe-Bu8__SiW.js";import{C as e}from"./CommandOutput-BFBNPa1p.js";import{S as R}from"./rpc-story.fixtures-DH6zFw2s.js";import"./preload-helper-DxStcPpW.js";import"./DataTable-Yrd2miiV.js";import"./SortableHeader-MShBO0d9.js";import"./utils-DW-IJACk.js";import"./loading-G9JgtjzI.js";import"./router-O8dQqa_W.js";import"./Modal-D3Yozp4q.js";import"./index-BjG998sX.js";import"./index-ZA4_G-zD.js";import"./Icon-Cn9xrMzj.js";import"./button-IQY09Old.js";import"./index-CPURVhFy.js";import"./modalStack-DAEU9LH6.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DQLgjp52.js";import"./floating-ui.react-Dnwi4P86.js";import"./FilterPill-B_GFjO3W.js";import"./Combobox-C94DycZI.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DZDr_Uy7.js";import"./MultiSelect-Dq18RfF4.js";import"./RangeSlider-DSzGzC4V.js";import"./TimeRange-C1h-uTUr.js";import"./select-BCnAQ7QU.js";import"./WorkloadPicker-Cd0g4vcp.js";import"./NamespacePicker-C0eMJ9qd.js";import"./index-CLaO61pG.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-CyLjbJp5.js";import"./TagList-BpHf-76q.js";import"./Badge-rBPqgJ-m.js";import"./HoverCard-C7tqGV4c.js";import"./Properties-BHhdn87j.js";import"./IconButton-C39yw7zm.js";import"./DropdownMenu-Cc3rFJXx.js";import"./DropdownMenuSubmenu-Bin6sHLc.js";import"./StatusDot-B7j07SYv.js";import"./Clicky-6llQp_9D.js";import"./queryClient-7tQX_ikU.js";import"./suspense-BZTLFXBD.js";import"./useQuery-DF8Qfhcd.js";import"./FilterForm-Cj9kNzDZ.js";import"./formMetadata-DvIcyG7l.js";import"./ErrorDetails-hr4hk-mR.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-1VMmZ1mH.js";import"./TreeNode-DZ7CtkKh.js";import"./ObjectGraph-CYV_5FOB.js";import"./ExecutionTree-30Dt30J7.js";import"./CodeBlock-BBmT3lSS.js";import"./CodeDiff-Cp3irI7w.js";import"./SegmentedControl-BvvnSULS.js";import"./HighlightedTokens-DkxPDs2d.js";import"./JsonView-DQo_bBJV.js";import"./RenderedStackTrace-D4NvtqlP.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BxV4OCYM.js";import"./FrameSourceWindow-C47jydNR.js";import"./useDebugAction-BZSysJIz.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Mr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(p=t.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    response: TEXT_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var u,x,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    response: ERROR_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(g=(x=a.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Xr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Xr as __namedExportsOrder,Mr as default};
