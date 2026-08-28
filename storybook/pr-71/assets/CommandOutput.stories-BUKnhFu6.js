import{j as r}from"./iframe-3CXec11f.js";import{C as e}from"./CommandOutput-CmpoPR5W.js";import{S as R}from"./rpc-story.fixtures-FbLrCB5X.js";import"./preload-helper-CrzHa85r.js";import"./DataTable-B2a1Ilvo.js";import"./SortableHeader-M2LjEmy7.js";import"./utils-DW-IJACk.js";import"./loading-BTxYYGKY.js";import"./Modal-BrFl51T6.js";import"./index-BJpbsvrF.js";import"./index-CG7wiBNd.js";import"./Icon-DCFvXzOv.js";import"./button-BkRWw3IG.js";import"./index-CPURVhFy.js";import"./modalStack-CXwjm3bC.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CNfK_zkf.js";import"./floating-ui.react-DL3NwxeN.js";import"./FilterPill-DY6LgKu-.js";import"./Combobox-O-R5Ib9v.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CDA__RrV.js";import"./MultiSelect-Cg3TZVIf.js";import"./RangeSlider-CS-Rv0l8.js";import"./TimeRange-CypqRhl0.js";import"./select-Cj1blMPx.js";import"./WorkloadPicker-BzPVMy72.js";import"./NamespacePicker-B6Fu4gKy.js";import"./index-BFoJxiKn.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-ByMhV7nj.js";import"./TagList-CbIT7PR2.js";import"./Badge-YSUUGy6Z.js";import"./HoverCard-D5YFs-0b.js";import"./Properties-DfHR-Xiy.js";import"./IconButton-DvdJRRYK.js";import"./DropdownMenu-h8cGY6w4.js";import"./DropdownMenuSubmenu-f4Q2-UAr.js";import"./StatusDot-DLWstdPX.js";import"./Clicky-D5V96FqC.js";import"./queryClient-rKAChWmW.js";import"./suspense-DegV59Un.js";import"./useQuery-MwzBcQml.js";import"./FilterForm-DGjiXAjk.js";import"./formMetadata-hw-qX5q4.js";import"./ErrorDetails-BEWiYUQB.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-CXCnUW7J.js";import"./TreeNode-DvvzBNWy.js";import"./ObjectGraph-CS0VQ5KR.js";import"./ExecutionTree-Ba-n0oDA.js";import"./CodeBlock-BozNxF62.js";import"./CodeDiff-BfuqekgU.js";import"./SegmentedControl-DuM5rShK.js";import"./HighlightedTokens-WnynMO8P.js";import"./JsonView-BZLhIrLE.js";import"./RenderedStackTrace-BbEWzgU5.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-B0k17W3i.js";import"./FrameSourceWindow-CZkEZuLA.js";import"./useDebugAction-4HU1V7kp.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},kr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Lr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Lr as __namedExportsOrder,kr as default};
