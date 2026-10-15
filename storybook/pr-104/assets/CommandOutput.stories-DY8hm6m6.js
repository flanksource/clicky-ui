import{j as r}from"./iframe-BpsZ2AnK.js";import{C as t}from"./CommandOutput-eEVniy4h.js";import{S as R}from"./rpc-story.fixtures-CEMbMmXM.js";import"./preload-helper-MsDOuF3K.js";import"./DataTable-CPkzPLEv.js";import"./SortableHeader-CdO7PAmn.js";import"./utils-DW-IJACk.js";import"./loading-Ds2q6m_u.js";import"./router-D1DUL_L1.js";import"./Modal--V1JkUP_.js";import"./index-LhoKR5ZD.js";import"./index-DBpM0zUQ.js";import"./Icon-nPi6h081.js";import"./button-Zee-1TPK.js";import"./index-CPURVhFy.js";import"./modalStack-CrzPtMDv.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DTePjmny.js";import"./floating-ui.react-B4WvYE6p.js";import"./FilterPill-D1QT-mQn.js";import"./filter-bar-multi-CZ5GAuNj.js";import"./Combobox-C062J8HP.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DXF5Age6.js";import"./MultiSelect-GZgKEjD2.js";import"./RangeSlider-9quJMnq0.js";import"./TimeRange-DaklAFvp.js";import"./select-DmfR8ats.js";import"./WorkloadPicker-KCxpU1_j.js";import"./NamespacePicker-BgJ3RleN.js";import"./index-CwCz_U_4.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Chjjtz-D.js";import"./TagList-Sfb7TRSR.js";import"./Badge-CbddDVTn.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-BgdB6aXQ.js";import"./Properties-DDW0uDBy.js";import"./IconButton-D62I1GKu.js";import"./DropdownMenu-BbLBG52q.js";import"./DropdownMenuSubmenu-bIAIsBPN.js";import"./format-2niohfpq.js";import"./JsonView-Bc5NK7ov.js";import"./AccordionList-C_UQ-gQM.js";import"./collections-CoHfwOze.js";import"./StatusDot-NaMDlRGc.js";import"./Clicky-wffcCAgD.js";import"./queryClient-SrqSI2W3.js";import"./suspense-C72y7OJM.js";import"./useQuery-C8UHSaRz.js";import"./FilterForm-DK6OCTJc.js";import"./formMetadata-5-a_DJn3.js";import"./operationErrorDiagnostics-CJVLBJqI.js";import"./ErrorDetails-B_TdFtvL.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-CpaciHai.js";import"./TreeNode-CGkFCcsE.js";import"./ObjectGraph-1bdTGvdg.js";import"./ExecutionTree-BeBdoCKG.js";import"./CodeBlock-CrYxM6ZO.js";import"./CodeDiff-BGrQjjUl.js";import"./SegmentedControl-BUwYYoDm.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-CTIWcVCe.js";import"./HighlightedTokens-DtZaJN20.js";import"./RenderedStackTrace-CAX_FZTF.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DNIXko3S.js";import"./FrameSourceWindow-QbmEmYvt.js";import"./useDebugAction-BswdUBxY.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},zr={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=a.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Br=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,a as Loading,e as Table,s as Text,Br as __namedExportsOrder,zr as default};
