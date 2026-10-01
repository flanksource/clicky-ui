import{j as r}from"./iframe-CBNX-dQr.js";import{C as e}from"./CommandOutput-B3xnSqWr.js";import{S as R}from"./rpc-story.fixtures-DBO_KIW3.js";import"./preload-helper-DmsBQNJi.js";import"./DataTable-BANoh7hB.js";import"./SortableHeader-DnCrj7oA.js";import"./utils-DW-IJACk.js";import"./loading-I_MdTxAY.js";import"./router-0nPsZ2ZO.js";import"./Modal-DSvZqgbd.js";import"./index-DwHWx2SL.js";import"./index-DwW3fdnJ.js";import"./Icon-Bl13VMM_.js";import"./button-66Jqw29m.js";import"./index-CPURVhFy.js";import"./modalStack-B758Y7Je.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BNP5Tns6.js";import"./floating-ui.react-DfgK1207.js";import"./FilterPill-CC2kjuRK.js";import"./Combobox-ivMDoGSw.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BFylyvG4.js";import"./MultiSelect-_MLhRryG.js";import"./RangeSlider-DONvkWfw.js";import"./TimeRange-BhjfXqGF.js";import"./select-B29bNbT8.js";import"./WorkloadPicker-ClYBbRFx.js";import"./NamespacePicker-CkucAGrR.js";import"./index-B1gmceDA.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-C7xONFEk.js";import"./TagList-CdGzDL5w.js";import"./Badge-CIPnqeY-.js";import"./HoverCard-OVmLfFL1.js";import"./Properties-OIdD6ezx.js";import"./IconButton-BveIQQyE.js";import"./DropdownMenu-D2VkYe4-.js";import"./DropdownMenuSubmenu-vwNEYm-T.js";import"./StatusDot-CgcsW-ID.js";import"./Clicky-C9reM9uD.js";import"./queryClient-DizekrUZ.js";import"./suspense-BSd7Gt8d.js";import"./useQuery-BqJAYGZ5.js";import"./FilterForm-DfNHgdSx.js";import"./formMetadata-CmNQDgZn.js";import"./ErrorDetails-CtmI0Qkl.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-8UkTkEpb.js";import"./TreeNode-CBEsYbJ1.js";import"./ObjectGraph-Bcmum9o0.js";import"./ExecutionTree-DeWhHBL_.js";import"./CodeBlock-zlDOGlq6.js";import"./CodeDiff-DC7UNH_q.js";import"./SegmentedControl-kW-qzHsZ.js";import"./HighlightedTokens-y1sDqrp8.js";import"./JsonView-D-lo88BL.js";import"./RenderedStackTrace-DlAowWOS.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-Bm9ziRFD.js";import"./FrameSourceWindow-H4q7vjLn.js";import"./useDebugAction-WQBIpcC7.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
