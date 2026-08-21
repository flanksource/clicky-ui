import{j as r}from"./iframe-BDLF7TO0.js";import{C as e}from"./CommandOutput-Bh1ADJkT.js";import{S as R}from"./rpc-story.fixtures-D7YzOPlh.js";import"./preload-helper-BF_8wlrL.js";import"./DataTable-BJilA7LA.js";import"./SortableHeader-CeWH8eZQ.js";import"./utils-DW-IJACk.js";import"./loading-D3aKTI0Y.js";import"./Modal-B7nmnWFm.js";import"./index-CXngi85s.js";import"./index-BP8kaAF2.js";import"./Icon-BDal7uxE.js";import"./button-Cb5LPTTU.js";import"./index-CPURVhFy.js";import"./modalStack-CMHrQiIm.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DTC_960k.js";import"./floating-ui.react-DkCv-4bX.js";import"./FilterPill-DPjjlxWM.js";import"./Combobox-CHlY0KdM.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-metXm2kI.js";import"./MultiSelect-744pe5P7.js";import"./RangeSlider-6VKL7S9T.js";import"./TimeRange-B3mAe4P9.js";import"./select-jpmhfvra.js";import"./WorkloadPicker-Z94XPA_m.js";import"./NamespacePicker-LB-1H6sM.js";import"./index-DwBYdK5E.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-13s17nNz.js";import"./TagList-DUA33C9F.js";import"./Badge-CjNG3eBx.js";import"./HoverCard-B-kXCTZA.js";import"./Properties-C7UVB70g.js";import"./IconButton-Dt4s-XJN.js";import"./DropdownMenu-XRx1Pfl4.js";import"./DropdownMenuSubmenu-DahwybFG.js";import"./StatusDot-AtB9N3y5.js";import"./Clicky-Dx0mnpaJ.js";import"./queryClient-DYDX57j7.js";import"./suspense-DRmJNr13.js";import"./useQuery-BglTLpIY.js";import"./FilterForm-RXlG9-ih.js";import"./formMetadata-hEz3Ixqu.js";import"./ErrorDetails-U42kEtXn.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-DmkAUFIZ.js";import"./TreeNode-BXeIusRf.js";import"./ObjectGraph-BiG1acio.js";import"./ExecutionTree-uRXeAT7q.js";import"./CodeBlock-nZdhvp-F.js";import"./CodeDiff-B93Yb0R8.js";import"./SegmentedControl-D2-9b0Mg.js";import"./HighlightedTokens-CPTfobg6.js";import"./JsonView-Dm77_ZBu.js";import"./RenderedStackTrace-CFEMwe1E.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BL-_KoUP.js";import"./FrameSourceWindow-DVSVr1Tz.js";import"./useQueryInfo-D_nKnZ_P.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},hr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const kr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,kr as __namedExportsOrder,hr as default};
