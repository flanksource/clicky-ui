import{j as r}from"./iframe-CcPM-cPW.js";import{C as t}from"./CommandOutput-C4c_7cM_.js";import{S as R}from"./rpc-story.fixtures-Coe2RX_c.js";import"./preload-helper-BZq7nIkI.js";import"./DataTable-CkEynxph.js";import"./SortableHeader-BKZ7YSeR.js";import"./utils-DW-IJACk.js";import"./loading-pjmE4eTk.js";import"./router-CpR4FexT.js";import"./Modal-DrkQQzUz.js";import"./index-xfq7uwHx.js";import"./index-BVhCjt6c.js";import"./Icon-D84fH81s.js";import"./button-DdaTwSNy.js";import"./index-CPURVhFy.js";import"./modalStack-C4aKQWQ1.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-ghwHc7D0.js";import"./floating-ui.react-GwnkJcwj.js";import"./FilterPill-D8pQ_BuF.js";import"./filter-bar-multi-CvK92PIL.js";import"./Combobox-C_e4HsYa.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BMsoOg_C.js";import"./MultiSelect-LzxeXiya.js";import"./RangeSlider-CpPYdDgK.js";import"./TimeRange-B6CsjMiq.js";import"./select-BnIy5PYa.js";import"./WorkloadPicker-BVtLwdzA.js";import"./NamespacePicker-A0D_Lg32.js";import"./index-BBGaLmv4.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Dj0jfJ1t.js";import"./TagList-B4szgliU.js";import"./Badge-nx-gzT-b.js";import"./HoverCard-BIoavLKo.js";import"./Properties-DGpFuxwE.js";import"./IconButton-C1RFRrox.js";import"./DropdownMenu-HxHzTLAX.js";import"./DropdownMenuSubmenu-0DvJxnuF.js";import"./format-2niohfpq.js";import"./JsonView-BXn53cW-.js";import"./AccordionList-ClKkjR3g.js";import"./collections-CoHfwOze.js";import"./StatusDot-B-CXPWhE.js";import"./Clicky-geLqYCyn.js";import"./queryClient-DJf7qxGH.js";import"./suspense-jk_myeOr.js";import"./useQuery-DPUdJ1iR.js";import"./FilterForm-xsUOcw9Y.js";import"./formMetadata-Co5NnZOZ.js";import"./operationErrorDiagnostics-C5DvA0mk.js";import"./ErrorDetails-BnxKBZFT.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-0MNtHW4W.js";import"./TreeNode-CVevEcMY.js";import"./ObjectGraph-D94wvVj_.js";import"./ExecutionTree-DVJVmZAq.js";import"./CodeBlock-DBgncu36.js";import"./CodeDiff-CzMvQzR6.js";import"./SegmentedControl-C1m4tpZ9.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-BJmABRuJ.js";import"./RenderedStackTrace-BgWVCtbX.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-piS_3YA8.js";import"./FrameSourceWindow-BPxZjeEO.js";import"./useDebugAction-D5jZyZZv.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
