import{j as r}from"./iframe-DP177qYv.js";import{C as t}from"./CommandOutput-DZbwD_RW.js";import{S as R}from"./rpc-story.fixtures-BcNUcziJ.js";import"./preload-helper-BZq7nIkI.js";import"./DataTable-CDHJBsgN.js";import"./SortableHeader-GyTSgVTd.js";import"./utils-DW-IJACk.js";import"./loading-BGP2vbyq.js";import"./router-DMz9daZf.js";import"./Modal-BWAlqUsR.js";import"./index-CbIba--f.js";import"./index-D5WrkPBq.js";import"./Icon-CVZO3WAG.js";import"./button-FbNKbbzk.js";import"./index-CPURVhFy.js";import"./modalStack-CD5aSVTc.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-W4upSyAa.js";import"./floating-ui.react-BnsrA79A.js";import"./FilterPill-CB6e5lha.js";import"./filter-bar-multi-Dhujs7ka.js";import"./Combobox-gw5c6cQc.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-4Tx0xEVq.js";import"./MultiSelect-cBIxAEqx.js";import"./RangeSlider-BPH736ua.js";import"./TimeRange-JuQ7yGH5.js";import"./select-DHQIEazy.js";import"./WorkloadPicker-DdJ-TfrN.js";import"./NamespacePicker-Di4Ktcw-.js";import"./index-Kn3cRk9o.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BFpXhYiW.js";import"./TagList-Bb9OtQvs.js";import"./Badge-DkHitohI.js";import"./HoverCard-k2Xsc41N.js";import"./Properties-DzT-zp1x.js";import"./IconButton-ByGG337J.js";import"./DropdownMenu-DauniJQT.js";import"./DropdownMenuSubmenu-pG2iVqTe.js";import"./format-2niohfpq.js";import"./JsonView-euY554sO.js";import"./AccordionList-ae6JTwF6.js";import"./collections-CoHfwOze.js";import"./StatusDot-B6dTc7Ey.js";import"./Clicky-CedrNs-1.js";import"./queryClient-CT4yQ0yn.js";import"./suspense-BnjUTqP5.js";import"./useQuery-InaXTYRx.js";import"./FilterForm-BRAMywU6.js";import"./formMetadata-ChbjaukS.js";import"./operationErrorDiagnostics-Y9fDYGx3.js";import"./ErrorDetails-Cp5tKOq6.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-Dkq9wKMp.js";import"./TreeNode-Qs-FBFgq.js";import"./ObjectGraph-CZtLeq2R.js";import"./ExecutionTree-BypYMOR8.js";import"./CodeBlock-CoYNYiBs.js";import"./CodeDiff-ew4pkH_9.js";import"./SegmentedControl-CmQrpni4.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-F0uKqAH1.js";import"./RenderedStackTrace-BTQVVir_.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BOpHtQhD.js";import"./FrameSourceWindow-OkYlnbvQ.js";import"./useDebugAction-yrnKA18D.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},qr={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(p=e.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    response: TEXT_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var u,x,g;m.parameters={...m.parameters,docs:{...(u=m.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    response: ERROR_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(g=(x=m.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;a.parameters={...a.parameters,docs:{...(E=a.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=a.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const zr=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,a as Loading,e as Table,s as Text,zr as __namedExportsOrder,qr as default};
