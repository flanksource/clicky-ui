import{j as r}from"./iframe-CKgGkAV6.js";import{C as t}from"./CommandOutput-DxxOpQA1.js";import{S as R}from"./rpc-story.fixtures-C9wgYSgH.js";import"./preload-helper-D6IOlyYr.js";import"./DataTable-vloyht7y.js";import"./SortableHeader-Ry5ldV7u.js";import"./utils-DW-IJACk.js";import"./loading-CVVM6inm.js";import"./router-BaKFvvG8.js";import"./Modal-CyMxnyK7.js";import"./index-B8WCVke5.js";import"./index-B-AXG8c2.js";import"./Icon-zT9BHEU_.js";import"./button-mYaiNNVw.js";import"./index-CPURVhFy.js";import"./modalStack-TnERC9Dk.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DpLc6Jkd.js";import"./floating-ui.react-DvrmiGRg.js";import"./FilterPill-CvKT4WAZ.js";import"./filter-bar-multi-Dt__OFRf.js";import"./Combobox-Ce8evdZR.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BbQkUMe4.js";import"./MultiSelect-C-Y1qLAG.js";import"./RangeSlider-BaY40EZu.js";import"./TimeRange-j9ZOOMTL.js";import"./select-eS4vf-VP.js";import"./WorkloadPicker-BWVZwiTh.js";import"./NamespacePicker-BlJZooVo.js";import"./index-UgZ8RgH0.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-C0FbbUfZ.js";import"./TagList-DXVHXee-.js";import"./Badge-DNVG-Ar4.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-D6AhenUg.js";import"./Properties-aB4NtyEt.js";import"./IconButton-_EDmsPTs.js";import"./DropdownMenu-BmZ28lfR.js";import"./DropdownMenuSubmenu-j0TnzvxK.js";import"./format-2niohfpq.js";import"./JsonView-CkPnotjI.js";import"./AccordionList-5bOCqJVe.js";import"./collections-CoHfwOze.js";import"./StatusDot-Cc34Nx7R.js";import"./Clicky-2nFWY0Ph.js";import"./queryClient-Br5BOrR2.js";import"./suspense-D4mDBeM9.js";import"./useQuery-NNRuaWcR.js";import"./FilterForm-CmvhooX2.js";import"./formMetadata-DLreaQgB.js";import"./apiClient-CY-NAGGf.js";import"./string-XSKS3ZaR.js";import"./operationErrorDiagnostics-DvSywZ_w.js";import"./ErrorDetails-DMlxh_3W.js";import"./callout-tones-EFt49BYo.js";import"./Tree-BUJ8DGY7.js";import"./TreeNode-Dj6_Ccy_.js";import"./ObjectGraph-f-zHi6xe.js";import"./ExecutionTree-CpXVX8Tb.js";import"./CodeBlock-BLqJHOcq.js";import"./CodeDiff-CUQ4nb-v.js";import"./SegmentedControl-DpwJjHzq.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BWRQ-hT_.js";import"./HighlightedTokens-Dei84GlG.js";import"./RenderedStackTrace-DSlijc9q.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-C6JgP64f.js";import"./FrameSourceWindow-DOFZJrxo.js";import"./useDebugAction-JCfa0EiV.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Br={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=a.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Fr=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,a as Loading,e as Table,s as Text,Fr as __namedExportsOrder,Br as default};
